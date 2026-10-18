import { profile } from '../data/profile.js';

export function renderContact(el) {
  const links = profile.links.map(
    (l) => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`,
  );
  el.innerHTML = `<nav class="links">${links.join(' · ')}</nav>`;
}
