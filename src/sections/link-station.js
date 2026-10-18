import { animate, utils } from 'animejs';
import { socials } from '../data/socials.js';
import { socialIconSrc } from '../lib/social-icons.js';
import { playInsert, playDial, playEject } from '../lib/sound.js';
import '../styles/link-station.css';

const TILTS = [5, -4, 3, -6, 4];
const DRAG_THRESHOLD = 6;
const INSERT_DEPTH = 0.62;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Second machine: drop a floppy into the Link Station and it "dials up" that account.
export function renderLinkStation(el) {
  // Every account gets a disk; ones without a url yet just answer "NO SIGNAL".
  const accounts = socials;
  el.innerHTML = `
    <div class="link-desk">
      <div class="floppy-tray">${accounts.map(floppy).join('')}</div>
      ${station()}
    </div>
  `;

  const stationEl = el.querySelector('.station');
  const slot = el.querySelector('.station-slot');
  const screen = el.querySelector('.station-screen');
  let locked = false;

  el.querySelectorAll('.floppy').forEach((disk, i) => {
    disk.dataset.tilt = TILTS[i % TILTS.length];
    utils.set(disk, { translateX: 0, translateY: 0, rotate: Number(disk.dataset.tilt) });
    enableDrag(disk);
  });

  function enableDrag(disk) {
    let start = null;
    let dragging = false;

    disk.addEventListener('pointerdown', (e) => {
      if (locked) return;
      start = {
        x: e.clientX,
        y: e.clientY,
        tx: utils.get(disk, 'translateX', false),
        ty: utils.get(disk, 'translateY', false),
      };
      dragging = false;
      disk.setPointerCapture(e.pointerId);
    });

    disk.addEventListener('pointermove', (e) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (!dragging) {
        dragging = true;
        disk.classList.add('dragging');
        animate(disk, { rotate: 0, scale: 1.06, duration: 150, ease: 'outQuad' });
      }
      utils.set(disk, { translateX: start.tx + dx, translateY: start.ty + dy });
    });

    disk.addEventListener('pointerup', () => {
      if (!start) return;
      start = null;
      if (!dragging) return;
      disk.classList.remove('dragging');
      disk.dataset.justDragged = '1';
      if (!locked && overlaps(disk, stationEl)) connect(disk);
      else sendHome(disk);
    });

    disk.addEventListener('click', () => {
      if (disk.dataset.justDragged) {
        delete disk.dataset.justDragged;
        return;
      }
      if (!locked) connect(disk);
    });
  }

  // Insert → dial-up screen → open the account → eject the disk back to the desk.
  async function connect(disk) {
    locked = true;
    const account = accounts.find((a) => a.id === disk.dataset.id);
    disk.classList.add('in-slot');

    await animate(disk, { ...slotTarget(disk, false), rotate: 0, scale: 1, duration: 400, ease: 'outCubic' });
    await animate(disk, { ...slotTarget(disk, true), duration: 150, ease: 'inQuad' });
    playInsert();

    if (!account.url) {
      screen.innerHTML = `<p class="station-line station-error pixel">NO SIGNAL<br />LINK SOON</p>`;
      await sleep(1400);
      await ejectHome(disk);
      return;
    }

    if (account.url.startsWith('mailto:')) {
      await showEmail(account);
      await ejectHome(disk);
      return;
    }

    stationEl.classList.add('online');

    screen.innerHTML = `
      <p class="station-line pixel">DIALING ${account.label.toUpperCase()}</p>
      <p class="station-dots pixel" aria-hidden="true"></p>
    `;
    playDial();
    const dots = screen.querySelector('.station-dots');
    for (let i = 0; i < 8; i++) {
      dots.textContent += '■';
      await sleep(110);
    }
    screen.innerHTML = `<p class="station-line pixel">CONNECTED &#10003;</p>`;
    await sleep(250);

    const opened = openAccount(account);
    if (!opened) {
      // Popup blocked: leave a real link on the screen for the visitor to click.
      screen.innerHTML = `<a class="station-open pixel" href="${account.url}" target="_blank" rel="noopener">OPEN &#9654;</a>`;
    }

    await sleep(opened ? 900 : 2500);
    await ejectHome(disk);
  }

  // Email: a mailto link does nothing on computers without a mail app, so show the address and copy it instead.
  async function showEmail(account) {
    const address = account.url.replace('mailto:', '');
    let copied = false;
    try {
      await navigator.clipboard.writeText(address);
      copied = true;
    } catch {
      // Clipboard can be blocked; the address stays readable on screen either way.
    }
    screen.innerHTML = `
      <p class="station-line station-mail pixel">${address}</p>
      <p class="station-line pixel">${copied ? 'COPIED &#10003;' : 'WRITE IT DOWN'}</p>
      <a class="station-open pixel" href="${account.url}">MAIL APP &#9654;</a>
    `;
    await sleep(4500);
  }

  async function ejectHome(disk) {
    playEject();
    stationEl.classList.remove('online');
    await animate(disk, { ...slotTarget(disk, false), duration: 200, ease: 'outQuad' });
    await sendHome(disk);
    disk.classList.remove('in-slot');
    screen.innerHTML = idleText();
    locked = false;
  }

  function sendHome(disk) {
    return animate(disk, {
      translateX: 0,
      translateY: 0,
      rotate: Number(disk.dataset.tilt),
      scale: 1,
      duration: 650,
      ease: 'outElastic(1, .7)',
    });
  }

  function slotTarget(disk, seated) {
    const tx = utils.get(disk, 'translateX', false);
    const ty = utils.get(disk, 'translateY', false);
    const d = disk.getBoundingClientRect();
    const s = slot.getBoundingClientRect();
    const baseX = d.left + d.width / 2 - tx;
    const baseY = d.top + d.height / 2 - ty;
    const h = disk.offsetHeight;
    const hoverY = s.top - h / 2 - 6;
    return {
      translateX: s.left + s.width / 2 - baseX,
      translateY: (seated ? hoverY + h * INSERT_DEPTH : hoverY) - baseY,
    };
  }
}

