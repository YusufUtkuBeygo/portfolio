// Tiny synthesized sound effects: no audio files to download.
let ctx;

function audio() {
  // Browsers only allow audio after a user gesture, so the context is created lazily on first use.
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Short burst of filtered noise: the plastic "clack" of a cartridge hitting the pins.
function noiseBurst(ac, start, duration, freq, gain) {
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * duration), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);

  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  const amp = ac.createGain();
  amp.gain.value = gain;
  src.connect(filter).connect(amp).connect(ac.destination);
  src.start(start);
}

// Low sine drop: the body "thunk" under the click.
function thunk(ac, start) {
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.frequency.setValueAtTime(180, start);
  osc.frequency.exponentialRampToValueAtTime(60, start + 0.08);
  amp.gain.setValueAtTime(0.35, start);
  amp.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
  osc.connect(amp).connect(ac.destination);
  osc.start(start);
  osc.stop(start + 0.1);
}

export function playInsert() {
  const ac = audio();
  const t = ac.currentTime;
  noiseBurst(ac, t, 0.03, 2400, 0.6);
  thunk(ac, t + 0.01);
  noiseBurst(ac, t + 0.07, 0.025, 3200, 0.35);
}

// Rising square-wave arpeggio for the boot screen.
export function playBoot() {
  const ac = audio();
  const t = ac.currentTime;
  [392, 523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    const at = t + 0.25 + i * 0.075;
    const len = i === 4 ? 0.35 : 0.07;
    osc.type = 'square';
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0.06, at);
    amp.gain.exponentialRampToValueAtTime(0.001, at + len);
    osc.connect(amp).connect(ac.destination);
    osc.start(at);
    osc.stop(at + len);
  });
}

// Breathy whoosh: noise through a low-pass filter that sweeps down while fading out.
export function playBlow() {
  const ac = audio();
  const t = ac.currentTime;
  const duration = 0.5;
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * duration), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2200, t);
  filter.frequency.exponentialRampToValueAtTime(400, t + duration);
  const amp = ac.createGain();
  amp.gain.setValueAtTime(0.001, t);
  amp.gain.exponentialRampToValueAtTime(0.5, t + 0.06);
  amp.gain.exponentialRampToValueAtTime(0.001, t + duration);
  src.connect(filter).connect(amp).connect(ac.destination);
  src.start(t);
}

// Modem handshake: a run of dual-tone beeps, then a short burst of static.
export function playDial() {
  const ac = audio();
  const t = ac.currentTime;
  const pairs = [
    [697, 1209],
    [770, 1336],
    [852, 1477],
    [941, 1336],
    [770, 1209],
  ];
  pairs.forEach(([lo, hi], i) => {
    const at = t + i * 0.11;
    const amp = ac.createGain();
    amp.gain.setValueAtTime(0.05, at);
    amp.gain.setValueAtTime(0, at + 0.08);
    amp.connect(ac.destination);
    [lo, hi].forEach((freq) => {
      const osc = ac.createOscillator();
      osc.frequency.value = freq;
      osc.connect(amp);
      osc.start(at);
      osc.stop(at + 0.08);
    });
  });
  noiseBurst(ac, t + pairs.length * 0.11 + 0.05, 0.35, 1800, 0.25);
}

// Two quick rising blips for "PRESS START".
export function playStart() {
  const ac = audio();
  const t = ac.currentTime;
  [660, 990].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    const at = t + i * 0.09;
    osc.type = 'square';
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0.06, at);
    amp.gain.exponentialRampToValueAtTime(0.001, at + 0.12);
    osc.connect(amp).connect(ac.destination);
    osc.start(at);
    osc.stop(at + 0.12);
  });
}

export function playEject() {
  const ac = audio();
  const t = ac.currentTime;
  noiseBurst(ac, t, 0.04, 1600, 0.4);
}
