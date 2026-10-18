import './styles/base.css';
import { renderHero } from './sections/hero.js';
import { renderConsole } from './sections/console.js';
import { renderProjects } from './sections/projects.js';
import { renderAbout } from './sections/about.js';
import { renderContact } from './sections/contact.js';
import { startBackground } from './sections/background.js';

renderHero(document.querySelector('#hero'));
renderConsole(document.querySelector('#console'));
renderProjects(document.querySelector('#projects'));
renderAbout(document.querySelector('#about'));
renderContact(document.querySelector('#contact'));
startBackground();
