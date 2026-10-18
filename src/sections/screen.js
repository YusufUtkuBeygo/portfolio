import { createTimeline, stagger } from 'animejs';
import { playBoot } from '../lib/sound.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const GRID = 5;
let run = 0; // bumps on every boot/idle so an old intro stops touching the screen after an eject

export function idleScreen(screen) {
  run++;
  screen.innerHTML = `<p class="screen-idle pixel">INSERT<br />CARTRIDGE</p>`;
}

// Boot intro: flash, pixel icon builds from the center, title, loading bar, then a start button.
// A cartridge that was blown on first (step 6) also shows a "dust cleared" line.
export async function bootScreen(screen, project, onStart, { blown = false } = {}) {
  const id = ++run;
  screen.innerHTML = `
    <div class="boot" style="--cart-color: ${project.color}">
      <div class="boot-flash"></div>
      <div class="boot-icon" aria-hidden="true">${pixelIcon(project.id)}</div>
      <p class="boot-title pixel">${project.title}</p>
      <div class="boot-bar" aria-hidden="true"><span></span></div>
      ${blown ? '<p class="boot-clean pixel">DUST CLEARED &#10003;</p>' : ''}
      <button class="boot-start pixel" type="button">PRESS O &#9654;</button>
    </div>
  `;
  const start = screen.querySelector('.boot-start');
  start.addEventListener('click', onStart);

  if (reducedMotion) {
    screen.querySelector('.boot-bar span').style.width = '100%';
    screen.querySelector('.boot-flash').remove();
    return;
  }

  start.style.visibility = 'hidden';
  playBoot();
  const tl = createTimeline({ defaults: { ease: 'outQuad' } });
  tl.add(screen.querySelector('.boot-flash'), { opacity: [1, 0], duration: 260 })
    .add(
      screen.querySelectorAll('.boot-icon i.on'),
      { scale: [0, 1], duration: 220, delay: stagger(22, { grid: [GRID, GRID], from: 'center' }) },
      '-=120',
    )
    .add(screen.querySelector('.boot-title'), { opacity: [0, 1], translateY: [6, 0], duration: 260 })
    .add(screen.querySelector('.boot-bar span'), { width: ['0%', '100%'], duration: 700, ease: 'steps(10)' });
  await tl;

  if (id !== run) return;
  start.style.visibility = 'visible';
  start.classList.add('ready');
}

// Identicon-style 5x5 icon: left half derived from the project id, mirrored to the right.
function pixelIcon(seed) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cells = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const mx = x < 3 ? x : GRID - 1 - x;
      const on = (h >> (y * 3 + mx)) & 1;
      cells.push(`<i class="${on ? 'on' : ''}"></i>`);
    }
  }
  return cells.join('');
}
