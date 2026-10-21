
"use strict";
(function () {
const G = window.Game;
const t = k => G.t(k);
const n = v => G.fmt(v);
const W = k => `data-wiki="${k}"`;
const gearAffix = G.gearAffix;
const questCard = G.questCard;

G.viewInventory = function () {
  const p = G.state;
  const mats = Object.keys(G.ITEMS).filter(k => G.ITEMS[k].material);
  const cons = Object.keys(G.ITEMS).filter(k => G.ITEMS[k].use && G.ITEMS[k].use !== "tool");
  const tools = Object.keys(G.ITEMS).filter(k => G.ITEMS[k].use === "tool" || G.ITEMS[k].contraband || G.ITEMS[k].quest);
  const row = (k, extra) => `<div class="stat-node" ${W("item_"+k)}><div class="sn-left"><span class="sn-name">${G.sprite("item."+k, G.ITEMS[k].emoji)} ${G.ITEMS[k].name}</span><span class="sn-sub">${extra||""}</span></div>
    <div style="display:flex;align-items:center;gap:8px"><span class="sn-val">${p.inv[k]||0}</span>${(p.inv[k]||0)>0?`<button class="btn btn-sm" onclick="Game.dropItem('${k}')">${t("ui.drop")}</button>`:""}</div></div>`;
  const mode = G.invSort || "type";
  const sorter = (a,b) => mode === "value" ? (G.ITEMS[b].val||0)-(G.ITEMS[a].val||0) : mode === "name" ? G.ITEMS[a].name.localeCompare(G.ITEMS[b].name) : 0;
  mats.sort(sorter); cons.sort(sorter); tools.sort(sorter);
  let h = `<div class="panel"><h2>🎒 ${t("ui.inventory")}</h2>
    <div class="chip-row" style="margin-bottom:10px">
      <button class="chip ${mode==="type"?"on":""}" onclick="Game.setInvSort('type')">By type</button>
      <button class="chip ${mode==="value"?"on":""}" onclick="Game.setInvSort('value')">By value</button>
      <button class="chip ${mode==="name"?"on":""}" onclick="Game.setInvSort('name')">By name</button>
      <button class="chip" onclick="Game.sellAllMaterials()">💰 Sell all materials</button>
    </div>
    <h3>Materials</h3><div class="stats-grid">${mats.map(k=>row(k)).join("")}</div>
    <h3>Consumables</h3><div class="stats-grid">${cons.map(k=>row(k, G.ITEMS[k].use)).join("")}</div>
    <h3>Other</h3><div class="stats-grid">${tools.map(k=>row(k)).join("")}</div></div>`;
  return h;
};

})();
