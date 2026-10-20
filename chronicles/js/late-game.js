
"use strict";
(function () {
const G = window.Game;

G.endlessModsFor = function (floor) {
  const n = Math.min(3, 1 + Math.floor(floor / 2));
  const pool = Object.keys(G.ENDLESS_MODS), out = [];
  while (out.length < n && out.length < pool.length) { const k = G.pick(pool); if (out.indexOf(k) < 0) out.push(k); }
  return out;
};
G.endlessHas = function (key) { return (G.state.endless.mods||[]).indexOf(key) >= 0; };
G.endlessEnemies = function () {
  const f = G.state.endless.floor || 1;
  const count = 1 + Math.min(2, Math.floor(f / 3)) + (G.endlessHas("swarm") ? 1 : 0);
  const pool = G.ENDLESS_FLOOR_POOL;
  const out = [];
  for (let i = 0; i < count; i++) out.push(G.pick(pool));
  return out;
};
G.endlessOpts = function () {
  const o = { cost:0, context:"endless" };
  if (G.endlessHas("enraged") || G.endlessHas("greedy")) o.atkMult = G.endlessHas("enraged") ? 1.25 : 1.1;
  if (G.endlessHas("armored")) o.defMult = 1.4;
  if (G.endlessHas("venomous")) o.onHitStatus = "poison";
  if (G.endlessHas("elite")) o.forceElite = true;
  return o;
};
G.startEndless = function () {
  const p = G.state;
  if (p.energy < 15) { G.notify("warning", "Need 15 energy", ""); return; }
  p.energy -= 15;
  if (!p.endless.active) { p.endless.active = true; p.endless.floor = 1; p.endless.mods = G.endlessModsFor(1); }
  const mods = p.endless.mods.map(k => G.ENDLESS_MODS[k].name).join(", ") || "none";
  G.notify("event", `The Depths — Floor ${p.endless.floor}`, "Modifiers: " + mods);
  G.log(`🕳️ Descending to floor ${p.endless.floor}. Modifiers: ${mods}.`);
  G.startCombat(G.endlessEnemies(), G.endlessOpts());
};
G.endlessWin = function () {
  const p = G.state, f = p.endless.floor || 1;
  const gold = Math.round((30 + f * 22) * (G.endlessHas("greedy") ? 2 : 1) * G.goldMult());
  const xp = Math.round(40 + f * 30);
  p.gold += gold; p.stats.goldEarned += gold; G.gainXP(xp);
  let drop = "";
  if (Math.random() < 0.35 + f * 0.01) {
    const key = G.pick(Object.keys(G.GEAR).filter(k => G.GEAR[k].tier <= Math.min(4, 1 + Math.floor(f / 3))));
    const rarity = G.rollRarity(Math.min(5, 1 + Math.floor(f / 3)));
    const n = G.RARITIES[rarity].affixes, aff = [], pool = Object.keys(G.AFFIXES);
    for (let i = 0; i < n; i++) { const a = G.pick(pool); if (aff.indexOf(a) < 0) aff.push(a); }
    p.gearBag.push({ key, plus:0, rarity, affix:aff, gems:[] });
    if (rarity === "legendary") p.stats.legendaries++; if (rarity === "mythic") p.stats.mythics++;
    drop = ` + a ${G.RARITIES[rarity].name} ${G.GEAR[key].name}`;
}
  if (Math.random() < 0.4) { const g = G.pick(Object.keys(G.GEMS)); p.gems[g] = (p.gems[g]||0)+1; drop += ` + ${G.GEMS[g].name} gem`; }
  p.endless.floor = f + 1;
  p.endless.mods = G.endlessModsFor(p.endless.floor);
  p.stats.endlessBest = Math.max(p.stats.endlessBest, f);
  G.notify("good", `Floor ${f} cleared!`, `+${gold}g · +${xp}xp${drop}`);
  G.log(`🏆 Cleared floor ${f}. Next: floor ${p.endless.floor}.`);
  G.checkAchievements();
};
G.endlessRetreat = function () {
  const p = G.state;
  if (p.endless.floor > 0) G.notify("info", "You retreat from the Depths", `Best floor this run: ${p.endless.floor}`);
  p.endless.active = false; p.endless.floor = 0; p.endless.mods = [];
  G.render();
};
G.endlessDeath = function () {
  const p = G.state;
  p.endless.active = false; p.endless.floor = 0; p.endless.mods = [];
};

G.defenceScore = function () {
  const p = G.state, s = p.settlement;
  return (s.buildings.barracks||0)*10 + (p.defence.walls||0)*12 + (p.defence.guards||0)*8;
};
G.buildWall = function () {
  const p = G.state;
  if ((p.defence.walls||0) >= 5) { G.notify("warning", "Walls are at maximum", ""); return; }
  const cost = { wood:30 + (p.defence.walls||0)*15, iron:5 + (p.defence.walls||0)*3 };
  if ((p.inv.wood||0) < cost.wood || (p.inv.iron||0) < cost.iron) { G.notify("warning", "Missing materials", `${cost.wood} wood, ${cost.iron} iron`); return; }
  p.inv.wood -= cost.wood; p.inv.iron -= cost.iron; p.defence.walls = (p.defence.walls||0)+1;
  G.notify("good", "Wall raised", `Defence level ${p.defence.walls}`); G.Sound.play("craft"); G.render();
};
G.hireGuard = function () {
  const p = G.state;
  if ((p.defence.guards||0) >= 5) { G.notify("warning", "Guard roster is full", ""); return; }
  const cost = 60 + (p.defence.guards||0)*40;
  if (p.gold < cost) { G.notify("warning", `Needs ${cost} gold`, ""); return; }
  p.gold -= cost; p.defence.guards = (p.defence.guards||0)+1;
  G.notify("good", "Guard hired", `Guards: ${p.defence.guards}`); G.Sound.play("coin"); G.render();
};
G.settlementRaid = function () {
  const p = G.state;
  if (p.settlement.level < 1) { G.notify("info", "Raiders pass by", "You have no settlement to raid"); return; }
  const threat = 20 + p.level * 3;
  const score = G.defenceScore();
  if (score >= threat) { p.stats.defendsWon++; G.notify("good", "Your defences held!", `Defence ${score} vs threat ${threat}`); return; }
  const loss = Math.min(p.settlement.treasury, 20 + p.settlement.level*15);
  p.settlement.treasury -= loss;
  G.notify("bad", "Your settlement is under attack!", `Treasury −${loss}g — defend it!`);
  G._raidThreat = threat;
  G.startCombat(["bandit","bandit"], { cost:0, context:"raid" });
};
G.raidWon = function () { const p = G.state; p.stats.defendsWon++; G.notify("good", "Raid repelled!", "Your settlement is safe."); };
G.raidLost = function () { const p = G.state; const loss = Math.min(p.settlement.treasury, 40 + p.settlement.level*20); p.settlement.treasury -= loss; G.notify("bad", "The raid succeeded", `Treasury −${loss}g`); };

G.CARAVAN_ROUTES = [
  { id:"mire",   name:"Mire Timber Run",   cost:80,  ticks:30, mult:1.7, risk:0.12 },
  { id:"peaks",  name:"Iron Peaks Convoy", cost:160, ticks:45, mult:2.0, risk:0.18 },
  { id:"ruins",  name:"Ruins Relic Trail", cost:260, ticks:60, mult:2.6, risk:0.28 },
];
G.investCaravan = function (id) {
  const p = G.state, r = G.CARAVAN_ROUTES.find(x => x.id === id);
  if (!r) return;
  if (p.gold < r.cost) { G.notify("warning", `Needs ${r.cost} gold`, ""); return; }
  if ((p.caravans||[]).some(c => c.id === id)) { G.notify("warning", "A caravan is already on that route", ""); return; }
  p.gold -= r.cost; p.stats.goldSpent += r.cost;
  p.caravans.push({ id, ticksLeft:r.ticks, cost:r.cost });
  G.notify("good", "Caravan dispatched", `${r.name} — returns in ${r.ticks} ticks`);
  G.Sound.play("coin"); G.render();
};
G.caravanTick = function () {
  const p = G.state; if (!p.caravans || !p.caravans.length) return;
  const done = [];
  p.caravans.forEach(c => {
    c.ticksLeft--;
    if (c.ticksLeft <= 0) done.push(c);
});
  done.forEach(c => {
    const r = G.CARAVAN_ROUTES.find(x => x.id === c.id) || { mult:1.5, risk:0.2, name:"route" };
    p.caravans = p.caravans.filter(x => x !== c);
    if (Math.random() < r.risk) { G.notify("bad", "Caravan lost!", `${r.name} never returned (−${c.cost}g)`); }
    else { const ret = Math.round(c.cost * r.mult); p.gold += ret; p.stats.goldEarned += ret; p.stats.caravansIncome += (ret - c.cost); G.notify("good", "Caravan returned", `+${ret}g from ${r.name}`); }
});
};

G.socketsFor = function (item) { return item ? (G.SOCKETS_BY_RARITY[item.rarity] || 0) : 0; };
G.freeSockets = function (item) { return Math.max(0, G.socketsFor(item) - ((item && item.gems && item.gems.length) || 0)); };
G.cutGem = function () {
  const p = G.state, c = G.GEM_COST;
  if ((p.inv.ruby||0) < c.ruby || p.gold < c.gold) { G.notify("warning", `Needs ${c.ruby} ruby and ${c.gold} gold`, ""); return; }
  p.inv.ruby -= c.ruby; p.gold -= c.gold;
  const g = G.pick(Object.keys(G.GEMS));
  p.gems[g] = (p.gems[g]||0)+1;
  G.notify("good", `Cut a ${G.GEMS[g].name}`, G.GEMS[g].desc);
  G.Sound.play("craft"); G.render();
};
G.socketGem = function (slot, gemKey) {
  const p = G.state, it = p.gear[slot];
  if (!it || !it.key) { G.notify("warning", "Nothing equipped there", ""); return; }
  if (G.freeSockets(it) < 1) { G.notify("warning", "No free socket", "Higher rarity gear has more sockets."); return; }
  if ((p.gems[gemKey]||0) < 1) { G.notify("warning", "You have no such gem", ""); return; }
  p.gems[gemKey]--;
  it.gems = it.gems || []; it.gems.push(gemKey);
  p.stats.gemsSocketed++;
  G.notify("good", `Socketed ${G.GEMS[gemKey].name}`, G.GEMS[gemKey].desc);
  G.Sound.play("craft"); G.render();
};
G.unsocketGem = function (slot, idx) {
  const p = G.state, it = p.gear[slot];
  if (!it || !it.gems || !it.gems[idx]) return;
  const g = it.gems.splice(idx, 1)[0];
  p.gems[g] = (p.gems[g]||0)+1;
  G.notify("info", "Gem removed", G.GEMS[g].name);
  G.render();
};

const SECRETS = {
  mire:      [{ id:"bog_cache",  name:"Bog Cache",     emoji:"📦", reward:{ gold:120 } }],
  mountains: [{ id:"gem_vein",   name:"Hidden Gem Vein",emoji:"💠", reward:{ gem:true } }],
  ruins:     [{ id:"lost_shrine",name:"Lost Shrine",   emoji:"🛕", reward:{ relic:1 } }],
  cave:      [{ id:"deep_chest", name:"Deep Chest",    emoji:"🗝️", reward:{ gold:200, item:"ruby" } }],
  banditcamp:[{ id:"loot_pit",   name:"Loot Pit",      emoji:"💰", reward:{ gold:180 } }],
};
G.secretKey = function (loc, id) { return loc + "/" + id; };
G.regionSecrets = function (loc) { return SECRETS[loc] || []; };
G.secretFound = function (loc, id) { return !!G.state.secrets[G.secretKey(loc, id)]; };
G.searchSecrets = function () {
  const p = G.state, loc = p.map.current;
  if (p.energy < 10) { G.notify("warning", "Need 10 energy", ""); return; }
  p.energy -= 10;
  const list = G.regionSecrets(loc);
  const undiscovered = list.filter(s => !G.secretFound(loc, s.id));
  const chance = 0.4 + p.skills.stealth * 0.02 + p.attrs.finesse * 0.005;
  if (!undiscovered.length) { G.log("🔍 You search, but this area holds no more secrets."); G.notify("info", "Nothing new", "No secrets remain here."); G.render(); return; }
  if (Math.random() < chance) {
    const s = G.pick(undiscovered);
    p.secrets[G.secretKey(loc, s.id)] = true;
    p.stats.secretsFound++;
    G.log(`🔍 Discovered: ${s.name}!`);
    G.notify("good", `Secret found: ${s.name}`, "Check the local map.");
    G.Sound.play("pickup");
    G.checkAchievements();
} else { G.log("🔍 You search carefully but find nothing."); G.notify("info", "Nothing found", "Try again — searching costs energy."); }
  G.render();
};
G.claimSecret = function (loc, id) {
  const p = G.state;
  const s = (G.regionSecrets(loc) || []).find(x => x.id === id);
  if (!s || !G.secretFound(loc, id)) return;
  const key = G.secretKey(loc, id);
  if (p.secrets[key] === "claimed") { G.notify("info", "Already claimed", ""); return; }
  p.secrets[key] = "claimed";
  const r = s.reward || {};
  const bits = [];
  if (r.gold) { p.gold += r.gold; p.stats.goldEarned += r.gold; bits.push(`+${r.gold}g`); }
  if (r.item) { p.inv[r.item] = (p.inv[r.item]||0)+1; bits.push(`+1 ${G.itemName(r.item)}`); }
  if (r.relic) { p.inv.relic = (p.inv.relic||0)+r.relic; bits.push(`+${r.relic} relic`); }
  if (r.gem) { const g = G.pick(Object.keys(G.GEMS)); p.gems[g] = (p.gems[g]||0)+1; bits.push(`+1 ${G.GEMS[g].name} gem`); }
  G.notify("good", `Claimed: ${s.name}`, bits.join(" · ")); G.Sound.play("coin"); G.render();
};
G.SECRETS = SECRETS;
})();
