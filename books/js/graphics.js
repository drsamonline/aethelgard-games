/* ============================================================
   SAGA ENGINE — graphics

   Resolves a name like "char.bryn" or "bg.mire" to an actual image.
   Everything is looked up case-insensitively and fails soft: a missing
   portrait never breaks a scene, it just doesn't draw.

   The engine ships no art: a game supplies its own sprite pack.
   ============================================================ */
"use strict";
(function () {
const G = window.Game;

G.BASE = "assets/sprites/";

/* The engine does not know the filenames ahead of time (a mod can add more),
   so it builds an index from the manifest and falls back to a naming rule. */
G.spriteIndex = {};
G._norm = function (s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""); };

/* ---------- the naming rule ----------
   char.<id>[.<expr>]  ->  <sprite>[_<expr>].webp, then <sprite>.webp
   bg.<region>         ->  bg_<region>.webp
   poi.<region>.<id>   ->  poi_<region>_<id>.webp
   skill./status./bld./set./ach./item. -> <kind>_<id>.webp
*/
G.spriteCandidates = function (key) {
  const out = [];
  const [kind, ...rest] = String(key).split(".");
  const tail = rest.join("_");

  if (kind === "char" || kind === "player") {
    const id = rest[0], expr = rest[1];
    const c = G.CHARS[id] || {};
    const file = c.sprite || id;
    if (expr && expr !== "neutral") out.push(`${file}_${expr}.webp`);
    out.push(`${file}.webp`);
    if (id) out.push(`${G._norm(id)}.webp`);
    if (id) out.push(`${G._norm(id)}_${expr || "neutral"}.webp`);
  } else if (kind === "bg") {
    const r = G.REGIONS && G.REGIONS[tail];
    if (r && r.bg && r.bg !== ("bg_" + tail)) out.push(r.bg + ".webp");
    out.push(`bg_${tail}.webp`);
    out.push(`loc_${tail}.webp`);
  } else {
    out.push(`${kind}_${tail}.webp`);
    out.push(`${G._norm(kind)}_${G._norm(tail)}.webp`);
  }
  return out;
};

/* ---------- lookup ---------- */
G.sprite = function (key, expr) {
  const k = expr ? key + "." + expr : key;
  const cands = G.spriteCandidates(k);
  for (const c of cands) {
    if (G.spriteIndex[c]) return G.BASE + G.spriteIndex[c];
    // the index may be absent (file://), so also try the file directly
    if (G.spriteIndex.__complete === false) return G.BASE + c;
  }
  return null;
};

/* ---------- background ---------- */
G.setBg = function (name) {
  const el = document.getElementById("bg");
  const src = G.sprite("bg." + name) || G.sprite("bg." + ((G.REGIONS[name] && G.REGIONS[name].bg) || name));
  if (!src) { el.style.backgroundImage = ""; el.dataset.region = name; return; }
  const next = document.createElement("div");
  next.className = "bg-layer";
  next.style.backgroundImage = `url("${src}")`;
  el.appendChild(next);
  requestAnimationFrame(() => next.classList.add("in"));
  // fade the previous one out
  const layers = el.querySelectorAll(".bg-layer");
  if (layers.length > 1) {
    const old = layers[0];
    old.classList.remove("in");
    setTimeout(() => old.remove(), 900);
  }
  el.dataset.region = name;
};

/* ---------- build the index from a directory listing ---------- */
G.buildSpriteIndex = async function () {
  try {
    const res = await fetch(G.BASE + "index.json");
    if (res.ok) {
      const list = await res.json();
      const map = {};
      list.forEach(f => { map[f.toLowerCase()] = f; });
      map.__complete = true;
      G.spriteIndex = map;
      return list.length;
    }
  } catch (e) {}
  // no manifest — fall back to the naming rule and let the browser 404 quietly
  G.spriteIndex = { __complete: false };
  return 0;
};
})();
