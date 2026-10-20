/* ============================================================
   SAGA ENGINE — boot

   Wires the page, loads the sprite index and the scenes, and puts
   the title screen up. Anything that fails here is reported on
   screen rather than swallowed.
   ============================================================ */
"use strict";
(function () {
const G = window.Game;
const $ = id => document.getElementById(id);

/* The first scene is whatever the manifest lists first — the engine must not
   know any particular story's chapter ids. (It used to hardcode "b1-01", which
   made every other game start on a scene that did not exist.) */
G.FIRST_SCENE = (G.SCENE_MANIFEST && G.SCENE_MANIFEST[0] && G.SCENE_MANIFEST[0].id) || "start";

G.boot = async function () {
  const fail = (msg) => {
    const el = $("boot-error");
    el.style.display = "block";
    el.innerHTML = "<b>The game could not start.</b><br>" + G.esc(msg) +
      "<br><br>If you opened this by double-clicking index.html, your browser is blocking " +
      "the game from reading its own files. Serve the folder over http instead — " +
      "<code>python3 -m http.server</code> in this folder, then open <code>localhost:8000</code>.";
  };

  // 1. the sprite index (so portraits resolve)
  try {
    const n = await G.buildSpriteIndex();
    if (n) G.diag.sprites = n;
  } catch (e) { /* falls back to the naming rule */ }

  // 2. the base scenes
  try {
    const n = await G.loadScenes();
    G.diag.scenes = n;
    if (!n) { fail("No scene files loaded. Check that the scenes/ folder came with the game."); return; }
  } catch (e) { fail("Scenes failed to load: " + e.message); return; }

  // 2b. mods — discovered, validated, then applied. A broken mod is disabled,
  //     never fatal: the base game must always be playable.
  try {
    await G.discoverMods();
    const rep = G.applyMods();
    await G.loadModScenes();
    G.diag.mods = { found: G.MODS.discovered.length, loaded: G.MODS.loaded.length,
                    report: G.modReport(), errors: G.MODS.errors.slice(0, 8) };
  } catch (e) { G.diag.mods = { error: e.message }; }

  // 3. wire the interface
  try { G.wireUI(); } catch (e) { fail("Interface failed: " + e.message); return; }

  // 4. the title
  G.screen("title");
  G.renderTitle();
  G.diag.bootOk = true;

  // audio unlocks on the first gesture, and keeps trying until it runs
  const unlock = () => {
    G.unlockAudio();
    if (G.Sound.ctx && G.Sound.ctx.state === "running") {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    }
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock);
};

G.wireUI = function () {
  // title
  $("btn-new").onclick      = () => G.beginNew();
  $("btn-continue").onclick = () => G.continueGame();
  $("btn-settings").onclick = () => G.openSettings();
  $("btn-diary-title").onclick = () => { G.state = G.state || G.load(1); if (G.state) G.openDiary(); else G.notify("No game yet"); };

  // in-game bar
  $("btn-diary").onclick   = () => G.openDiary();
  $("btn-backlog").onclick = () => G.openBacklog();
  $("btn-settings2").onclick = () => G.openSettings();
  $("btn-save").onclick    = () => { G.save(); G.notify("Saved"); };

  // closing overlays
  document.querySelectorAll("[data-close]").forEach(b =>
    b.onclick = () => $(b.dataset.close).classList.remove("show"));

  // advance the text: click anywhere on the stage, or space/enter
  $("stage").addEventListener("click", (e) => {
    if (e.target.closest("#choice-wrap") || e.target.closest(".bar") || e.target.closest("#intro-card")) return;
    G.advance();
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
    if (e.key === " " || e.key === "Enter") {
      if ($("choice-wrap").classList.contains("show")) return;
      e.preventDefault(); G.advance();
    }
    if (e.key === "Escape") {
      document.querySelectorAll(".overlay.show").forEach(o => o.classList.remove("show"));
    }
    if (e.key.toLowerCase() === "d") G.openDiary();
    if (e.key.toLowerCase() === "b") G.openBacklog();
    if (e.key.toLowerCase() === "s") { G.save(); G.notify("Saved"); }
  });

  if (G.settings.reduceMotion) document.body.classList.add("reduce-motion");
};

/* go */
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => G.boot());
else G.boot();
})();
