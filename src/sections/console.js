import { animate, utils } from 'animejs';
import { projects } from '../data/projects.js';
import { playInsert, playEject } from '../lib/sound.js';
import '../styles/console.css';

const TILTS = [-6, 4, -2, 7, -5];
const DRAG_THRESHOLD = 6; // px of movement before a press counts as a drag instead of a click
const INSERT_DEPTH = 0.58; // how much of the cartridge disappears into the slot

// Step 4: drag a cartridge into the slot (or click it) to insert; click the inserted one to eject.
// Steps 5-6 react to the 'cartridge:inserted' event with the screen intro and the blow easter egg.
export function renderConsole(el) {
  el.classList.add('console-section');
  el.innerHTML = `
    <header class="console-head">
      <h2 class="pixel">Pick a cartridge</h2>
      <p>Drag one into the slot on top of the console, or just click it.</p>
    </header>
    <div class="desk">
      <div class="cart-tray">
        ${projects.map(cartridge).join('')}
      </div>
      ${handheld()}
    </div>
  `;

  const handheldEl = el.querySelector('.handheld');
  const slot = el.querySelector('.handheld-slot');
  const screen = el.querySelector('.handheld-screen');
  let inserted = null;
  let locked = false; // true while an insert/eject animation runs, so a second click can't start a race

  el.querySelectorAll('.cart').forEach((cart, i) => {
    cart.dataset.tilt = TILTS[i % TILTS.length];
    utils.set(cart, { translateX: 0, translateY: 0, rotate: Number(cart.dataset.tilt) });
    enableDrag(cart);
  });

  window.addEventListener('resize', () => {
    if (inserted) utils.set(inserted, slotTarget(inserted, true));
  });

  function enableDrag(cart) {
    let start = null;
    let dragging = false;

    cart.addEventListener('pointerdown', (e) => {
      if (cart === inserted || cart.classList.contains('busy')) return;
      start = {
        x: e.clientX,
        y: e.clientY,
        tx: utils.get(cart, 'translateX', false),
        ty: utils.get(cart, 'translateY', false),
      };
      dragging = false;
      cart.setPointerCapture(e.pointerId);
    });

    cart.addEventListener('pointermove', (e) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (!dragging) {
        dragging = true;
        cart.classList.add('dragging');
        animate(cart, { rotate: 0, scale: 1.06, duration: 150, ease: 'outQuad' });
      }
      utils.set(cart, { translateX: start.tx + dx, translateY: start.ty + dy });
    });

    cart.addEventListener('pointerup', () => {
      if (!start) return;
      start = null;
      if (!dragging) return; // a plain click; handled by the click listener below
      cart.classList.remove('dragging');
      cart.dataset.justDragged = '1';
      if (!locked && overlaps(cart, handheldEl)) insert(cart);
      else sendHome(cart);
    });

    cart.addEventListener('click', () => {
      if (cart.dataset.justDragged) {
        delete cart.dataset.justDragged;
        return;
      }
      if (locked || cart.classList.contains('busy')) return;
      if (cart === inserted) eject();
      else insert(cart);
    });
  }

  async function insert(cart) {
    locked = true;
    if (inserted) await eject({ keepLock: true });
    inserted = cart;
    cart.classList.add('busy', 'in-slot');

    // Hover above the slot, then push down into it.
    await animate(cart, {
      ...slotTarget(cart, false),
      rotate: 0,
      scale: 1,
      duration: 420,
      ease: 'outCubic',
    });
    await animate(cart, { ...slotTarget(cart, true), duration: 160, ease: 'inQuad' });
    playInsert();
    animate(handheldEl, { translateY: [0, 4, 0], duration: 180, ease: 'outQuad' });

    cart.classList.remove('busy');
    locked = false;
    cart.setAttribute('aria-pressed', 'true');
    handheldEl.classList.add('powered');
    const project = projects.find((p) => p.id === cart.dataset.id);
    screen.innerHTML = `<p class="screen-title pixel">${project.title}</p>`;
    el.dispatchEvent(new CustomEvent('cartridge:inserted', { detail: project, bubbles: true }));
  }

  async function eject({ keepLock = false } = {}) {
    const cart = inserted;
    if (!cart) return;
    locked = true;
    inserted = null;
    cart.classList.add('busy');
    handheldEl.classList.remove('powered');
    screen.innerHTML = `<p class="screen-idle pixel">INSERT<br />CARTRIDGE</p>`;
    playEject();
    await animate(cart, { ...slotTarget(cart, false), duration: 200, ease: 'outQuad' });
    await sendHome(cart);
    cart.setAttribute('aria-pressed', 'false');
    if (!keepLock) locked = false;
    el.dispatchEvent(new CustomEvent('cartridge:ejected', { bubbles: true }));
  }

  function sendHome(cart) {
    cart.classList.add('busy');
    return animate(cart, {
      translateX: 0,
      translateY: 0,
      rotate: Number(cart.dataset.tilt),
      scale: 1,
      duration: 650,
      ease: 'outElastic(1, .7)',
    }).then(() => cart.classList.remove('busy', 'in-slot'));
  }

  // Translation that puts the cartridge's center over the slot; `seated` pushes it down into the slot.
  function slotTarget(cart, seated) {
    const tx = utils.get(cart, 'translateX', false);
    const ty = utils.get(cart, 'translateY', false);
    const c = cart.getBoundingClientRect();
    const s = slot.getBoundingClientRect();
    // The bounding box center ignores rotation and scale, so subtracting the current translate gives the resting center.
    const baseX = c.left + c.width / 2 - tx;
    const baseY = c.top + c.height / 2 - ty;
    const h = cart.offsetHeight;
    const hoverY = s.top - h / 2 - 6;
    const y = seated ? hoverY + h * INSERT_DEPTH : hoverY;
    return { translateX: s.left + s.width / 2 - baseX, translateY: y - baseY };
  }
}

function overlaps(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();
  return r1.right > r2.left && r1.left < r2.right && r1.bottom > r2.top && r1.top < r2.bottom;
}

function cartridge(project) {
  return `
    <button class="cart" type="button" data-id="${project.id}"
      style="--cart-color: ${project.color}"
      aria-pressed="false"
      aria-label="${project.title} cartridge">
      <span class="cart-grip" aria-hidden="true"></span>
      <span class="cart-label">
        <span class="cart-title pixel">${project.title}</span>
        <span class="cart-stack">${project.stack.join(' · ')}</span>
      </span>
      <span class="cart-pins" aria-hidden="true"></span>
    </button>
  `;
}

function handheld() {
  return `
    <div class="handheld" aria-label="Handheld console">
      <div class="handheld-slot" aria-hidden="true"></div>
      <div class="handheld-bezel">
        <span class="handheld-led" aria-hidden="true"></span>
        <div class="handheld-screen" aria-live="polite">
          <p class="screen-idle pixel">INSERT<br />CARTRIDGE</p>
        </div>
        <p class="handheld-brand pixel">UTK-8 <span>POCKET</span></p>
      </div>
      <div class="handheld-controls" aria-hidden="true">
        <div class="dpad"><span></span><span></span></div>
        <div class="face-buttons">
          <span class="face-btn">X</span>
          <span class="face-btn">O</span>
        </div>
      </div>
      <div class="handheld-bottom" aria-hidden="true">
        <div class="pill-buttons"><span></span><span></span></div>
        <div class="speaker">${'<i></i>'.repeat(8)}</div>
      </div>
    </div>
  `;
}
