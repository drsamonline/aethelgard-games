
"use strict";
(function () {
const G = window.Game;

G.GRAPHICS_PACKS = {};
G.SPRITES = {};
G.activeGraphicsPack = null;
let packVars = [];

G.registerGraphicsPack = function (pack) {
  if (!pack || !pack.id) return;
  G.GRAPHICS_PACKS[pack.id] = Object.assign({ sprites:{} }, pack);
};

G.graphicsPackList = function () { return Object.keys(G.GRAPHICS_PACKS).map(id => G.GRAPHICS_PACKS[id]); };

G.extraSprites = {};
G.registerExtraSprites = function (map) {
  Object.assign(G.extraSprites, map || {});
  if (G.activeGraphicsPack) G.applyGraphicsPack(G.activeGraphicsPack);
};

G.applyGraphicsPack = function (id) {

  packVars.forEach(v => document.documentElement.style.removeProperty(v));
  packVars = [];
  try { document.body.style.backgroundImage = ""; } catch (e) {}
  G.SPRITES = {};
  G.activeGraphicsPack = null;

  Object.keys(G.extraSprites).forEach(key => {
    const v = G.extraSprites[key];
    const s = (typeof v === "string") ? { src: v } : Object.assign({}, v);
    if (s.src) G.SPRITES[key] = s;
});

  const pack = id ? G.GRAPHICS_PACKS[id] : null;
  const base = pack ? (pack.base || "") : "";
  if (pack) {
    G.activeGraphicsPack = id;
    Object.keys(pack.sprites || {}).forEach(key => {
      const v = pack.sprites[key];
      const s = (typeof v === "string") ? { src: v } : Object.assign({}, v);
      if (!s.src) return;
      s.src = base + s.src;
      if (s.scale == null && pack.scale != null) s.scale = pack.scale;
      if (s.pixel == null && pack.pixel != null) s.pixel = pack.pixel;
      G.SPRITES[key] = s;
});
}

  Object.keys(G.SPRITES).forEach(k => {
    if (k.indexOf("class.") === 0) {
      const pid = "player." + k.slice(6);
      if (!G.SPRITES[pid]) G.SPRITES[pid] = G.SPRITES[k];
}
});

  if (!pack) return;
  if (pack.palette) {
    Object.keys(pack.palette).forEach(v => {
      try { document.documentElement.style.setProperty(v, pack.palette[v]); packVars.push(v); } catch (e) {}
});
}
  if (pack.background) { try { document.body.style.backgroundImage = `url("${base + pack.background}")`; } catch (e) {} }
  if (G.log) G.log(`🎨 Graphics pack: ${pack.name || id}`);
};

G.refreshBackground = function () {
  const p = G.state, root = document.documentElement.style;
  const url = key => { const s = key ? G.SPRITES[key] : null; return s ? `url("${s.src}")` : ""; };
  const region = p && p.map ? url("bg." + p.map.current) : "";
  try {
    root.setProperty("--bg-region", region || "none");
    root.setProperty("--bg-combat", url("bg.combat") || "none");

    const mode = (G.activeMode && G.activeMode()) || null;
    const modeBg = mode && mode.titleBg ? url(mode.titleBg) : "";
    root.setProperty("--bg-title", modeBg || url("bg.title") || "none");
    document.body.classList.toggle("has-region-bg", !!region);
} catch (e) {}
};

G.rebuildSprites = function () { G.applyGraphicsPack(G.activeGraphicsPack); if (G.refreshBackground) G.refreshBackground(); };

function esc(s) { return String(s == null ? "" : s).replace(/"/g, "&quot;").replace(/</g, "&lt;"); }

G.sprite = function (key, fallback, opts) {
  opts = opts || {};
  const fb = fallback == null ? "•" : String(fallback);
  const s = key ? G.SPRITES[key] : null;
  if (!s) return esc(fb);
  const cls = "spr" + (opts.cls ? " " + opts.cls : "") + (s.pixel ? " spr-pixel" : "") + (opts.size ? " spr-" + opts.size : "");

  const style = (s.scale != null && !opts.size ? `width:${s.scale}em;height:${s.scale}em;` : "");
  const onerr = `onerror="Game.spriteFallback(this)"`;
  if (s.sheet && s.sheet.w && s.sheet.h) {

    const sh = s.sheet, frames = s.frames || 1;
    const cols = s.cols || Math.max(1, Math.round(sh.x / sh.w) + 1);
    const rows = s.rows || Math.max(1, Math.round(sh.y / sh.h) + 1);
    const col = Math.round(sh.x / sh.w), row = Math.round(sh.y / sh.h);
    const bx = cols > 1 ? (col / (cols - 1)) * 100 : 0;
    const by = rows > 1 ? (row / (rows - 1)) * 100 : 0;
    const size = (s.scale != null && !opts.size) ? `width:${s.scale}em;height:${s.scale}em;` : "";
    const anim = frames > 1
      ? `animation:sprSheet ${(frames / (s.fps || 6)).toFixed(3)}s steps(${frames}) infinite;--cols:${cols};--col:${col};--frames:${frames};`
      : "";
    return `<span class="spr-crop${opts.size ? " spr-" + opts.size : ""}" role="img" aria-label="${esc(fb)}" ` +
      `data-fb="${esc(fb)}" style="background-image:url('${esc(s.src)}');` +
      `background-size:${cols * 100}% ${rows * 100}%;background-position:${bx}% ${by}%;${size}${anim}"></span>`;
}
  return `<img class="${cls}" src="${esc(s.src)}" alt="${esc(fb)}" data-fb="${esc(fb)}" ${onerr}${style ? ` style="${style}"` : ""}>`;
};

G.spriteFallback = function (img) {
  try {
    const fb = (img.getAttribute && img.getAttribute("data-fb")) || "•";
    const span = document.createElement("span");
    span.className = "spr-missing";
    span.textContent = fb;
    const host = img.closest ? img.closest(".spr-crop") : null;
    (host || img).replaceWith(span);
} catch (e) {}
};

})();
