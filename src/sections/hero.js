import { profile } from '../data/profile.js';

// Step 2 adds the typing animation and the playful intro.
export function renderHero(el) {
  el.innerHTML = `
    <h1 class="pixel">${profile.name}</h1>
    <p>${profile.tagline}</p>
  `;
}
