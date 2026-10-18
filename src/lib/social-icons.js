// 16x16 pixel-art icons for the floppy labels, rendered once to tiny canvases and scaled up crisp.
// Each icon: rows of palette keys ('.' = transparent) + a palette, or a function for gradients.

const SIZE = 16;

// Instagram-style warm-to-purple gradient, running from the bottom-left corner to the top-right.
const IG_STOPS = ['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5'];
function igGradient(x, y) {
  const t = (x + (SIZE - 1 - y)) / (2 * (SIZE - 1));
  const i = Math.min(IG_STOPS.length - 2, Math.floor(t * (IG_STOPS.length - 1)));
  return mix(IG_STOPS[i], IG_STOPS[i + 1], t * (IG_STOPS.length - 1) - i);
}

const ICONS = {
  linkedin: {
    palette: { b: '#0a66c2', w: '#ffffff' },
    rows: [
      '.bbbbbbbbbbbbbb.',
      'bbbbbbbbbbbbbbbb',
      'bbbbbbbbbbbbbbbb',
      'bbbwwbbbbbbbbbbb',
      'bbbwwbbbbbbbbbbb',
      'bbbbbbbbbbbbbbbb',
      'bbbwwbbwwbwwwbbb',
      'bbbwwbbwwwwwwwbb',
      'bbbwwbbwwwbbwwbb',
      'bbbwwbbwwbbbwwbb',
      'bbbwwbbwwbbbwwbb',
      'bbbwwbbwwbbbwwbb',
      'bbbwwbbwwbbbwwbb',
      'bbbbbbbbbbbbbbbb',
      'bbbbbbbbbbbbbbbb',
      '.bbbbbbbbbbbbbb.',
    ],
  },
  instagram: {
    palette: { g: igGradient, w: '#ffffff' },
    rows: [
      '..gggggggggggg..',
      '.gggggggggggggg.',
      'gggwwwwwwwwwwggg',
      'ggwggggggggggwgg',
      'ggwggggggggwgwgg',
      'ggwgggwwwwgggwgg',
      'ggwggwggggwggwgg',
      'ggwgwggggggwgwgg',
      'ggwgwggggggwgwgg',
      'ggwgwggggggwgwgg',
      'ggwggwggggwggwgg',
      'ggwgggwwwwgggwgg',
      'ggwggggggggggwgg',
      'gggwwwwwwwwwwggg',
      '.gggggggggggggg.',
      '..gggggggggggg..',
    ],
  },
  spotify: {
    palette: { g: '#1ed760', k: '#121212' },
    rows: [
      '.....gggggg.....',
      '...gggggggggg...',
      '..gggggggggggg..',
      '.gggggggggggggg.',
      '.gggkkkkkkkkggg.',
      '.gkkkggggggkkkg.',
      'gggggggggggggggg',
      'ggggkkkkkkkkgggg',
      'gggkkggggggkkggg',
      'gggggggggggggggg',
      '.ggggkkkkkkgggg.',
      '.gggkggggggkggg.',
      '.gggggggggggggg.',
      '..gggggggggggg..',
      '...gggggggggg...',
      '.....gggggg.....',
    ],
  },
  // GitHub's mark is its mascot, so instead: a dark tile with a little green contribution graph.
  github: {
    palette: { k: '#24292f', a: '#0e4429', b: '#006d32', c: '#26a641', d: '#39d353' },
    rows: contributionGrid([
      'acbda',
      'badcb',
      'dbabc',
      'adcad',
      'cbdba',
    ]),
  },
  // Gmail-style "M" envelope: blue and green legs, red V, red and yellow top corners.
  email: {
    palette: { r: '#ea4335', b: '#4285f4', g: '#34a853', y: '#fbbc04' },
    rows: [
      '................',
      '................',
      '................',
      'rrrr........rryy',
      'rr.rr......rr.yy',
      'bb..rr....rr..gg',
      'bb...rr..rr...gg',
      'bb....rrrr....gg',
      'bb.....rr.....gg',
      'bb............gg',
      'bb............gg',
      'bb............gg',
      'bb............gg',
      '................',
      '................',
      '................',
    ],
  },

};

// 5x5 cells of 2px with 1px dark gaps, rounded outer corners.
function contributionGrid(cells) {
  const gap = 'k'.repeat(SIZE);
  const rows = [];
  cells.forEach((row) => {
    rows.push(gap);
    const line = 'k' + [...row].map((c) => c + c).join('k') + 'k';
    rows.push(line, line);
  });
  rows.push(gap);
  rows[0] = '.' + gap.slice(1, -1) + '.';
  rows[SIZE - 1] = '.' + gap.slice(1, -1) + '.';
  return rows;
}

const cache = new Map();

// Returns a data URL for the icon; the <img> scales it with image-rendering: pixelated.
export function socialIconSrc(id) {
  if (cache.has(id)) return cache.get(id);
  const icon = ICONS[id] ?? ICONS.email;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  icon.rows.forEach((row, y) => {
    [...row].forEach((key, x) => {
      const color = icon.palette[key];
      if (!color) return;
      ctx.fillStyle = typeof color === 'function' ? color(x, y) : color;
      ctx.fillRect(x, y, 1, 1);
    });
  });
  const src = canvas.toDataURL();
  cache.set(id, src);
  return src;
}

function mix(a, b, t) {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
}
