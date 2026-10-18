import { animate, utils } from 'animejs';
import { playBlow } from '../lib/sound.js';
import '../styles/blow.css';

const MIN_SWING = 14; // px a swing has to travel before a direction change counts
const REVERSALS = 4; // direction changes needed...
const WINDOW_MS = 700; // ...within this time
const COOLDOWN_MS = 1500;

// Feed it pointer x positions while dragging; it returns true once when the user shakes hard enough.
export function createShakeDetector() {
  let anchorX = null;
  let dir = 0;
  let reversals = [];
  let lastFire = 0;

  return {
    reset() {
      anchorX = null;
      dir = 0;
      reversals = [];
    },
    update(x) {
      const now = performance.now();
      if (anchorX === null) anchorX = x;
      const delta = x - anchorX;
      if (Math.abs(delta) < MIN_SWING) return false;

      const newDir = Math.sign(delta);
      if (dir !== 0 && newDir !== dir) reversals.push(now);
      dir = newDir;
      anchorX = x;
      reversals = reversals.filter((t) => now - t < WINDOW_MS);

      if (reversals.length >= REVERSALS && now - lastFire > COOLDOWN_MS) {
        lastFire = now;
        reversals = [];
        return true;
      }
      return false;
    },
  };
}

// The classic fix for a cartridge that won't boot: blow on the pins. Dust puffs out, cartridge is marked clean.
export function blowOn(cart) {
  cart.dataset.blown = '1';
  playBlow();

  const r = cart.getBoundingClientRect();
  const originX = r.left + r.width / 2;
  const originY = r.bottom - 8;

  const layer = document.createElement('div');
  layer.className = 'puff-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.style.left = `${originX}px`;
  layer.style.top = `${originY}px`;

  for (let i = 0; i < 14; i++) {
    const dot = document.createElement('i');
    dot.className = 'puff';
    const size = utils.random(6, 16);
    dot.style.width = dot.style.height = `${size}px`;
    layer.append(dot);
    animate(dot, {
      translateX: utils.random(-70, 70),
      translateY: utils.random(10, 80),
      scale: [0.4, utils.random(1, 1.8, 1)],
      opacity: [0.9, 0],
      duration: utils.random(500, 900),
      ease: 'outQuad',
    });
  }

  const label = document.createElement('span');
  label.className = 'puff-label pixel';
  label.textContent = 'fffhhh!';
  layer.append(label);
  animate(label, { translateY: [0, -30], opacity: [1, 0], duration: 1100, ease: 'outQuad' });

  document.body.append(layer);
  setTimeout(() => layer.remove(), 1200);
}
