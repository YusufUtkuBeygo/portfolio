import { projects } from '../data/projects.js';
import '../styles/console.css';

// Step 3: static desk, console and cartridges.
// Step 4 makes cartridges draggable into the slot; steps 5-6 add the screen intro and blow easter egg.
export function renderConsole(el) {
  el.classList.add('console-section');
  el.innerHTML = `
    <header class="console-head">
      <h2 class="pixel">Pick a cartridge</h2>
      <p>Drag one into the slot on top of the console.</p>
    </header>
    <div class="desk">
      <div class="cart-tray">
        ${projects.map(cartridge).join('')}
      </div>
      ${handheld()}
    </div>
  `;
}

function cartridge(project, i) {
  // Small alternating tilt so the cartridges look tossed on the desk, not aligned on a grid.
  const tilt = [-6, 4, -2, 7, -5][i % 5];
  return `
    <button class="cart" type="button" data-id="${project.id}"
      style="--cart-color: ${project.color}; --tilt: ${tilt}deg"
      aria-label="${project.title} cartridge">
      <span class="cart-grip" aria-hidden="true"></span>
      <span class="cart-label">
        <span class="cart-title pixel">${project.title}</span>
        <span class="cart-stack">${project.stack.join(' · ')}</span>
      </span>
      <span class="cart-pins" aria-hidden="true"></span>
    </button>
  `;
}

function handheld() {
  return `
    <div class="handheld" aria-label="Handheld console">
      <div class="handheld-slot" aria-hidden="true"></div>
      <div class="handheld-bezel">
        <span class="handheld-led" aria-hidden="true"></span>
        <div class="handheld-screen">
          <p class="screen-idle pixel">INSERT<br />CARTRIDGE</p>
        </div>
        <p class="handheld-brand pixel">UTK-8 <span>POCKET</span></p>
      </div>
      <div class="handheld-controls" aria-hidden="true">
        <div class="dpad"><span></span><span></span></div>
        <div class="face-buttons">
          <span class="face-btn">X</span>
          <span class="face-btn">O</span>
        </div>
      </div>
      <div class="handheld-bottom" aria-hidden="true">
        <div class="pill-buttons"><span></span><span></span></div>
        <div class="speaker">${'<i></i>'.repeat(8)}</div>
      </div>
    </div>
  `;
}
