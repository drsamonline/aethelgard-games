
"use strict";
(function () {
const G = window.Game;

G.boot = function () {
  G.loadSettings();
  G.applySettings();

  try { if (G.store && G.store.primeSync) G.store.primeSync(); } catch (e) {}
  G.renderStart();
  const finish = () => { G.initTooltips(); G.applyNav(); G.renderStart(); if (G.markBootOk) G.markBootOk(); };
  const ready = () => {
    finish();

    if (G.store && G.store.init) G.store.init().then(() => { if (G.renderStart) G.renderStart(); });
};

  if (G.bootMods) { try { G.bootMods(ready); } catch (e) { console.warn("[Aethelgard] mod loading failed; starting without mods.", e); ready(); } }
  else ready();

  const unlock = () => {
    if (G.unlockAudio) G.unlockAudio();
    const ok = G.Sound && G.Sound.ctx && G.Sound.ctx.state === "running";
    if (ok) {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
}
};
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock);
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => G.boot());
else G.boot();

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    const ids = ["help-overlay","choice-overlay","notify-modal","settings-modal","menu-modal","event-overlay","creation-screen"];
    for (const id of ids) { const el = document.getElementById(id); if (el && !el.classList.contains("hidden")) { if (G.closeModal) G.closeModal(id); else el.classList.add("hidden"); if (G.Sound) G.Sound.play("ui"); return; } }
    return;
}
  if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const map = ["story","hero","skills","atlas","home","forge","market","underworld","inventory","codex","wiki"];
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 9 && G.state && !G.state.combat.active) { G.switchTab(map[n-1]); }
});

window.Game = G;
})();
