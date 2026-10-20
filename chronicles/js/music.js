
"use strict";
(function () {
const G = window.Game;

const Music = G.Music = {
  ctx:null, gain:null, timer:null, playing:false,
  _mood:null, _moodKey:null, _next:0, _step:0, _bar:0,

  init() {
    if (this.ctx) return true;
    G.Sound.init();
    this.ctx = G.Sound.ctx;
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

  desiredMood() {
    const p = G.state;
    if (!p) return G.MUSIC_START;
    if (p.combat && p.combat.active) return p.combat.enemies && p.combat.enemies.some(e => e.boss) ? G.MUSIC_BOSS : G.MUSIC_COMBAT;
    if (p.map && p.map.current === "endless") return G.MUSIC_BOSS;
    return G.MUSIC_BY_LOCATION[p.map ? p.map.current : "oakhaven"] || "calm";
},
  update() {
    if (!G.settings.music) { this.stop(); return; }
    const want = this.desiredMood();
    if (want !== this._moodKey) this.setMood(want);
    else if (!this.playing) this.start();
},
  setMood(key) {
    this._moodKey = key;
    this._mood = G.MUSIC_MOODS[key] || G.MUSIC_MOODS.calm;
    if (!G.settings.music) { this.stop(); return; }
    this.start();
},
  moodName() { return this._mood ? this._mood.name : "—"; },

  start() {
    if (!this.init()) return;
    if (this.playing) return;
    if (this.ctx.state === "suspended") { try { this.ctx.resume(); } catch (e) {} }
    this.playing = true;
    this._step = 0; this._bar = 0;
    this._next = this.ctx.currentTime + 0.08;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this._pump(), 110);
},
  stop() {
    this.playing = false;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
},

  _pump() {
    if (!this.playing || !this.ctx) return;
    const m = this._mood || G.MUSIC_MOODS.calm;
    const sixteenth = 60 / m.bpm / 4;
    const horizon = this.ctx.currentTime + 0.45;
    let guard = 0;
    while (this._next < horizon && guard++ < 64) {
      this._playStep(this._step, this._next, m);
      this._next += sixteenth;
      this._step++;
      if (this._step % 16 === 0) this._bar++;
}
},
  _freq(root, semis) { return root * Math.pow(2, semis / 12); },
  _scaleNote(m, i) {
    const sc = m.scale, oct = Math.floor(i / sc.length), idx = ((i % sc.length) + sc.length) % sc.length;
    return this._freq(m.root, sc[idx] + 12 * oct);
},
  _note(freq, at, dur, wave, vol, dest) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = wave; o.frequency.setValueAtTime(freq, at);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(dest || this.gain);
    o.start(at); o.stop(at + dur + 0.03);
},
  _perc(at, kind) {
    if (!this.ctx) return;
    const n = Math.floor(this.ctx.sampleRate * 0.08);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, kind === "kick" ? 1.2 : 3);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = kind === "kick" ? "lowpass" : "highpass";
    f.frequency.value = kind === "kick" ? 140 : 6000;
    const g = this.ctx.createGain(); g.gain.value = kind === "kick" ? 0.5 : 0.16;
    src.connect(f); f.connect(g); g.connect(this.gain); src.start(at);
},
  _playStep(step, at, m) {
    const s = step % 16, bar = this._bar;
    const rnd = Math.random();

    if (s % 4 === 0) {
      const semis = (s === 8 && bar % 2 === 1) ? m.scale[3] : 0;
      this._note(this._freq(m.root / 2, semis), at, 60 / m.bpm * 0.9, m.bass, 0.20);
}

    if (rnd < m.density) {
      const deg = (bar * 3 + s) % (m.scale.length * 2);
      this._note(this._scaleNote(m, deg), at, 0.22 + (1 - m.brightness) * 0.3, m.wave, 0.085);
}

    if (m.pad && s === 0) {
      [0, 7, 12].forEach((iv, i) => this._note(this._freq(m.root, iv), at, 60 / m.bpm * 3.2, "sine", 0.05 - i * 0.008));
}

    if (m.perc) {
      if (s === 0 || s === 6 || s === 10) this._perc(at, "kick");
      if (s % 2 === 1) this._perc(at, "hat");
}
},
};

G.unlockAudio = function () {
  try { G.Sound.init(); if (G.Sound.ctx && G.Sound.ctx.state === "suspended") G.Sound.ctx.resume(); } catch (e) {}
  Music.update();
};
})();
