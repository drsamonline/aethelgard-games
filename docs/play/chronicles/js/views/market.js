
"use strict";
(function () {
const G = window.Game;
const t = k => G.t(k);
const n = v => G.fmt(v);
const W = k => `data-wiki="${k}"`;
const gearAffix = G.gearAffix;
const questCard = G.questCard;

G.viewMarket = function () {
  const p = G.state;
  let h = `<div class="panel"><h2>🏪 ${t("nav.market")} <button class="btn btn-sm" style="margin-left:auto" onclick="Game.sellAllMaterials()">💰 Sell all materials</button></h2><p class="muted small" style="margin-bottom:14px">Prices shift constantly. Reputation and a Trade Post improve prices.</p><div class="stats-grid">`;
  [["wood","🪵 Wood"],["iron","⛏️ Iron"],["leather","🟫 Leather"],["ruby","💎 Ruby"],["food","🍞 Food"],["fish","🐟 Fish"],["herb","🌿 Herb"],["ore","🪨 Deep Ore"]].forEach(([k,label]) => {
    const sell = Math.round((p.market[k]||10)*G.goldMult()), buy = G.priceBuy(k);
    h += `<div class="stat-node" style="flex-direction:column;align-items:stretch;gap:10px" ${W("item_"+k)}>
      <div style="display:flex;justify-content:space-between;align-items:center"><div class="sn-left"><span class="sn-name">${label}</span><span class="sn-sub">You hold: ${p.inv[k]||0}</span></div><span class="sn-val">${sell}g</span></div>
      <div class="btn-row"><button class="btn btn-sm" style="flex:1" onclick="Game.sellItem('${k}')" ${(p.inv[k]||0)<1?"disabled":""}>${t("ui.sell")} ${sell}g</button>
      <button class="btn btn-sm" style="flex:1" onclick="Game.buyItem('${k}')" ${p.gold<buy?"disabled":""}>${t("ui.buy")} ${buy}g</button></div></div>`; });
  h += `</div></div>`;
  h += `<div class="panel"><h2>🧪 Apothecary</h2><div class="stats-grid">`;
  [["potion",30],["ether",40],["antidote",25],["elixir",60],["meal",45]].forEach(([k,price]) => {
    h += `<div class="stat-node" style="flex-direction:column;align-items:stretch;gap:10px" ${W("item_"+k)}>
      <div style="display:flex;justify-content:space-between;align-items:center"><div class="sn-left"><span class="sn-name">${G.sprite("item."+k, G.ITEMS[k].emoji)} ${G.ITEMS[k].name}</span><span class="sn-sub">You hold: ${p.inv[k]||0}</span></div><span class="sn-val">${price}g</span></div>
      <button class="btn btn-sm" onclick="Game.buyConsumable('${k}',${price})" ${p.gold<price?"disabled":""}>${t("ui.buy")} ${price}g</button></div>`; });
  h += `</div></div>`;
  return h;
};

})();
