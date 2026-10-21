
"use strict";
(function () {
const G = window.Game;
const t = k => G.t(k);
const n = v => G.fmt(v);
const W = k => `data-wiki="${k}"`;
const gearAffix = G.gearAffix;
const questCard = G.questCard;

G.viewHome = function () {
  const p = G.state, s = p.settlement, need = G.settleCost();
  let h = `<div class="panel"><h2>🏰 Settlement — ${G.settlementName()}</h2><div class="stats-grid">
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Population</span></div><span class="sn-val">${s.pop}</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Treasury</span></div><span class="sn-val">${n(s.treasury)}g</span></div>
    <div class="stat-node" ${W("settlement")}><div class="sn-left"><span class="sn-name">Base income</span></div><span class="sn-val">${s.level*2}g/tick</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Wood held</span></div><span class="sn-val">${p.inv.wood||0}</span></div>
  </div>`;
  if (need !== null) h += `<hr class="hr"><button class="btn btn-primary" onclick="Game.upgradeSettlement()" ${(p.inv.wood||0)<need?"disabled":""}>Upgrade settlement (${need}🪵)</button>`;
  h += `</div>`;
  h += `<div class="panel"><h2>🏗️ Structures</h2><div class="stats-grid">`;
  const assigned = Object.values(s.workers).reduce((a,v)=>a+v,0);
  for (const key in G.BUILDINGS) { const b = G.BUILDINGS[key], lv = s.buildings[key]||0;
    const costStr = Object.keys(b.cost).map(k=>`${b.cost[k]}${G.sprite("item."+k, G.ITEMS[k].emoji)}`).join(" ");
    h += `<div class="stat-node" style="flex-direction:column;align-items:stretch;gap:8px" ${W("bld_"+key)}>
      <div class="sn-left"><span class="sn-name">${G.sprite("bld."+key, b.emoji)} ${b.name} — Lv ${lv}/${b.max}</span><span class="sn-sub">${b.desc}</span></div>
      ${lv<b.max?`<button class="btn btn-sm" onclick="Game.buildStructure('${key}')">Build (${costStr})</button>`:`<span class="muted small">Fully built</span>`}
      ${s.workers[key]!==undefined?`<div class="worker-row" ${W("workers")}>Settlers: <b>${s.workers[key]||0}</b><button class="btn btn-sm" onclick="Game.assignWorker('${key}',-1)">−</button><button class="btn btn-sm" onclick="Game.assignWorker('${key}',1)">+</button></div>`:""}
    </div>`; }
  h += `</div><p class="muted small" style="margin-top:12px">Settlers assigned: ${assigned} / ${s.pop}.</p></div>`;

  const threat = 20 + p.level*3, score = G.defenceScore();
  h += `<div class="panel"><h2>🛡️ Defence</h2>
    <p class="story-text">Raiders attack your settlement from time to time. Raise walls and hire guards so your defences hold without a fight.</p>
    <div class="stats-grid">
      <div class="stat-node"><div class="sn-left"><span class="sn-name">Defence score</span><span class="sn-sub">vs current threat ${threat}</span></div><span class="sn-val" style="color:${score>=threat?"var(--success)":"var(--danger)"}">${score}</span></div>
      <div class="stat-node"><div class="sn-left"><span class="sn-name">Walls</span></div><span class="sn-val">${p.defence.walls||0}/5</span></div>
      <div class="stat-node"><div class="sn-left"><span class="sn-name">Guards</span></div><span class="sn-val">${p.defence.guards||0}/5</span></div>
      <div class="stat-node"><div class="sn-left"><span class="sn-name">Raids repelled</span></div><span class="sn-val">${p.stats.defendsWon}</span></div>
    </div>
    <div class="btn-row" style="margin-top:10px">
      <button class="btn" onclick="Game.buildWall()" ${(p.defence.walls||0)>=5?"disabled":""}>🧱 Raise wall (${30+(p.defence.walls||0)*15}🪵 ${5+(p.defence.walls||0)*3}⛏️)</button>
      <button class="btn" onclick="Game.hireGuard()" ${(p.defence.guards||0)>=5?"disabled":""}>💂 Hire guard (${60+(p.defence.guards||0)*40}g)</button>
    </div></div>`;

  h += `<div class="panel"><h2>🐫 Trade Caravans</h2><p class="muted small">Invest gold in a route. It returns a profit after a while — unless bandits take it.</p><div class="stats-grid">`;
  G.CARAVAN_ROUTES.forEach(r => {
    const running = (p.caravans||[]).find(c => c.id === r.id);
    h += `<div class="stat-node" style="flex-direction:column;align-items:stretch;gap:8px">
      <div class="sn-left"><span class="sn-name">${r.name}</span><span class="sn-sub">Cost ${r.cost}g · returns ~${Math.round(r.cost*r.mult)}g · risk ${Math.round(r.risk*100)}%</span></div>
      ${running ? `<span class="muted small">In transit — ${running.ticksLeft} ticks left</span>` : `<button class="btn btn-sm" onclick="Game.investCaravan('${r.id}')" ${p.gold<r.cost?"disabled":""}>Send caravan (${r.cost}g)</button>`}
    </div>`;
});
  h += `</div><p class="muted small" style="margin-top:8px">Total caravan profit: ${p.stats.caravansIncome}g</p></div>`;
  return h;
};

})();
