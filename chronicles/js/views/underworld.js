
"use strict";
(function () {
const G = window.Game;
const t = k => G.t(k);
const n = v => G.fmt(v);
const W = k => `data-wiki="${k}"`;
const gearAffix = G.gearAffix;
const questCard = G.questCard;

G.viewUnderworld = function () {
  const p = G.state, u = p.underworld;
  let h = `<div class="panel"><h2>🎭 The Underworld</h2><p class="story-text">Crime runs on Nerve. Success scales with Stealth, Finesse and class — but every job raises <b>Heat</b>.</p>
    <div class="heat-wrap" ${W("heat")}><span>Heat</span><div class="bar-bg" style="flex:1"><div class="bar-fill" style="width:${u.heat}%;background:linear-gradient(90deg,#b83a2e,#ff7a45)"></div></div><span class="sn-val">${u.heat}/100</span></div>
    <div class="stats-grid" style="margin-top:12px">
      <div class="stat-node"><div class="sn-left"><span class="sn-name">Success chance</span></div><span class="sn-val">${Math.round(G.crimeChance()*100)}%</span></div>
      <div class="stat-node" ${W("guild")}><div class="sn-left"><span class="sn-name">Guild renown</span></div><span class="sn-val">${u.guildRep}</span></div>
      <div class="stat-node"><div class="sn-left"><span class="sn-name">Crimes</span></div><span class="sn-val">${p.stats.crimes}</span></div>
    </div></div>`;
  h += `<div class="panel"><h2>🕵️ Jobs</h2><div class="btn-row">
    <button class="btn" onclick="Game.pickpocket()" ${p.nerve<3?"disabled":""}>🎭 Pickpocket (3 nerve)</button>
    <button class="btn" onclick="Game.lockpickChest()" ${p.nerve<2||(p.inv.lockpick||0)<1?"disabled":""}>🗝️ Lockpick (2 nerve)</button>
    <button class="btn btn-danger" onclick="Game.heist()" ${p.nerve<8?"disabled":""}>💰 Heist (8 nerve)</button>
    <button class="btn" onclick="Game.guildJob()" ${p.nerve<4?"disabled":""}>🕵️ Guild Job (4 nerve)</button>
    <button class="btn btn-success" onclick="Game.layLow()" ${p.gold<50||u.heat<1?"disabled":""}>🍺 Lay Low (50g)</button>
  </div></div>`;
  h += `<div class="panel"><h2>🏺 ${t("nav.market")} — Black Market</h2><div class="stats-grid">
    <div class="stat-node" style="flex-direction:column;align-items:stretch;gap:8px" ${W("item_relic")}><div class="sn-left"><span class="sn-name">🏺 Stolen Relic</span><span class="sn-sub">You hold: ${p.inv.relic||0}</span></div>
      <div class="btn-row"><button class="btn btn-sm" style="flex:1" onclick="Game.blackBuy()" ${p.gold<60?"disabled":""}>Buy 60g</button><button class="btn btn-sm" style="flex:1" onclick="Game.blackSell()" ${(p.inv.relic||0)<1?"disabled":""}>Fence ~110g</button></div></div>
  </div></div>`;
  return h;
};

})();
