// Slow-drifting pixel sprites behind the whole page: chips, resistors, LEDs, bits and a tiny robot.
// Drawn on one fixed <canvas>; faint on purpose so it never competes with the content.

const PALETTE = {
  k: '#2b2a30', // dark body
  g: '#9bd88f', // screen green
  p: '#b3245b', // accent pink
  y: '#e3b341', // gold pins / legs
  w: '#ece6da', // light
  t: '#6fa89c', // teal shell
};

// Each sprite is a grid of palette keys; '.' is transparent.
const SPRITES = [
  // microchip
  ['.y.y.y.', 'kkkkkkk', 'kkkkkkk', 'kwkkkkk', 'kkkkkkk', 'kkkkkkk', '.y.y.y.'],
  // resistor
  ['...wwww...', 'yyywpwyyyy', 'yyywpwyyyy', '...wwww...'],
  // LED
  ['.ppp.', 'ppppp', 'pwppp', 'ppppp', 'kkkkk', '.y.y.', '.y.y.', '.y.y.'],
  // bit 1
  ['.gg', 'ggg', '.gg', '.gg', '.gg', 'ggg'],
  // bit 0
  ['.gg.', 'g..g', 'g..g', 'g..g', 'g..g', '.gg.'],
  // tiny robot (original)
  ['...y...', '..ttt..', '.ttttt.', '.tgtgt.', '.ttttt.', 'ttkkktt', '.ttttt.', '.t...t.'],
  // heart (extra life)
  ['.pp.pp.', 'ppppppp', 'pwppppp', '.ppppp.', '..ppp..', '...p...'],
];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function startBackground() {
  const canvas = document.createElement('canvas');
  canvas.className = 'pixel-bg';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const images = SPRITES.map(toImage);
  let floaters = [];
  let w = 0;
  let h = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    // Roughly one sprite per 45k px² of screen, capped so big monitors stay calm.
    const count = Math.min(30, Math.max(10, Math.round((w * h) / 45000)));
    floaters = Array.from({ length: count }, () => spawn(true));
    if (reducedMotion) draw(0);
  }

  function spawn(anywhere) {
    const img = images[Math.floor(Math.random() * images.length)];
    const scale = [3, 3, 4, 5][Math.floor(Math.random() * 4)];
    return {
      img,
      scale,
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 40,
      speed: 6 + Math.random() * 14, // px per second, upward
      swayAmp: 6 + Math.random() * 14,
      swayFreq: 0.2 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.1 + Math.random() * 0.14,
    };
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const f of floaters) {
      const x = f.x + Math.sin(t * f.swayFreq + f.phase) * f.swayAmp;
      ctx.globalAlpha = f.alpha;
      ctx.drawImage(f.img, Math.round(x), Math.round(f.y), f.img.width * f.scale, f.img.height * f.scale);
    }
    ctx.globalAlpha = 1;
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1); // clamp so a background tab doesn't teleport sprites
    last = now;
    for (let i = 0; i < floaters.length; i++) {
      const f = floaters[i];
      f.y -= f.speed * dt;
      if (f.y < -f.img.height * f.scale - 20) floaters[i] = spawn(false);
    }
    draw(now / 1000);
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);
  if (!reducedMotion) requestAnimationFrame(frame);
}

// Renders a sprite grid into a 1px-per-cell offscreen canvas; scaled up later with smoothing off.
function toImage(rows) {
  const c = document.createElement('canvas');
  c.width = Math.max(...rows.map((r) => r.length));
  c.height = rows.length;
  const g = c.getContext('2d');
  rows.forEach((row, y) => {
    [...row].forEach((key, x) => {
      if (!PALETTE[key]) return;
      g.fillStyle = PALETTE[key];
      g.fillRect(x, y, 1, 1);
    });
  });
  return c;
}
