import { projects } from '../data/projects.js';

// Step 7 turns this list into proper project cards.
export function renderProjects(el) {
  const items = projects.map((p) => `<li><strong>${p.title}</strong>: ${p.summary}</li>`);
  el.innerHTML = `
    <h2 class="pixel">Projects</h2>
    <ul>${items.join('')}</ul>
  `;
}
