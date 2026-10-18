import { animate } from 'animejs';
import '../styles/case-study.css';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Full-screen project panel that grows out of the console screen (and shrinks back into it on close).
export function openCaseStudy(project, fromEl, returnFocusTo) {
  const overlay = document.createElement('div');
  overlay.className = 'case-overlay';
  overlay.innerHTML = `
    <article class="case-panel" role="dialog" aria-modal="true" aria-labelledby="case-title"
      style="--cart-color: ${project.color}">
      <header class="case-bar pixel">
        <span>UTK-8 &#9656; ${project.title.toUpperCase()}</span>
        <button class="case-close pixel" type="button">&#9664; BACK <small>(ESC)</small></button>
      </header>
      <div class="case-body">
        <h2 id="case-title" class="case-title pixel">${project.title}</h2>
        <p class="case-summary">${project.summary}</p>
        ${
          project.highlights?.length
            ? `<ul class="case-highlights">${project.highlights.map((h) => `<li>${h}</li>`).join('')}</ul>`
            : ''
        }
        <ul class="case-stack">${project.stack.map((s) => `<li>${s}</li>`).join('')}</ul>
        <nav class="case-links">${links(project)}</nav>
      </div>
    </article>
  `;
  document.body.append(overlay);
  document.body.classList.add('case-open');

  const panel = overlay.querySelector('.case-panel');
  const body = overlay.querySelector('.case-body');
  const closeBtn = overlay.querySelector('.case-close');
  let closing = false;

  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') trapFocus(e, panel);
  };
  document.addEventListener('keydown', onKey);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => e.target === overlay && close());

  grow();
  closeBtn.focus({ preventScroll: true });

  async function grow() {
    if (reducedMotion) return;
    body.style.opacity = 0;
    await animate(panel, { ...fromScreen(), duration: 480, ease: 'inOutCubic' });
    animate(body, { opacity: [0, 1], translateY: [10, 0], duration: 300, ease: 'outQuad' });
  }

  async function close() {
    if (closing) return;
    closing = true;
    document.removeEventListener('keydown', onKey);
    if (!reducedMotion) {
      await animate(body, { opacity: 0, duration: 150 });
      const from = fromScreen();
      await animate(panel, {
        translateX: [0, from.translateX[0]],
        translateY: [0, from.translateY[0]],
        scaleX: [1, from.scaleX[0]],
        scaleY: [1, from.scaleY[0]],
        duration: 380,
        ease: 'inOutCubic',
      });
      animate(overlay, { opacity: 0, duration: 120 });
      await new Promise((r) => setTimeout(r, 120));
    }
    overlay.remove();
    document.body.classList.remove('case-open');
    returnFocusTo?.focus({ preventScroll: true });
  }

  // FLIP: transform that makes the full panel sit exactly on the console screen, animated to identity.
  function fromScreen() {
    const s = fromEl.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    return {
      translateX: [s.left + s.width / 2 - (p.left + p.width / 2), 0],
      translateY: [s.top + s.height / 2 - (p.top + p.height / 2), 0],
      scaleX: [s.width / p.width, 1],
      scaleY: [s.height / p.height, 1],
    };
  }
}

function links(project) {
  const out = [];
  if (project.repo) out.push(`<a href="${project.repo}" target="_blank" rel="noopener">Source code &#8599;</a>`);
  if (project.demo) out.push(`<a href="${project.demo}" target="_blank" rel="noopener">Live demo &#8599;</a>`);
  return out.length ? out.join('') : `<span class="case-soon">Links coming soon</span>`;
}

function trapFocus(e, root) {
  const items = root.querySelectorAll('button, a[href]');
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
