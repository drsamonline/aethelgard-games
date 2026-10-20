/* ============================================================
   SAGA ENGINE — core
   State, save, settings, storage.

   A visual-novel / text-adventure engine. No combat, no inventory —
   scenes, dialogue, choices, a diary, and the four axes.

   By Dr. Sohil Momin.
   ============================================================ */
"use strict";
(function () {
const G = window.Game = window.Game || {};

G.VERSION = "1.0.1";
G.ENGINE = "Saga";
G.SLUG   = "saga";          // used for save filenames
G.SAVE_FORMAT = "saga-save";
G.TITLE = "Saga";          // a game overrides this in its own data file

/* ---------------- storage: synchronous localStorage ---------------- */
G.store = {
  key: (n) => "saga." + n,
  get(n, dflt) {
    try { const v = localStorage.getItem(this.key(n)); return v == null ? dflt : JSON.parse(v); }
    catch (e) { return dflt; }
  },
  set(n, v) { try { localStorage.setItem(this.key(n), JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(n) { try { localStorage.removeItem(this.key(n)); } catch (e) {} },
};

/* ---------------- settings ---------------- */
G.DEFAULT_SETTINGS = {
  volume: 0.7, music: true, musicVolume: 0.5, sound: true,
  textSpeed: 2,        // 0 slow .. 3 instant
  autoAdvance: false,
  reduceMotion: false,
  font: "serif",
  palette: "parchment",
  fullscreenText: false,
};

G.settings = Object.assign({}, G.DEFAULT_SETTINGS, G.store.get("settings", {}));
G.saveSettings = function () { G.store.set("settings", G.settings); };

/* ---------------- the four axes ---------------- */
G.AXES = ["mercy", "truth", "bonds", "conviction"];
G.AXIS_INFO = {
  mercy:      { name: "Mercy",      low: "you spend",     high: "you spare" },
  truth:      { name: "Truth",      low: "you manage",    high: "you tell" },
  bonds:      { name: "Bonds",      low: "you stand alone", high: "you lean on others" },
  conviction: { name: "Conviction", low: "you hedge",     high: "you believe" },
};

/* ---------------- state ---------------- */
G.defaultState = function (slot) {
  return {
    slot: slot || 1,
    created: Date.now(),
    name: "",             // a game sets the protagonist
    book: 1,
    scene: null,          // current scene id
    line: 0,              // line index within the scene
    axes: { mercy: 0, truth: 0, bonds: 0, conviction: 0 },
    flags: {},            // story memory
    lore: [],             // diary: lore fragments
    people: [],           // diary: people met
    places: [],           // diary: places seen
    decisions: [],        // diary: choices made, read back plainly
    seenCards: {},        // character ids whose intro card has been shown
    achievements: {},     // id -> timestamp
    history: [],          // backlog: { who, text }
    endingsSeen: {},
    playtime: 0,
    lastSaved: null,
  };
};

G.state = null;

G.newGame = function (slot) {
  G.state = G.defaultState(slot);
  G.state.scene = G.FIRST_SCENE;
  G.state.line = 0;
  G.save();
  return G.state;
};

/* ---------------- save / load ---------------- */
G.save = function () {
  if (!G.state) return false;
  G.state.lastSaved = Date.now();
  return G.store.set("save." + (G.state.slot || 1), G.state);
};
G.load = function (slot) {
  const s = G.store.get("save." + (slot || 1), null);
  if (!s) return null;
  // merge forward so an older save gains any new fields
  G.state = Object.assign(G.defaultState(slot), s);
  G.state.axes = Object.assign({ mercy:0, truth:0, bonds:0, conviction:0 }, s.axes || {});
  return G.state;
};
G.hasSave = function (slot) { return !!G.store.get("save." + (slot || 1), null); };
G.deleteSave = function (slot) { G.store.del("save." + (slot || 1)); };

/* ---------------- export / import ---------------- */
G.wrapSave = function (state) {
  return { format: G.SAVE_FORMAT, version: G.VERSION, engine: G.ENGINE,
           game: G.TITLE, exported: new Date().toISOString(), state: state };
};
G.parseSaveText = function (txt) {
  try {
    const o = JSON.parse(txt);
    // accept this engine's format and the older one, so no save is orphaned
    if (o && (o.format === G.SAVE_FORMAT || o.format === "aethelgard-save") && o.state) return o.state;
    if (o && o.axes && o.scene) return o;             // a bare state
    return null;
  } catch (e) { return null; }
};
G.exportSaveFile = function () {
  if (!G.state) return;
  const blob = new Blob([JSON.stringify(G.wrapSave(G.state), null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${G.SLUG}-book${G.state.book}-save.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
G.importSaveFile = function (file) {
  const r = new FileReader();
  r.onload = () => {
    const s = G.parseSaveText(r.result);
    if (!s) { G.notify("That file is not a " + G.TITLE + " save."); return; }
    G.state = Object.assign(G.defaultState(1), s);
    G.save();
    if (G.screen && G.startScene && G.state.scene && G.SCENES[G.state.scene]) {
      G.screen("game"); G.startScene(G.state.scene, G.state.line || 0);
    } else if (G.screen && G.renderTitle) { G.screen("title"); G.renderTitle(); }
    G.notify("Save imported.");
  };
  r.readAsText(file);
};

/* ---------------- achievements ----------------
   The engine ships NO achievements. They are story, so a game supplies its own
   by assigning to G.ACHIEVEMENTS in its data file. A mod may add more. */
G.ACHIEVEMENTS = {};
G.unlockAchievement = function (a) {
  if (typeof a === "string") a = G.ACHIEVEMENTS[a] ? Object.assign({ id: a }, G.ACHIEVEMENTS[a]) : null;
  if (!a || !a.id || !G.state) return;
  if (G.state.achievements[a.id]) return;
  G.state.achievements[a.id] = Date.now();
  G.notify(a.name, a.desc, "achievement");
  G.Sound && G.Sound.play("unlock");
  G.save();
};

/* ---------------- notifications ---------------- */
G.notify = function (title, body, kind) {
  const layer = document.getElementById("toasts");
  if (!layer) return;
  const el = document.createElement("div");
  el.className = "toast" + (kind ? " " + kind : "");
  el.innerHTML = (kind === "achievement" ? `<em>Achievement</em>` : "") +
    `<b>${G.esc(title)}</b>${body ? `<span>${G.esc(body)}</span>` : ""}`;
  layer.appendChild(el);
  setTimeout(() => el.classList.add("in"), 20);
  setTimeout(() => { el.classList.remove("in"); setTimeout(() => el.remove(), 400); }, 4200);
};

/* ---------------- helpers ---------------- */
G.esc = function (s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
};
G.axis = function (name, delta) {
  if (!G.state || !G.AXES.includes(name)) return;
  G.state.axes[name] = (G.state.axes[name] || 0) + delta;
};
G.axisLabel = function (name) {
  const v = G.state ? (G.state.axes[name] || 0) : 0;
  return v >= 6 ? "high" : v <= -6 ? "low" : "middling";
};

/* ---------------- backlog ---------------- */
G.pushHistory = function (who, text) {
  if (!G.state) return;
  G.state.history.push({ who, text });
  if (G.state.history.length > 400) G.state.history.shift();
};

/* ---------------- diagnostics ---------------- */
G.diag = { bootOk: false, errors: [] };
window.addEventListener("error", e => G.diag.errors.push(String(e.message).slice(0, 200)));
window.addEventListener("unhandledrejection", e => G.diag.errors.push("promise: " + String(e.reason).slice(0, 200)));
})();
