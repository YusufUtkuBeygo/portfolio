import { profile } from '../data/profile.js';
import { renderLinkStation } from './link-station.js';
import '../styles/contact.css';

export function renderContact(el) {
  el.classList.add('contact-section');
  el.innerHTML = `
    <h2 class="pixel">Continue?</h2>
    <p class="contact-lead">Internships, projects, or just talking about tiny machines that think. Say hi.</p>
    <p class="how-to">
      <span class="pixel">HOW TO</span>
      Drag a floppy disk into the Link Station, or just click one, to open that account.
    </p>
    <div class="contact-station"></div>
    <p class="contact-foot">&copy; ${new Date().getFullYear()} ${profile.name} · Built with Vite and anime.js</p>
  `;

  renderLinkStation(el.querySelector('.contact-station'));
}
