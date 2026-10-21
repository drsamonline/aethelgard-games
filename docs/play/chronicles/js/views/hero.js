
"use strict";
(function () {
const G = window.Game;
const t = k => G.t(k);
const n = v => G.fmt(v);
const W = k => `data-wiki="${k}"`;
const gearAffix = G.gearAffix;
const questCard = G.questCard;

G.viewHero = function () {
  const p = G.state, c = p.cls ? G.CLASSES[p.cls] : null, r = G.RACES[p.race];
  let h = `<div class="panel"><h2>🧍 ${p.name}</h2><div class="stats-grid">
    <div class="stat-node" ${W("class_"+p.cls)}><div class="sn-left"><span class="sn-name">${c?c.emoji+" "+c.name:"No class"}</span><span class="sn-sub">${c?c.role:""}</span></div></div>
    <div class="stat-node" ${W("race_"+p.race)}><div class="sn-left"><span class="sn-name">${G.sprite(r.kind==="gear"?"gear."+r.key:"item."+r.key, r.emoji)} ${r.name}</span><span class="sn-sub">${r.perk}</span></div></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">${G.sprite("gender."+p.gender, G.GENDERS[p.gender].emoji)} ${G.GENDERS[p.gender].name}</span><span class="sn-sub">Level ${p.level}</span></div></div>
  </div></div>`;

  const attrInfo = { might:"Melee damage", finesse:"Crit & escape", sorcery:"Spell power", vitality:"Health & defence" };
  h += `<div class="panel"><h2 ${W("hp")}>⚔️ ${t("ui.attributes")} <span class="muted small" style="margin-left:auto">${p.ap} AP</span></h2><div class="stats-grid">`;
  for (const a in attrInfo) h += `<div class="stat-node" ${W(a)}><div class="sn-left"><span class="sn-name">${a[0].toUpperCase()+a.slice(1)}</span><span class="sn-sub">${attrInfo[a]}</span></div>
    <div style="display:flex;align-items:center;gap:10px"><span class="sn-val">${p.attrs[a]}</span><button class="btn btn-sm" onclick="Game.investAttr('${a}')" ${p.ap<1?"disabled":""}>+</button></div></div>`;
  h += `</div></div>`;

  h += `<div class="panel"><h2>📊 Combat Stats</h2><div class="stats-grid">
    <div class="stat-node" ${W("attack")}><div class="sn-left"><span class="sn-name">Attack</span></div><span class="sn-val">${Math.floor(G.atkPower())}</span></div>
    <div class="stat-node" ${W("defence")}><div class="sn-left"><span class="sn-name">Defence</span></div><span class="sn-val">${Math.floor(G.defPower())}</span></div>
    <div class="stat-node" ${W("spellpower")}><div class="sn-left"><span class="sn-name">Spell Power</span></div><span class="sn-val">${Math.floor(G.spellPower())}</span></div>
    <div class="stat-node" ${W("crit")}><div class="sn-left"><span class="sn-name">Crit</span></div><span class="sn-val">${Math.round(G.critChance()*100)}%</span></div>
    <div class="stat-node" ${W("flee")}><div class="sn-left"><span class="sn-name">Escape</span></div><span class="sn-val">${Math.round(G.fleeChance()*100)}%</span></div>
    <div class="stat-node" ${W("gold")}><div class="sn-left"><span class="sn-name">Gold bonus</span></div><span class="sn-val">+${Math.round((G.goldMult()-1)*100)}%</span></div>
    ${G.lifesteal()>0?`<div class="stat-node"><div class="sn-left"><span class="sn-name">Lifesteal</span></div><span class="sn-val">${Math.round(G.lifesteal()*100)}%</span></div>`:""}
    ${G.doubleStrike()>0?`<div class="stat-node"><div class="sn-left"><span class="sn-name">Double strike</span></div><span class="sn-val">${Math.round(G.doubleStrike()*100)}%</span></div>`:""}
  </div></div>`;

  h += `<div class="panel"><h2>🎽 ${t("ui.equipment")} <button class="btn btn-sm" style="margin-left:auto" onclick="Game.autoEquipBest()">✨ Auto-equip best</button></h2><div class="stats-grid">`;
  G.SLOTS.forEach(([slot,label]) => {
    const it = p.gear[slot];
    if (!it || !it.key) { h += `<div class="stat-node"><div class="sn-left"><span class="sn-name">${label}</span><span class="sn-sub">Empty</span></div></div>`; return; }
    const g = G.GEAR[it.key], rr = G.RARITIES[it.rarity], cst = G.upgradeCost(slot);
    h += `<div class="stat-node" style="flex-direction:column;align-items:stretch;gap:8px" ${W("gear_"+it.key)}>
      <div class="sn-left"><span class="sn-name" style="color:${rr.color}">${G.sprite("gear."+it.key, g.emoji)} ${g.name} ${it.plus?"+"+it.plus:""}</span><span class="sn-sub">${rr.name} · ${gearAffix(it)}</span></div>
      ${cst && !cst.max ? `<button class="btn btn-sm" onclick="Game.upgradeGear('${slot}')" ${((p.inv.iron||0)<cst.iron||p.gold<cst.gold)?"disabled":""}>🔨 +${it.plus+1} (${cst.iron}⛏️ ${cst.gold}g)</button>` : `<span class="muted small">${cst&&cst.max?"Max (+5)":""}</span>`}
    </div>`;
});
  h += `</div></div>`;

  if (p.gearBag.length) {
    h += `<div class="panel"><h2>🎒 ${t("ui.bag")} <span class="muted small" style="margin-left:auto">${p.gearBag.length}</span></h2><div class="stats-grid">`;
    p.gearBag.forEach((it,i) => { const g = G.GEAR[it.key], rr = G.RARITIES[it.rarity];
      h += `<div class="stat-node" style="flex-direction:column;align-items:stretch;gap:8px" ${W("gear_"+it.key)}>
        <div class="sn-left"><span class="sn-name" style="color:${rr.color}">${G.sprite("gear."+it.key, g.emoji)} ${g.name}</span><span class="sn-sub">${rr.name} · ${G.SLOTS.find(s=>s[0]===g.slot)[1]} · ${gearAffix(it)}</span></div>
        <div class="btn-row"><button class="btn btn-sm" style="flex:1" onclick="Game.equipGear(${i})">${t("ui.equip")}</button><button class="btn btn-sm" style="flex:1" onclick="Game.salvageGear(${i})">${t("ui.salvage")}</button></div></div>`; });
    h += `</div></div>`;
}

  const sets = G.activeSets();
  h += `<div class="panel"><h2>🧩 Gear Sets</h2>`;
  if (!sets.length) h += `<p class="muted small">Wear two or more pieces of a set to gain a bonus. Sets: ${Object.keys(G.GEAR_SETS).map(k=>G.GEAR_SETS[k].name).join(", ")}.</p>`;
  else h += `<div class="stats-grid">` + sets.map(s => `<div class="stat-node"><div class="sn-left"><span class="sn-name">${G.sprite("set."+s.id, s.emoji)} ${s.name} (${s.n}/${s.total})</span><span class="sn-sub">${s.desc}</span></div><span class="sn-val">${s.active}-piece</span></div>`).join("") + `</div>`;
  h += `</div>`;

  const gemKeys = Object.keys(G.GEMS).filter(k => (p.gems[k]||0) > 0);
  h += `<div class="panel"><h2>💎 Enchanting <button class="btn btn-sm" style="margin-left:auto" onclick="Game.cutGem()" ${((p.inv.ruby||0)<G.GEM_COST.ruby||p.gold<G.GEM_COST.gold)?"disabled":""}>✂️ Cut a gem (${G.GEM_COST.ruby}🔴 ${G.GEM_COST.gold}g)</button></h2>
    <p class="muted small">Gems go into sockets. Higher-rarity gear has more sockets.${gemKeys.length?" You own: "+gemKeys.map(k=>G.GEMS[k].emoji+G.GEMS[k].name+" ×"+p.gems[k]).join(", "):" You own no gems — cut one, or find them in the Depths."}</p>`;
  let anySocket = false;
  h += `<div class="stats-grid">`;
  G.SLOTS.forEach(([slot,label]) => {
    const it = p.gear[slot]; if (!it || !it.key) return;
    const free = G.freeSockets(it), have = (it.gems||[]);
    if (free < 1 && !have.length) return;
    anySocket = true;
    h += `<div class="stat-node" style="flex-direction:column;align-items:stretch;gap:8px">
      <div class="sn-left"><span class="sn-name">${G.GEAR[it.key].name}</span><span class="sn-sub">${have.length}/${G.socketsFor(it)} sockets${have.length?" · "+have.map(g=>G.GEMS[g].emoji).join(""):""}</span></div>`;
    have.forEach((g,i) => { h += `<button class="btn btn-sm" onclick="Game.unsocketGem('${slot}',${i})">Remove ${G.sprite("gem."+g, G.GEMS[g].emoji)} ${G.GEMS[g].name}</button>`; });
    if (free > 0 && gemKeys.length) gemKeys.forEach(g => { h += `<button class="btn btn-sm" onclick="Game.socketGem('${slot}','${g}')">Socket ${G.sprite("gem."+g, G.GEMS[g].emoji)} ${G.GEMS[g].name}</button>`; });
    h += `</div>`;
});
  if (!anySocket) h += `<p class="muted small">No sockets available. Equip rarer gear to gain sockets.</p>`;
  h += `</div></div>`;

  h += `<div class="panel"><h2>🤝 Companions <span class="muted small" style="margin-left:auto">${p.companions.length} recruited</span></h2><div class="stats-grid">`;
  G.COMPANIONS.forEach(c => {
    const st = G.compState(c.id), active = p.activeCompanion === c.id;
    if (st) {
      h += `<div class="stat-node" style="flex-direction:column;align-items:stretch;gap:8px">
        <div class="sn-left"><span class="sn-name">${G.sprite("companion."+c.id, c.emoji)} ${c.name}${active?" ★":""}</span><span class="sn-sub">${c.role} · ${Math.max(0,Math.round(st.hp))}/${st.maxHp} HP</span><span class="sn-sub">${c.perk}</span></div>
        <div class="btn-row">${active?`<button class="btn btn-sm" onclick="Game.setActiveCompanion(null)">Dismiss from party</button>`:`<button class="btn btn-sm" onclick="Game.setActiveCompanion('${c.id}')">Set as active</button>`}
        <button class="btn btn-sm" onclick="Game.dismissCompanion('${c.id}')">Release</button></div></div>`;
} else {
      const can = G.canRecruit(c), cost = (c.cost&&c.cost.gold)||0;
      h += `<div class="stat-node" style="flex-direction:column;align-items:stretch;gap:8px;opacity:${can?1:0.6}">
        <div class="sn-left"><span class="sn-name">${G.sprite("companion."+c.id, c.emoji)} ${c.name}</span><span class="sn-sub">${c.desc}</span><span class="sn-sub">${c.perk}</span><span class="sn-sub">Requires: ${G.recruitReqText(c)}${cost?` · ${cost}g`:''}</span></div>
        <button class="btn btn-sm" onclick="Game.recruitCompanion('${c.id}')" ${can?"":"disabled"}>${can?`Recruit${cost?` (${cost}g)`:''}`:"Not available"}</button></div>`;
}
});
  h += `</div></div>`;

  h += `<div class="panel"><h2>🤝 ${t("ui.reputation")}</h2><div class="stats-grid">`;
  const fac = { oakhaven:"🏘️ Oakhaven", coven:"🧟 Iron Coven", bandits:"🏕️ Bandits" };
  for (const f in fac) { const v = p.reputation[f]||0, col = v>20?"var(--success)":v<-20?"var(--danger)":"var(--muted)";
    h += `<div class="stat-node"><div class="sn-left"><span class="sn-name">${fac[f]}</span></div><span class="sn-val" style="color:${col}">${v}</span></div>`; }
  h += `</div></div>`;
  return h;
};
G.investAttr = function (a) { const p = G.state; if (p.ap<1) { G.notify("warning","No AP available",""); return; } p.ap--; p.attrs[a]++; if (a==="vitality") { p.maxHp += 10; p.hp += 10; } G.log(`⬆️ ${a} → ${p.attrs[a]}.`); G.Sound.play("ui"); G.render(); };

})();
