import { profile } from '../data/profile.js';
import '../styles/about.css';

// About me + tech stack shown as an RPG-style inventory.
export function renderAbout(el) {
  el.classList.add('about-section');
  el.innerHTML = `
    <div class="about-text">
      <h2 class="pixel">About me</h2>
      <ul class="about-list">${profile.aboutMe.map((line) => `<li>${line}</li>`).join('')}</ul>
    </div>
    <aside class="inventory" aria-label="Tech stack">
      <p class="inventory-title pixel">INVENTORY</p>
      <ul class="inventory-grid">${profile.tech.map((t) => `<li>${t}</li>`).join('')}</ul>
    </aside>
  `;
}
