import { profile } from '../data/profile.js';
import '../styles/contact.css';

export function renderContact(el) {
  el.classList.add('contact-section');
  const links = profile.links
    .filter((l) => l.url)
    .map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${l.label} &#8599;</a>`);

  el.innerHTML = `
    <h2 class="pixel">Continue?</h2>
    <p class="contact-lead">Internships, projects, or just talking about tiny machines that think. Say hi.</p>
    <div class="contact-mail">
      <a class="contact-address" href="mailto:${profile.email}">${profile.email}</a>
      <button type="button" class="contact-copy pixel">COPY</button>
    </div>
    <nav class="contact-links" aria-label="Profiles">${links.join('')}</nav>
    <p class="contact-foot">&copy; ${new Date().getFullYear()} ${profile.name} · Built with Vite and anime.js</p>
  `;

  const copy = el.querySelector('.contact-copy');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      copy.textContent = 'COPIED!';
    } catch {
      copy.textContent = 'PRESS CTRL+C';
      getSelection().selectAllChildren(el.querySelector('.contact-address'));
    }
    setTimeout(() => (copy.textContent = 'COPY'), 1600);
  });
}
