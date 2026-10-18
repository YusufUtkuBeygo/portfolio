import './styles/base.css';
import { renderHero } from './sections/hero.js';
import { renderConsole } from './sections/console.js';
import { renderProjects } from './sections/projects.js';
import { renderContact } from './sections/contact.js';

renderHero(document.querySelector('#hero'));
renderConsole(document.querySelector('#console'));
renderProjects(document.querySelector('#projects'));
renderContact(document.querySelector('#contact'));
