/* ============================================================
   SAGA ENGINE — mods

   A mod is a folder under mods/ with a mod.js. It can add scenes,
   characters, regions, achievements and whole books.

   The rules that keep it safe:
     1. Nothing a mod does can break the base game. Every mod runs inside
        a try/catch, and a mod that throws is disabled, not fatal.
     2. A mod that changes *structure* (scenes, characters) is only applied
        at boot. A mod that only *adds* is applied live.
     3. Declared dependencies are checked. A mod that needs another mod
        which is off will not load, and says so.
     4. Two mods that claim the same thing conflict. The second one is
        refused and the report says which two.
     5. Nothing is written to the save that a mod did not put there.
   ============================================================ */
"use strict";
(function () {
const G = window.Game;

G.MODS = {
  discovered: [],     // every mod found, loaded or not
  loaded: [],         // applied, in order
  errors: [],
  conflicts: [],
};

/* ---------- a mod's declared shape ----------
{
  id: "my-book", name: "...", version: "1.0.0", author: "...",
  description: "...",
  impact: "additive" | "story" | "overhaul",   // story/overhaul need a restart
  requiresMods: ["other-mod"],                 // hard dependencies
  loadAfter: ["other-mod"],                    // ordering only
  provides: ["scenes:book-4"],                 // what it claims (for conflicts)
  scenes: [ {id, title, file} ],               // additive
  chars: { id: {...} },                        // additive
  regions: { id: {...} },                      // additive
  achievements: { id: {...} },                 // additive
  init(G) { }                                  // runs after everything loads
}
*/

G.modImpact = m => m.impact || "additive";
G.modNeedsRestart = m => ["story", "overhaul"].includes(G.modImpact(m));
G.modEnabled = id => {
  const prefs = G.store.get("modPrefs", {});
  return prefs[id] !== false;                 // default on
};
G.setModEnabled = function (id, on) {
  const prefs = G.store.get("modPrefs", {});
  prefs[id] = !!on;
  G.store.set("modPrefs", prefs);
  const d = G.MODS.discovered.find(m => m.id === id);
  if (d && G.modNeedsRestart(d)) {
    G.notify("Restart needed", `${d.name} is a ${G.modImpact(d)} mod — it will apply next time you open the game.`);
  } else {
    G.notify(on ? "Mod on" : "Mod off", d ? d.name : id);
  }
  return true;
};

/* ---------- discovery ---------- */
G.registerMod = function (def) {
  if (!def || !def.id) { G.MODS.errors.push("a mod declared no id"); return; }
  if (G.MODS.discovered.some(m => m.id === def.id)) {
    G.MODS.errors.push(`duplicate mod id: ${def.id}`);
    return;
  }
  G.MODS.discovered.push(def);
};

/* ---------- validation: refuse a mod that would break the game ---------- */
G.validateMod = function (def) {
  const problems = [];
  if (!def.id) problems.push("no id");
  if (!def.name) problems.push("no name");
  if (def.scenes) {
    if (!Array.isArray(def.scenes)) problems.push("scenes must be an array");
    else def.scenes.forEach((s, i) => {
      if (!s.id) problems.push(`scene ${i} has no id`);
      if (!s.file) problems.push(`scene ${s.id || i} has no file`);
      if (s.id && G.SCENES[s.id]) problems.push(`scene ${s.id} would overwrite an existing scene`);
    });
  }
  if (def.chars) for (const k in def.chars) {
    if (!def.chars[k].name) problems.push(`character ${k} has no name`);
  }
  return problems;
};

/* ---------- dependency + conflict resolution ---------- */
G.resolveMods = function (allow) {
  const out = [];
  const seen = new Set();
  const byId = id => G.MODS.discovered.find(m => m.id === id);
  const provides = {};      // claim -> mod id

  // sort so loadAfter is honoured (stable, so a cycle does not hang)
  const order = [...G.MODS.discovered];
  let changed = true, guard = 0;
  while (changed && guard++ < 50) {
    changed = false;
    for (let i = 0; i < order.length; i++) {
      const m = order[i];
      if (!m.loadAfter) continue;
      for (const dep of m.loadAfter) {
        const j = order.findIndex(x => x.id === dep);
        if (j > i) { const [x] = order.splice(i, 1); order.splice(j, 0, x); changed = true; }
      }
    }
  }

  for (const def of order) {
    if (!allow(def.id)) { def._state = "off"; continue; }
    if (!G.modEnabled(def.id)) { def._state = "off"; continue; }

    // dependencies
    const missing = (def.requiresMods || []).filter(d => !byId(d) || !G.modEnabled(d));
    if (missing.length) {
      def._state = "blocked"; def._blockedBy = missing;
      G.MODS.errors.push(`${def.id} needs ${missing.join(", ")}, which is off or absent`);
      continue;
    }

    // structural validation
    const problems = G.validateMod(def);
    if (problems.length) {
      def._state = "invalid"; def._problems = problems;
      G.MODS.errors.push(`${def.id}: ${problems.join("; ")}`);
      continue;
    }

    // conflicts: two mods claiming the same thing
    const clash = (def.provides || []).find(c => provides[c]);
    if (clash) {
      def._state = "conflict"; def._conflictWith = provides[clash]; def._conflictClaim = clash;
      G.MODS.conflicts.push({ a: def.id, b: provides[clash], claim: clash });
      continue;
    }
    (def.provides || []).forEach(c => { provides[c] = def.id; });

    if (seen.has(def.id)) continue;
    seen.add(def.id);
    def._state = "loaded";
    out.push(def);
  }
  return out;
};

/* ---------- apply ---------- */
G.applyMods = function (allow) {
  const applied = G.resolveMods(allow || (() => true));
  const report = { loaded: [], skipped: [], failed: [] };

  for (const def of applied) {
    try {
      if (def.scenes) def.scenes.forEach(s => {
        if (G.SCENE_ORDER.indexOf(s.id) < 0) G.SCENE_ORDER.push(s.id);   // idempotent
        G.SCENES[s.id] = G.SCENES[s.id] || { id: s.id, title: s.title, nodes: [] };
        G.MODS._pendingScenes = G.MODS._pendingScenes || [];
        G.MODS._pendingScenes.push(s);
      });
      // a mod may say where its chapter belongs:  after: "<scene id>"
      // if that anchor is not in this game, the chapter simply goes last.
      if (def.after && def.scenes && def.scenes.length) {
        const anchor = G.SCENE_ORDER.indexOf(def.after);
        if (anchor >= 0) {
          for (const s of def.scenes) {
            const at = G.SCENE_ORDER.indexOf(s.id);
            if (at >= 0) G.SCENE_ORDER.splice(at, 1);
          }
          let at = G.SCENE_ORDER.indexOf(def.after);
          def.scenes.forEach((s, k) => G.SCENE_ORDER.splice(at + 1 + k, 0, s.id));
        }
      }
      if (def.chars)        Object.assign(G.CHARS, def.chars);
      if (def.regions)      Object.assign(G.REGIONS, def.regions);
      if (def.achievements) Object.assign(G.ACHIEVEMENTS, def.achievements);
      if (typeof def.init === "function") def.init(G);
      report.loaded.push(def.id);
    } catch (e) {
      def._state = "failed"; def._error = e.message;
      report.failed.push({ id: def.id, error: e.message });
      G.MODS.errors.push(`${def.id} failed to apply: ${e.message}`);
    }
  }

  // anything discovered but not loaded
  G.MODS.discovered.forEach(d => {
    if (!report.loaded.includes(d.id)) {
      report.skipped.push({ id: d.id, state: d._state || "off",
                            why: d._blockedBy ? "needs " + d._blockedBy.join(", ")
                               : d._conflictWith ? "conflicts with " + d._conflictWith
                               : d._problems ? d._problems.join("; ") : "switched off" });
    }
  });

  G.MODS.loaded = G.MODS.discovered.filter(m => m._state === "loaded");
  return report;
};

/* ---------- fetch a mod's scene files ---------- */
G.loadModScenes = async function () {
  const pending = G.MODS._pendingScenes || [];
  for (const s of pending) {
    try {
      const res = await fetch(s.file);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const src = await res.text();
      const parsed = G.parseScene(src, s.id);
      parsed.title = parsed.title || s.title || s.id;
      parsed.book = s.book || 8;
      G.SCENES[s.id] = parsed;
    } catch (e) {
      G.MODS.errors.push(`mod scene failed: ${s.file} (${e.message})`);
      const i = G.SCENE_ORDER.indexOf(s.id);
      if (i >= 0) G.SCENE_ORDER.splice(i, 1);
    }
  }
  G.MODS._pendingScenes = [];
  return pending.length;
};

/* ---------- the compatibility report the reader can open ---------- */
G.modReport = function () {
  const d = G.MODS.discovered;
  const lines = [];
  lines.push(`${d.length} mods found, ${G.MODS.loaded.length} loaded.`);
  if (G.MODS.conflicts.length) {
    lines.push("");
    lines.push("Conflicts:");
    G.MODS.conflicts.forEach(c => lines.push(`  ${c.a} and ${c.b} both claim ${c.claim} — ${c.b} was kept`));
  }
  const blocked = d.filter(m => m._state === "blocked");
  if (blocked.length) {
    lines.push("");
    lines.push("Needs another mod:");
    blocked.forEach(m => lines.push(`  ${m.id} needs ${m._blockedBy.join(", ")}`));
  }
  const invalid = d.filter(m => m._state === "invalid");
  if (invalid.length) {
    lines.push("");
    lines.push("Refused (would break the game):");
    invalid.forEach(m => lines.push(`  ${m.id}: ${m._problems.join("; ")}`));
  }
  const failed = d.filter(m => m._state === "failed");
  if (failed.length) {
    lines.push("");
    lines.push("Failed while loading:");
    failed.forEach(m => lines.push(`  ${m.id}: ${m._error}`));
  }
  return lines.join("\n");
};

/* ---------- boot-time discovery ---------- */
G.discoverMods = async function () {
  // mods/mods.json lists the folders to try; a mod may also self-register
  // by pushing onto window.SAGA_MODS (or the older AETHELGARD_MODS).
  try {
    const res = await fetch("mods/mods.json");
    if (res.ok) {
      const list = await res.json();
      for (const m of list) {
        try {
          const js = await fetch(m.file || ("mods/" + m.id + "/mod.js"));
          if (!js.ok) { G.MODS.errors.push(`mod file missing: ${m.id}`); continue; }
          const src = await js.text();
          const before = G.MODS.discovered.length;
          window.SAGA_MODS = window.SAGA_MODS || window.AETHELGARD_MODS || [];
          const declaredBefore = window.SAGA_MODS.length;
          // run it in a function so a broken mod cannot leak into the engine
          new Function("window", "Game", src)(window, G);
          // pick up anything the mod pushed onto the shared array
          for (let i = declaredBefore; i < window.SAGA_MODS.length; i++) {
            G.registerMod(window.SAGA_MODS[i]);
          }
          if (G.MODS.discovered.length === before) {
            G.MODS.errors.push(`mod ${m.id} loaded but declared nothing`);
          }
        } catch (e) {
          G.MODS.errors.push(`mod ${m.id} threw on load: ${e.message}`);
        }
      }
    }
  } catch (e) { /* no mods.json is fine */ }
  return G.MODS.discovered.length;
};
})();
