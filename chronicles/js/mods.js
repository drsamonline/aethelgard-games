
"use strict";
(function () {
const G = window.Game;

G.MODS = { discovered:[], loaded:[], errors:[], files:[], bootSet:null, snapshot:null };

const TABLE_KEYS = ["ENEMIES","GEAR","ITEMS","ACTIVE_SKILLS","CLASSES","RACES","BUILDINGS","COMPANIONS","NPCS",
  "GEMS","GEAR_SETS","ENDLESS_MODS","LOCATIONS","MUSIC_MOODS","MUSIC_BY_LOCATION","WIKI","I18N","LANGUAGES",
  "ULTIMATES","ELITE_AFFIXES","REACTIONS","CONSUMABLE_RECIPES","ACTIVITIES","ARENA_WAVES","DIFFICULTY",
  "ELEMENTS","STATUS","RARITIES","AFFIXES","THEMES","GENDERS","TIPS","WORLD_POS","LOCAL_MAPS"];

const ARRAY_KEYS = ["SIDE_QUESTS","ACHIEVEMENTS","CHAPTERS","EVENTS","WORLD_EVENTS","SPONTANEOUS_EVENTS","CLASS_MISSIONS","TAVERN_RUMOURS"];

const POOL_KEYS = ["BOUNTY_POOL","ENDLESS_FLOOR_POOL"];

const SNAPSHOT_KEYS = TABLE_KEYS.concat(["CHAPTERS","EVENTS","WORLD_EVENTS","SPONTANEOUS_EVENTS","CLASS_MISSIONS","TAVERN_RUMOURS","GRAPHICS_PACKS","WORLD_LINKS"]);
const SNAPSHOT_SHALLOW = ["ACHIEVEMENTS","SIDE_QUESTS"];
const MODS_KEY = "aethelgard_mods_v1";

G.modPrefs = { enabled:{}, safe:false };
G.loadModPrefs = function () { try { const s = JSON.parse(localStorage.getItem(MODS_KEY)); if (s) G.modPrefs = Object.assign(G.modPrefs, s); } catch (e) {} };
G.saveModPrefs = function () { try { localStorage.setItem(MODS_KEY, JSON.stringify(G.modPrefs)); } catch (e) {} };
G.modEnabled = function (id) { const e = G.modPrefs.enabled; return e[id] === undefined ? true : !!e[id]; };
G.safeMode = function () {
  if (G.modPrefs.safe) return true;
  try { const q = location.search || ""; if (/[?&](safe|nomods)\b/.test(q)) return true; } catch (e) {}
  return false;
};

G.modImpact = function (m) { return (m && (m.impact || m.tier)) || "additive"; };
G.modNeedsRestart = function (m) {
  if (!m) return false;
  if (typeof m.requiresRestart === "boolean") return m.requiresRestart;
  const imp = G.modImpact(m);
  return imp === "story" || imp === "overhaul";
};
G.modBadge = function (m) {
  const imp = G.modImpact(m);
  return imp === "overhaul" ? "⚠ overhaul" : imp === "story" ? "⚠ story" : "✓ content";
};

function clone(v) { try { return JSON.parse(JSON.stringify(v)); } catch (e) { return v; } }
G.snapshotData = function () {
  if (G.MODS.snapshot) return;
  const snap = { tables:{}, shallow:{} };
  SNAPSHOT_KEYS.forEach(k => { if (G[k] !== undefined) snap.tables[k] = clone(G[k]); });
  SNAPSHOT_SHALLOW.forEach(k => { if (Array.isArray(G[k])) snap.shallow[k] = G[k].slice(); });
  G.MODS.snapshot = snap;
};
G.restoreData = function () {
  const snap = G.MODS.snapshot; if (!snap) return;
  Object.keys(snap.tables).forEach(k => { G[k] = clone(snap.tables[k]); });
  Object.keys(snap.shallow).forEach(k => { G[k] = snap.shallow[k].slice(); });

  if (G.WIKI && G.WIKI_CATS) {
    const base = ["Basics","Attributes","Skills","Combat","Reactions","Ultimates","Elites","Gear","Gems","Sets","World","Quests",
      "Home","Underworld","Activities","Companions","Classes","Races","Places","Status Effects","Elements","Rarity","Affixes",
      "Items","Buildings","Bestiary","Bosses","Endless","Meta","Mods"];
    const cats = {};
    Object.keys(G.WIKI).forEach(k => { const c = G.WIKI[k].cat; if (c) cats[c] = 1; });
    G.WIKI_CATS = base.concat(Object.keys(cats).filter(c => base.indexOf(c) < 0));
}
};

function modKeys(m) {
  const keys = [];
  TABLE_KEYS.forEach(t => { if (m[t] && typeof m[t] === "object" && !Array.isArray(m[t])) Object.keys(m[t]).forEach(k => keys.push(t + "." + k)); });
  ARRAY_KEYS.forEach(t => { if (Array.isArray(m[t])) m[t].forEach(it => { if (it && it.id) keys.push(t + "#" + it.id); }); });
  POOL_KEYS.forEach(t => { if (Array.isArray(m[t])) m[t].forEach(v => keys.push(t + "." + v)); });
  return keys;
}
G.modKeys = modKeys;

function resolveOrder(enabled, byId, warnings) {
  const ids = enabled.map(d => d.id);
  const after = {};
  enabled.forEach(d => { after[d.id] = (d.obj.loadAfter || []).filter(x => ids.indexOf(x) >= 0); });
  const out = [], seen = {};
  function visit(id, stack) {
    if (seen[id]) return;
    if (stack.indexOf(id) >= 0) { warnings.push({ id, msg: "circular loadAfter dependency" }); return; }
    stack.push(id);
    after[id].forEach(dep => visit(dep, stack));
    stack.pop(); seen[id] = true; out.push(id);
}
  ids.forEach(id => visit(id, []));
  return out.map(id => byId[id]);
}

G.modCompatReport = function () {
  const disc = G.MODS.discovered || [];
  const byId = {}; disc.forEach(d => { byId[d.id] = d; });
  const enabled = disc.filter(d => G.modEnabled(d.id));
  const errors = [], warnings = [], conflicts = [], collisions = [];

  const provided = {};
  enabled.forEach(d => (d.obj.provides || []).forEach(tok => { (provided[tok] = provided[tok] || []).push(d.id); }));

  enabled.forEach(d => {
    const m = d.obj;
    (m.requiresMods || []).forEach(rid => {
      const t = byId[rid];
      if (!t) errors.push({ id:d.id, type:"missing-mod", msg:`requires \u201c${rid}\u201d, which is not installed` });
      else if (!G.modEnabled(rid)) errors.push({ id:d.id, type:"disabled-dep", msg:`requires \u201c${t.name}\u201d, which is switched off` });
});
    (m.requiresProvides || []).forEach(tok => {
      if (!provided[tok]) errors.push({ id:d.id, type:"missing-capability", msg:`needs a mod providing \u201c${tok}\u201d` });
});
    (m.requires || []).forEach(tbl => {
      if (!(tbl in G)) errors.push({ id:d.id, type:"missing-table", msg:`needs data table ${tbl}, which does not exist` });
});
});

  const seenConflict = {};
  enabled.forEach(d => (d.obj.conflicts || []).forEach(oid => {
    if (!G.modEnabled(oid)) return;
    const pair = [d.id, oid].sort().join("|");
    if (seenConflict[pair]) return;
    seenConflict[pair] = true;
    conflicts.push([d.id, oid]);
    const aName = byId[d.id] ? byId[d.id].name : d.id, bName = byId[oid] ? byId[oid].name : oid;
    errors.push({ id:d.id, type:"conflict", msg:`conflicts with \u201c${bName}\u201d` });
    errors.push({ id:oid, type:"conflict", msg:`conflicts with \u201c${aName}\u201d` });
}));

  const owner = {};
  enabled.forEach(d => (d.keys || []).forEach(k => { (owner[k] = owner[k] || []).push(d.id); }));
  Object.keys(owner).forEach(k => {
    const ids = owner[k];
    if (ids.length < 2) return;
    const excl = ids.filter(id => ((byId[id].obj.exclusive) || []).indexOf(k) >= 0);
    collisions.push({ key:k, mods:ids, hard: excl.length > 0 });
    if (excl.length) {
      errors.push({ id:excl[0], type:"exclusive-key", msg:`claims ${k} exclusively, but ${ids.filter(x => x !== excl[0]).join(", ")} changes it too` });
} else {
      warnings.push({ id:ids[ids.length - 1], type:"override", msg:`overrides ${k}, which ${ids.slice(0, -1).join(", ")} also sets` });
}
});

  const order = resolveOrder(enabled, byId, warnings);
  const ok = enabled.filter(d => !errors.some(e => e.id === d.id)).map(d => d.id);
  return { enabled: enabled.map(d => d.id), ok, errors, warnings, conflicts, collisions, order: order.map(d => d.id) };
};

G.modStatus = function (id, report) {
  const r = report || G.modCompatReport();
  const errs = r.errors.filter(e => e.id === id).map(e => e.msg);
  if (errs.length) return { state:"error", reasons: errs };
  const warns = r.warnings.filter(w => w.id === id).map(w => w.msg);
  if (warns.length) return { state:"warn", reasons: warns };
  return { state:"ok", reasons: [] };
};

function applyMod(mod) {

  if (mod.MODE && G.registerMode) G.registerMode(mod.MODE);
  const activeMode = (G.settings && G.settings.mode) || "chronicles";
  if (mod.MODE && mod.MODE.id !== activeMode) { mod._skippedForMode = mod.MODE.id; return false; }

  if (mod.mode && mod.mode !== activeMode) { mod._skippedForMode = mod.mode; return false; }
  TABLE_KEYS.forEach(k => {
    if (!mod[k] || typeof mod[k] !== "object" || Array.isArray(mod[k])) return;
    G[k] = G[k] || {};
    Object.assign(G[k], mod[k]);
});
  ARRAY_KEYS.forEach(k => {
    if (!Array.isArray(mod[k])) return;
    G[k] = G[k] || [];
    mod[k].forEach(item => {
      const id = item && item.id;
      const idx = id ? G[k].findIndex(x => x && x.id === id) : -1;
      if (idx >= 0) G[k][idx] = item; else G[k].push(item);
});
});

  if (Array.isArray(mod.WORLD_LINKS)) {
    G.WORLD_LINKS = G.WORLD_LINKS || [];
    mod.WORLD_LINKS.forEach(pair => {
      if (!Array.isArray(pair) || pair.length < 2) return;
      const same = G.WORLD_LINKS.some(p => p && p[0] === pair[0] && p[1] === pair[1]);
      if (!same) G.WORLD_LINKS.push(pair);
});
}
  POOL_KEYS.forEach(k => {
    if (!Array.isArray(mod[k])) return;
    G[k] = G[k] || [];
    mod[k].forEach(v => { if (G[k].indexOf(v) < 0) G[k].push(v); });
});

  if (mod.GRAPHICS && G.registerGraphicsPack) {
    const packs = Array.isArray(mod.GRAPHICS) ? mod.GRAPHICS : [mod.GRAPHICS];
    packs.forEach(pk => { if (pk) G.registerGraphicsPack(Object.assign({ id: pk.id || mod.id, modId: mod.id }, pk)); });
}

  if (mod.SPRITES && G.registerExtraSprites) G.registerExtraSprites(mod.SPRITES);
  if (typeof mod.init === "function") mod.init(G);
}

G.discoverMods = function (cb) {
  const files = (window.AETHELGARD_MOD_FILES || []).slice();
  const inject = () => {
    let i = 0;
    const next = () => {
      if (i >= files.length) return cb();
      const f = files[i++];
      const s = document.createElement("script");
      s.src = "mods/" + f;
      s.async = false;
      s.onload = next;
      s.onerror = () => { G.MODS.errors.push({ file:f, error:"could not be loaded" }); next(); };
      (document.head || document.documentElement).appendChild(s);
};
    next();
};
  G.MODS.files = files;
  const served = (() => { try { return location.protocol === "http:" || location.protocol === "https:"; } catch (e) { return false; } })();
  if (served && typeof fetch === "function") {
    fetch("mods/mods.json", { cache:"no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(list => { if (Array.isArray(list)) list.forEach(f => { if (files.indexOf(f) < 0) files.push(f); }); G.MODS.files = files; inject(); })
      .catch(inject);
} else inject();
};

G.registerMods = function () {
  const list = window.AETHELGARD_MODS || [];
  G.MODS.discovered = [];
  list.forEach((m, i) => {
    try {
      if (!m || !m.id) throw new Error("a mod has no id");
      if (G.MODS.discovered.some(x => x.id === m.id)) throw new Error("duplicate mod id: " + m.id);

      if (typeof m.version !== "string") m.version = "1.0";
      G.MODS.discovered.push({
        obj:m, id:m.id, name:m.name || m.id, version:m.version, author:m.author || "unknown",
        description:m.description || "", impact:G.modImpact(m), needsRestart:G.modNeedsRestart(m),
        provides:m.provides || [], keys:modKeys(m),
});
} catch (e) {
      G.MODS.errors.push({ index:i, mod:(m && m.id) || "?", error:String(e && e.message || e) });
      console.warn("[Aethelgard] mod rejected:", e);
}
});
};

G.applyEnabledMods = function (restartAllowed) {
  const allow = typeof restartAllowed === "function" ? restartAllowed : () => !!restartAllowed;
  const applied = [], blocked = [];
  const report = G.modCompatReport();
  const bad = {}; report.errors.forEach(e => { bad[e.id] = true; });
  const ordered = report.order.map(id => G.MODS.discovered.find(d => d.id === id)).filter(Boolean);
  const rest = G.MODS.discovered.filter(d => ordered.indexOf(d) < 0);
  ordered.concat(rest).forEach(d => {
    if (!G.modEnabled(d.id)) return;
    if (d.needsRestart && !allow(d.id)) return;
    if (bad[d.id]) { blocked.push({ id:d.id, name:d.name, reasons:report.errors.filter(e => e.id === d.id).map(e => e.msg) }); return; }
    try { if (applyMod(d.obj) !== false) applied.push(d); }
    catch (e) { G.MODS.errors.push({ mod:d.id, error:String(e && e.message || e) }); console.warn("[Aethelgard] mod failed to apply:", d.id, e); }
});
  G.MODS.blocked = blocked;
  G.MODS.loaded = applied.map(d => ({ id:d.id, name:d.name, version:d.version, impact:d.impact, needsRestart:d.needsRestart }));
  if (G.rebuildSprites) G.rebuildSprites();
  return applied;
};

G.rebuildMods = function () {
  const boot = G.MODS.bootSet || {};
  G.restoreData();
  return G.applyEnabledMods(id => !!boot[id]);
};

G.graphicsMods = function () {
  return ((G.MODS && G.MODS.discovered) || []).filter(d => d.obj && d.obj.GRAPHICS);
};
G.graphicsPackIds = function (mod) {
  if (!mod || !mod.obj || !mod.obj.GRAPHICS) return [];
  const g = mod.obj.GRAPHICS;
  return (Array.isArray(g) ? g : [g]).map(p => p && p.id).filter(Boolean);
};
G.modForPack = function (packId) {
  return G.graphicsMods().find(d => G.graphicsPackIds(d).indexOf(packId) >= 0) || null;
};

G.setModEnabled = function (id, on) {

  if (on) {
    const mine = G.graphicsPackIds(G.MODS.discovered.find(x => x.id === id));
    if (mine.length) {
      G.graphicsMods().forEach(other => {
        if (other.id !== id) G.modPrefs.enabled[other.id] = false;
});
}
}
  G.modPrefs.enabled[id] = !!on;
  G.saveModPrefs();
  const d = G.MODS.discovered.find(x => x.id === id);
  if (d && d.needsRestart) {
    G.notify("info", (on ? "Will enable" : "Will remove") + ": " + d.name, "This mod changes the story — restart the game to apply it.");
} else {
    G.rebuildMods();
    G.notify(on ? "good" : "info", (on ? "Enabled: " : "Disabled: ") + (d ? d.name : id), on ? "Applied immediately." : "Removed immediately.");
}
  if (G.buildSettings) G.buildSettings();
  if (G.render) G.render();
};
G.setSafeMode = function (on) {
  G.modPrefs.safe = !!on;
  G.saveModPrefs();
  G.notify("info", on ? "Safe mode on" : "Safe mode off", "Restart to take effect.");
  if (G.buildSettings) G.buildSettings();
};

G.bootMods = function (cb) {
  G.loadModPrefs();
  G.snapshotData();
  if (G.safeMode()) {
    G.MODS.loaded = [];
    G.log("🛡️ Safe mode: no mods loaded.");
    return cb();
}
  G.discoverMods(() => {
    G.registerMods();
    const applied = G.applyEnabledMods(true);
    const boot = {};
    applied.forEach(d => { boot[d.id] = true; });
    G.MODS.bootSet = boot;

    if (G.applyGraphicsPack) G.applyGraphicsPack(G.settings.graphics || null);
    cb();
});
};
})();