function openAccount(account) {
  if (account.url.startsWith('mailto:')) {
    window.location.href = account.url;
    return true;
  }
  // No 'noopener' feature here: with it, window.open always returns null and we couldn't detect a blocked popup.
  const win = window.open(account.url, '_blank');
  if (win) win.opener = null;
  return Boolean(win);
}

function overlaps(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();
  return r1.right > r2.left && r1.left < r2.right && r1.bottom > r2.top && r1.top < r2.bottom;
}

// A file from public/ (served under Vite's base path) wins over the drawn icon.
const iconFor = (a) => (a.iconSrc ? import.meta.env.BASE_URL + a.iconSrc : socialIconSrc(a.id));

const idleText = () => `<p class="station-line pixel">INSERT<br />DISK</p>`;

function floppy(account) {
  return `
    <button class="floppy" type="button" data-id="${account.id}"
      style="--disk-color: ${account.color}"
      aria-label="Open ${account.label}${account.handle ? ` (${account.handle})` : ''}">
      <span class="floppy-shutter" aria-hidden="true"><span></span></span>
      <span class="floppy-label">
        <img class="floppy-icon${account.iconSrc ? ' custom' : ''}" src="${iconFor(account)}" alt="" width="32" height="32" />
        <span class="floppy-name pixel">${account.label}</span>
      </span>
    </button>
  `;
}

function station() {
  return `
    <div class="station" aria-label="Link Station">
      <div class="station-slot" aria-hidden="true"></div>
      <div class="station-face">
        <div class="station-screen" aria-live="polite">${idleText()}</div>
        <div class="station-side" aria-hidden="true">
          <span class="station-led"></span>
          <div class="station-grille">${'<i></i>'.repeat(6)}</div>
        </div>
      </div>
      <p class="station-brand pixel">UTK LINK STATION <span>56K</span></p>
    </div>
  `;
}
