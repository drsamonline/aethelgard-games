
"use strict";
(function () {
const G = window.Game;

let tipEl = null, tipFor = null;
function ensureTip() {
  if (!tipEl) { tipEl = document.createElement("div"); tipEl.id = "tooltip"; tipEl.className = "hidden"; document.body.appendChild(tipEl); }
  return tipEl;
}
G.showTooltip = function (key, x, y) {
  if (!G.settings.tooltips) return;
  const w = G.WIKI[key]; if (!w) return;
  const t = ensureTip();
  t.innerHTML = `<div class="tt-cat">${w.cat}</div><div class="tt-title">${w.title}</div><div class="tt-body">${w.body}</div>`;
  t.classList.remove("hidden");
  tipFor = key;
  G.positionTooltip(x, y);
};
G.positionTooltip = function (x, y) {
  const t = tipEl; if (!t || t.classList.contains("hidden")) return;
  const pad = 14;
  const w = t.offsetWidth, h = t.offsetHeight;
  let left = x + pad, top = y + pad;
  if (left + w > window.innerWidth - 8) left = x - w - pad;
  if (top + h > window.innerHeight - 8) top = y - h - pad;
  t.style.left = Math.max(8, left) + "px";
  t.style.top = Math.max(8, top) + "px";
};
G.hideTooltip = function () { if (tipEl) tipEl.classList.add("hidden"); tipFor = null; };

G.initTooltips = function () {
  document.addEventListener("mouseover", e => {
    const el = e.target.closest ? e.target.closest("[data-wiki]") : null;
    if (!el) return;
    const key = el.getAttribute("data-wiki");
    if (!key || key === tipFor) return;
    G.showTooltip(key, e.clientX, e.clientY);
});
  document.addEventListener("mousemove", e => { if (tipFor) G.positionTooltip(e.clientX, e.clientY); });
  document.addEventListener("mouseout", e => {
    const el = e.target.closest ? e.target.closest("[data-wiki]") : null;
    if (el) G.hideTooltip();
});
  document.addEventListener("touchstart", e => {
    const el = e.target.closest ? e.target.closest("[data-wiki]") : null;
    if (el && G.settings.tooltips) { const r = el.getBoundingClientRect(); G.showTooltip(el.getAttribute("data-wiki"), r.left, r.bottom); setTimeout(() => G.hideTooltip(), 2600); }
}, { passive:true });
  window.addEventListener("scroll", () => G.hideTooltip(), true);
};

G.wikiFilter = "";

let WIKI_INDEX = null;
function wikiIndex() {
  if (!WIKI_INDEX || WIKI_INDEX.length !== Object.keys(G.WIKI).length) {
    WIKI_INDEX = Object.keys(G.WIKI).map(k => {
      const w = G.WIKI[k];
      return { key: k, cat: w.cat, title: w.title, short: w.short,
               hay: (w.title + " " + w.cat + " " + (w.body || "")).toLowerCase() };
});
}
  return WIKI_INDEX;
}

const WIKI_PAGE = 40;
G.wikiExpanded = {};

function wikiMatches(q) {
  const idx = wikiIndex();
  if (!q) return idx;
  return idx.filter(e => e.hay.indexOf(q) >= 0);
}

G.wikiResultsHTML = function () {
  const q = (G.wikiFilter || "").toLowerCase();
  const hits = wikiMatches(q);
  const byCat = {};
  hits.forEach(e => { (byCat[e.cat] = byCat[e.cat] || []).push(e); });
  const cats = G.WIKI_CATS.filter(c => byCat[c]);
  Object.keys(byCat).filter(c => cats.indexOf(c) < 0).forEach(c => cats.push(c));

  let h = "";
  cats.forEach(cat => {
    const all = byCat[cat];
    const open = !!G.wikiExpanded[cat] || !!q;
    h += `<div class="panel wiki-cat${open ? " open" : ""}">`;
    h += `<button class="wiki-cat-head" onclick="Game.wikiToggle('${cat.replace(/'/g, "\\'")}')">`
       + `<span class="wch-name">${cat}</span>`
       + `<span class="wch-count">${all.length}</span>`
       + `<span class="wch-caret">${open ? "\u25BE" : "\u25B8"}</span></button>`;
    if (open) {
      const shown = q ? all : all.slice(0, WIKI_PAGE);
      h += `<div class="wiki-grid">`;
      shown.forEach(e => {
        h += `<div class="wiki-entry" data-wiki="${e.key}"><span class="we-title">${e.title}</span><span class="we-short">${e.short}</span></div>`;
});
      h += `</div>`;
      if (!q && all.length > WIKI_PAGE) {
        h += `<button class="btn btn-sm" style="margin-top:.6rem" onclick="Game.wikiShowAll('${cat.replace(/'/g, "\\'")}')">Show all ${all.length}</button>`;
}
}
    h += `</div>`;
});
  if (!hits.length) h += `<div class="panel"><p class="muted">No entries match your search.</p></div>`;
  return h;
};

G.wikiToggle = function (cat) {
  G.wikiExpanded[cat] = !G.wikiExpanded[cat];
  const r = document.getElementById("wiki-results");
  if (r) r.innerHTML = G.wikiResultsHTML();
};

G.wikiShowAll = function (cat) {
  G.wikiExpanded[cat] = true;
  const r = document.getElementById("wiki-results");
  if (r) r.innerHTML = G.wikiResultsHTML();
};

G.setWikiFilter = function (v) {
  G.wikiFilter = v || "";
  const r = document.getElementById("wiki-results");
  if (r) r.innerHTML = G.wikiResultsHTML();
  const c = document.getElementById("wiki-count");
  if (c) c.textContent = G.wikiCount();
};
G.wikiCount = function () { return wikiMatches((G.wikiFilter || "").toLowerCase()).length; };

G.viewWiki = function () {
  return `<div class="panel"><h2>\uD83D\uDCD6 Wiki <span class="muted small" style="margin-left:auto"><span id="wiki-count">${G.wikiCount()}</span> entries</span></h2>
    <input class="wiki-search" type="search" placeholder="${G.t("ui.search")}…" value="${G.wikiFilter}" oninput="Game.setWikiFilter(this.value)" />
    <p class="muted small" style="margin-top:8px">Hover any highlighted item, stat or button in the game to see its explanation. You can turn tooltips off in Settings.</p></div>
    <div id="wiki-results">${G.wikiResultsHTML()}</div>`;
};
})();
