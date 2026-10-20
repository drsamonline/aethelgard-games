/* ============================================================
   SAGA ENGINE — sound

   No audio files. Every cue is synthesised live from Web Audio:
   a small library of effects, and a procedural soundtrack that
   shifts with the scene's mood.
   ============================================================ */
"use strict";
(function () {
const G = window.Game;

const Sound = G.Sound = {
  ctx: null, master: null,
  init() {
    if (this.ctx) { this.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      const v = Number(G.settings && G.settings.volume);
      this.master.gain.value = 0.22 * (isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.7);
      this.master.connect(this.ctx.destination);
    } catch (e) { this.ctx = null; }
  },
  resume() { if (this.ctx && this.ctx.state === "suspended") { try { this.ctx.resume(); } catch (e) {} } },
  setVolume(v) {
    if (!this.master) return;
    const n = Number(v);
    this.master.gain.value = 0.22 * (isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.7);
  },
  _tone(freq, dur, type, vol, delay) {
    if (!this.ctx || !G.settings.sound) return;
    const t0 = this.ctx.currentTime + (delay || 0);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.master); o.start(t0); o.stop(t0 + dur + 0.02);
  },
  _noise(dur, vol, freq) {
    if (!this.ctx || !G.settings.sound) return;
    const t0 = this.ctx.currentTime, n = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq || 1200;
    const g = this.ctx.createGain(); g.gain.value = vol || 0.3;
    src.connect(f); f.connect(g); g.connect(this.master); src.start(t0);
  },
  play(name) {
    if (!G.settings.sound) return;
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    this.resume();
    switch (name) {
      case "ui":      this._tone(420, 0.06, "triangle", 0.16); break;
      case "unlock":  [523, 784, 1047].forEach((f, i) => this._tone(f, 0.22, "triangle", 0.18, i * 0.08)); break;
      case "page":    this._noise(0.07, 0.16, 1800); break;
      case "choice":  this._tone(660, 0.09, "triangle", 0.16); this._tone(880, 0.12, "triangle", 0.12, 0.06); break;
      case "dread":   this._tone(90, 0.7, "sawtooth", 0.10); break;
      case "hurt":    this._tone(140, 0.22, "sawtooth", 0.20); this._noise(0.14, 0.18, 700); break;
      case "grief":   [392, 330, 262].forEach((f, i) => this._tone(f, 0.5, "sine", 0.16, i * 0.16)); break;
      case "hope":    [392, 523, 659, 784].forEach((f, i) => this._tone(f, 0.34, "triangle", 0.16, i * 0.1)); break;
      case "end":     [523, 392, 330, 262].forEach((f, i) => this._tone(f, 0.8, "sine", 0.14, i * 0.3)); break;
    }
  },
};

/* ---------------- procedural soundtrack ---------------- */
const MOODS = {
  calm:    { scale:[220,247,262,294,330,349,392], bpm:52, wave:"sine",     density:0.30, bass:110 },
  uneasy:  { scale:[196,208,233,247,262,277,311], bpm:46, wave:"triangle", density:0.26, bass:98  },
  grief:   { scale:[196,220,233,262,294,311,349], bpm:40, wave:"sine",     density:0.18, bass:87  },
  dread:   { scale:[185,196,208,220,233,247,262], bpm:44, wave:"triangle", density:0.22, bass:92  },
  hope:    { scale:[262,294,330,349,392,440,494], bpm:56, wave:"triangle", density:0.34, bass:131 },
  combat:  { scale:[220,233,262,277,311,330,370], bpm:96, wave:"square",   density:0.55, bass:110 },
  boss:    { scale:[147,156,175,185,208,220,247], bpm:104,wave:"sawtooth", density:0.60, bass:73  },
};

const Music = G.Music = {
  ctx:null, gain:null, timer:null, playing:false, _key:null, _mood:null, _step:0, _next:0,
  init() {
    if (this.ctx) return true;
    Sound.init();
    this.ctx = Sound.ctx;
    if (!this.ctx) return false;
    try {
      this.gain = this.ctx.createGain();
      this.gain.gain.value = this._vol();
      this.gain.connect(this.ctx.destination);
    } catch (e) { this.ctx = null; return false; }
    return true;
  },
  _vol() {
    if (!G.settings || !G.settings.music) return 0;
    const v = Number(G.settings.musicVolume);
    return (isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.5) * 0.16;
  },
  refreshVolume() { if (this.gain) this.gain.gain.value = this._vol(); },
  setMood(key) {
    this._key = key;
    this._mood = MOODS[key] || MOODS.calm;
    if (!G.settings.music) { this.stop(); return; }
    this.start();
  },
  start() {
    if (!this.init()) return;
    if (this.playing) return;
    if (this.ctx.state === "suspended") { try { this.ctx.resume(); } catch (e) {} }
    this.playing = true; this._step = 0;
    this._next = this.ctx.currentTime + 0.1;
    clearInterval(this.timer);
    this.timer = setInterval(() => this._pump(), 120);
  },
  stop() { this.playing = false; clearInterval(this.timer); this.timer = null; },
  _pump() {
    if (!this.ctx || !this.playing) return;
    const m = this._mood || MOODS.calm;
    const beat = 60 / m.bpm / 2;
    while (this._next < this.ctx.currentTime + 0.4) {
      const at = this._next;
      if (Math.random() < m.density) {
        const f = m.scale[Math.floor(Math.random() * m.scale.length)];
        this._note(f, at, beat * 2.2, m.wave, 0.055);
      }
      if (this._step % 8 === 0) this._note(m.bass, at, beat * 3.4, "sine", 0.075);
      this._next += beat; this._step++;
    }
  },
  _note(freq, at, dur, wave, vol) {
    try {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = wave; o.frequency.setValueAtTime(freq, at);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(vol, at + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(this.gain); o.start(at); o.stop(at + dur + 0.05);
    } catch (e) {}
  },
};

/* browsers only allow audio after a gesture — keep trying until it runs */
G.unlockAudio = function () {
  try { Sound.init(); if (Sound.ctx && Sound.ctx.state === "suspended") Sound.ctx.resume(); } catch (e) {}
  if (G.state && Music._key) Music.start();
};
})();
