import { animate, stagger } from 'animejs';
import { projects } from '../data/projects.js';
import { pixelIcon } from '../lib/pixel-icon.js';
import '../styles/projects.css';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Plain, scannable list of the same projects for visitors who skip the console.
export function renderProjects(el) {
  el.classList.add('projects-section');
  el.innerHTML = `
    <h2 class="pixel">Projects</h2>
    <p class="projects-lead">The same cartridges, without the game.</p>
    <div class="project-grid">${projects.map(card).join('')}</div>
  `;

  // "Play" scrolls up and asks the console to insert that cartridge.
  el.querySelectorAll('[data-play]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector('#console').scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.dispatchEvent(new CustomEvent('cartridge:request', { detail: btn.dataset.play }));
    });
  });

  revealOnScroll(el.querySelectorAll('.project-card'));
}

function card(p) {
  const links = [
    p.repo && `<a href="${p.repo}" target="_blank" rel="noopener">Code &#8599;</a>`,
    p.demo && `<a href="${p.demo}" target="_blank" rel="noopener">Demo &#8599;</a>`,
  ].filter(Boolean);

  return `
    <article class="project-card" style="--cart-color: ${p.color}">
      <div class="project-top">
        <div class="project-icon" aria-hidden="true">${pixelIcon(p.id)}</div>
        <h3 class="pixel">${p.title}</h3>
      </div>
      <p class="project-summary">${p.summary}</p>
      <ul class="project-stack">${p.stack.map((s) => `<li>${s}</li>`).join('')}</ul>
      <div class="project-actions">
        <button type="button" class="project-play pixel" data-play="${p.id}">&#9654; Play</button>
        ${links.join('')}
      </div>
    </article>
  `;
}

function revealOnScroll(cards) {
  if (reducedMotion || !('IntersectionObserver' in window)) return;
  cards.forEach((c) => (c.style.opacity = 0));
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      if (!visible.length) return;
      visible.forEach((t) => observer.unobserve(t));
      animate(visible, {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 500,
        delay: stagger(110),
        ease: 'outQuad',
      });
    },
    { threshold: 0.2 },
  );
  cards.forEach((c) => observer.observe(c));
}
