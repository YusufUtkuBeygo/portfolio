export const GRID = 5;

// Identicon-style 5x5 icon: left half derived from the project id, mirrored to the right.
export function pixelIcon(seed) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cells = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const mx = x < 3 ? x : GRID - 1 - x;
      const on = (h >> (y * 3 + mx)) & 1;
      cells.push(`<i class="${on ? 'on' : ''}"></i>`);
    }
  }
  return cells.join('');
}
