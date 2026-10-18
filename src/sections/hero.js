import { animate, stagger } from 'animejs';
import { profile } from '../data/profile.js';
import { playStart } from '../lib/sound.js';
import '../styles/hero.css';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function renderHero(el) {
  el.classList.add('hero');
  el.innerHTML = `
    <p class="hero-badge pixel">&#9654; PLAYER 1 READY</p>
    <h1 class="hero-title pixel"><span class="hero-typed"></span><span class="cursor"></span></h1>
    <p class="hero-role">I <span class="hero-role-word"></span><span class="cursor cursor-thin"></span></p>
    <p class="hero-about">${profile.about}</p>
    <a class="hero-start pixel" href="#console">PRESS START &#9660;</a>
  `;

  el.querySelector('.hero-start').addEventListener('click', pressStart);

  const title = el.querySelector('.hero-typed');
  const role = el.querySelector('.hero-role-word');
  const fadeIns = el.querySelectorAll('.hero-badge, .hero-role, .hero-about, .hero-start');

  if (reducedMotion) {
    title.textContent = profile.greeting;
    role.textContent = profile.roles[0];
    return;
  }

  fadeIns.forEach((node) => (node.style.opacity = 0));
  animate(el.querySelector('.hero-badge'), { opacity: [0, 1], duration: 400, ease: 'outQuad' });

  typeText(title, profile.greeting, 70).then(() => {
    // Only one blinking cursor at a time: it moves down to the role line.
    el.querySelector('.hero-title .cursor').remove();
    animate([...fadeIns].slice(1), {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 600,
      delay: stagger(140),
      ease: 'outQuad',
    });
    cycleRoles(role, profile.roles);
  });
}

async function typeText(node, text, speed) {
  for (const char of text) {
    node.textContent += char;
    await sleep(speed);
  }
}

// Types a role, waits, deletes it, moves to the next one. Runs forever.
async function cycleRoles(node, roles) {
  for (let i = 0; ; i = (i + 1) % roles.length) {
    await typeText(node, roles[i], 55);
    await sleep(1800);
    while (node.textContent.length > 0) {
      node.textContent = node.textContent.slice(0, -1);
      await sleep(28);
    }
    await sleep(300);
  }
}

// Retro "PRESS START": blip, fast blink, then an eased scroll down to the console instead of a hard jump.
async function pressStart(e) {
  e.preventDefault();
  const link = e.currentTarget;
  const target = document.querySelector(link.getAttribute('href'));
  if (reducedMotion) return target.scrollIntoView();

  playStart();
  link.classList.add('pressed');
  await sleep(450);
  link.classList.remove('pressed');
  smoothScrollTo(target.getBoundingClientRect().top + window.scrollY - 24, 900);
}

function smoothScrollTo(y, duration) {
  const startY = window.scrollY;
  const distance = y - startY;
  const t0 = performance.now();
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // inOutCubic
  function step(now) {
    const t = Math.min((now - t0) / duration, 1);
    window.scrollTo(0, startY + distance * ease(t));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
