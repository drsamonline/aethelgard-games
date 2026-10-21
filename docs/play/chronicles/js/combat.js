
"use strict";
(function () {
const G = window.Game;

G.statMods = function (status) {
  let atk = 1, def = 1, crit = 0, dmgTaken = 1;
  for (const k in status) { const s = G.STATUS[k]; if (!s || s.kind !== "mod") continue; if (s.atk) atk += s.atk; if (s.def) def += s.def; if (s.crit) crit += s.crit; if (s.dmgTaken) dmgTaken += s.dmgTaken; }
  return { atk, def, crit, dmgTaken };
};
G.hasStatus = function (status, key) { return !!status[key]; };
G.applyStatus = function (status, key, dmg, turns) { const s = G.STATUS[key]; if (!s) return; status[key] = { turns: turns || s.turns || 2, dmg: dmg || 0 }; };
G.decrementStatuses = function (status) { for (const k in status) { status[k].turns--; if (status[k].turns <= 0) delete status[k]; } };
G.tickUnitStatuses = function (unit, status, label) {
  for (const k in status) { const s = G.STATUS[k]; if (!s) continue;
    if (s.kind === "dot" && status[k].dmg > 0) { unit.hp -= status[k].dmg; G.clog(`${s.emoji} ${label} suffers ${status[k].dmg} ${s.name} damage.`, "cl-bad"); }
    if (s.kind === "hot" && status[k].dmg > 0) { unit.hp = Math.min(G.maxHp(), unit.hp + status[k].dmg); G.clog(`💚 ${label} regenerates ${status[k].dmg} HP.`, "cl-good"); }
}
};

G.applyResist = function (dmg, enemy, element) {
  let d = dmg;
  if (enemy.resist && enemy.resist[element]) d = Math.round(d * (1 - enemy.resist[element]));
  if (enemy.weak && enemy.weak.indexOf(element) >= 0) d = Math.round(d * 1.5);
  return Math.max(1, d);
};

G.makeElite = function (e) {
  const k = G.pick(Object.keys(G.ELITE_AFFIXES));
  const a = G.ELITE_AFFIXES[k];
  e.elite = k;
  e.name = a.name + " " + e.name;
  e.emoji = a.emoji + e.emoji;
  if (a.hp) { e.maxHp = Math.round(e.maxHp*(1+a.hp)); e.hp = e.maxHp; }
  if (a.def) e.def = Math.round(e.def*(1+a.def));
  if (a.atk) e.atk = Math.round(e.atk*(1+a.atk));
  if (a.gold) e.gold = Math.round(e.gold*(1+a.gold));
  if (a.drop) e.dropBonus = a.drop;
  if (a.startShield) e.status.shield = { turns:3, dmg:0 };
  if (a.lowHpRage) e.lowHpRage = true;
  if (a.onHit) e.onHitStatus = a.onHit;
  if (a.drain) e.drain = a.drain;
  if (a.dodge) e.dodge = a.dodge;
  e.xp = Math.round(e.xp * 1.6);
  return e;
};

G.buildEnemy = function (id, opts) {
  opts = opts || {};
  const base = G.ENEMIES[id]; if (!base) return null;
  const p = G.state, diff = G.diff();
  const lvl = 1 + (p.level-1)*0.10;
  const dep = opts.depth ? (1 + opts.depth*0.16) : 1;
  const night = (G.isNight() && !(G.raceData().nightEase)) ? 1.1 : 1;
  const hp = Math.round(base.hp * lvl * dep * diff.eHp * night);
  const e = {
    id, name: base.name, emoji: base.emoji, hp, maxHp: hp,
    atk: Math.round(base.atk * (1 + (p.level-1)*0.06) * dep * diff.eAtk * night),
    def: base.def + Math.floor((opts.depth||0)*0.5),
    xp: Math.round(base.xp * lvl * diff.xp), gold: Math.round(base.gold * lvl * diff.gold),
    drops: base.drops || {}, tier: base.tier, boss: !!base.boss, element: base.element || "physical",
    resist: base.resist || {}, weak: base.weak || [], abilities: base.abilities || [],
    status: {}, telegraph: null, alive: true,
};
  if (opts.atkMult) e.atk = Math.round(e.atk * opts.atkMult);
  if (opts.defMult) e.def = Math.round(e.def * opts.defMult);
  if (opts.onHitStatus) e.onHitStatus = opts.onHitStatus;
  const ec = opts.eliteChance != null ? opts.eliteChance : 0.12;
  if ((opts.elite || opts.forceElite || (Math.random() < ec)) && !e.boss) G.makeElite(e);
  return e;
};

G.addLimit = function (n) {
  const p = G.state;
  if (!p.cls) return;
  p.limit = G.clamp((p.limit||0) + n, 0, 100);
};
G.ultReady = function () { return G.state.cls && (G.state.limit||0) >= 100 && G.state.combat.active; };

G.startCombat = function (ids, opts) {
  opts = opts || {};
  const p = G.state;
  if (typeof ids === "string") ids = [ids];
  const cost = opts.cost === undefined ? 15 : opts.cost;
  if (p.energy < cost) { G.notify("warning", "Not enough energy", `Need ${cost}⚡`); G.Sound.play("error"); return false; }
  p.energy -= cost;
  const enemies = [];
  ids.forEach(id => { const e = G.buildEnemy(id, opts); if (e) enemies.push(e); });
  if (!enemies.length) return false;
  p.combat = { active:true, enemies, target:0, playerStatus:{}, playerDefending:false, cooldowns:{}, log:[], turn:1,
    story:!!opts.story, context:opts.context||"hunt", depth:opts.depth||0, questId:opts.questId||null,
    dmgDealt:0, dmgTaken:0, rounds:0, auto:!!G.settings.autoBattle };
  const boss = enemies.some(e => e.boss);
  G.clog(boss ? `☠️ ${enemies[0].name} rises before you!` : `⚔️ ${enemies.map(e=>e.name).join(", ")} ${enemies.length>1?"block":"blocks"} your path!`, boss?"cl-crit":"cl-bad");
  G.Sound.play(boss ? "boss" : "ui");
  const ov = document.getElementById("combat-overlay"); if (ov) ov.classList.remove("hidden");
  G.renderCombat();
  return true;
};

G.activeEnemies = function () { return G.state.combat.enemies.filter(e => e.alive); };
G.targetEnemy = function () {
  const c = G.state.combat;
  let e = c.enemies[c.target];
  if (!e || !e.alive) { const i = c.enemies.findIndex(x => x.alive); c.target = i < 0 ? 0 : i; e = c.enemies[c.target]; }
  return e && e.alive ? e : null;
};
G.selectTarget = function (i) { G.state.combat.target = i; G.renderCombat(); };
G.clog = function (msg, cls) {
  const c = G.state.combat; if (!c) return;
  if (!c.log) c.log = [];
  c.log.unshift({ msg, cls }); if (c.log.length > 60) c.log.pop();
  const box = document.getElementById("combat-log");
  if (box) { box.innerHTML = c.log.map(l => `<div class="cl-line ${l.cls||""}">${l.msg}</div>`).join(""); box.scrollTop = 0; }
};

G.skillUnlocked = function (key) {
  const sk = G.ACTIVE_SKILLS[key]; if (!sk) return false;
  const p = G.state;
  if (sk.cls && p.cls !== sk.cls) return false;
  if (sk.lvl && p.level < sk.lvl) return false;
  return true;
};
G.combatSkills = function () { return Object.keys(G.ACTIVE_SKILLS).filter(k => G.skillUnlocked(k)); };
G.skillPowerBase = function (sk) { return (sk.element && sk.element !== "physical") ? G.spellPower() : G.atkPower(); };
G.playerCritChance = function () { const c = G.state.combat; return G.critChance() + (c && G.hasStatus(c.playerStatus,"focus") ? 0.25 : 0); };

G.combatAction = function (action, arg) {
  const p = G.state, c = p.combat; if (!c.active) return;
  if (action === "target") { G.selectTarget(arg); return; }
  for (const k in c.cooldowns) if (c.cooldowns[k] > 0) c.cooldowns[k]--;
  if (G.hasStatus(c.playerStatus, "stun")) { G.clog("💫 You are stunned — your turn is lost!", "cl-bad"); G.finishPlayerTurn(); return; }
  switch (action) {
    case "attack": G.playerAttack(); break;
    case "defend": c.playerDefending = true; G.clog("🛡️ You raise your guard — incoming damage halved.", "cl-good"); break;
    case "potion": if (!G.usePotion("potion")) return; break;
    case "ether": if (!G.usePotion("ether")) return; break;
    case "antidote": G.useAntidote(); break;
    case "flee": if (G.tryFlee()) return; break;
    case "skill": if (!G.useSkill(arg)) return; break;
    case "ultimate": if (!G.ultReady()) { G.clog("❌ Limit Break is not ready.", "cl-bad"); return; } G.useUltimate(); break;
}
  G.finishPlayerTurn();
};

G.findReaction = function (e, element) {
  for (const r of G.REACTIONS) { if (r.element === element && e.status && e.status[r.status]) return r; }
  return null;
};
G.hitEnemy = function (e, dmg, element, opts) {
  opts = opts || {};
  element = element || "physical";
  if (e.dodge && Math.random() < e.dodge) { G.clog(`💨 ${e.name} dodges!`, "cl-bad"); return 0; }
  dmg = dmg * G.elemMult(element);
  const rx = G.findReaction(e, element);
  if (rx) dmg = dmg * rx.mult;
  dmg = G.applyResist(dmg, e, element);
  const md = G.statMods(e.status);
  dmg = Math.round(dmg * md.dmgTaken);
  if (opts.crit) dmg = Math.round(dmg * G.critMult());
  dmg = Math.max(1, dmg);
  e.hp -= dmg;
  if (G.state.combat) G.state.combat.dmgDealt = (G.state.combat.dmgDealt||0) + dmg;
  const ls = G.lifesteal();
  if (ls > 0) { const heal = Math.round(dmg*ls); G.state.hp = Math.min(G.maxHp(), G.state.hp + heal); }
  G.addLimit(dmg * 0.06);
  if (rx) {
    G.state.stats.reactions++;
    G.clog(`⚡ ${rx.emoji} ${rx.name}! ${rx.msg} (+${Math.round((rx.mult-1)*100)}% damage)`, "cl-crit");
    G.floatText(rx.name.toUpperCase(), "ft-crit");
    G.Sound.play("crit");
    if (rx.aoe) { G.activeEnemies().filter(o => o !== e && o.alive).forEach(o => { o.hp -= Math.round(dmg*0.5); }); }
    if (rx.apply) G.applyStatus(e.status, rx.apply, 0, 1);
    if (rx.extend) for (const k in e.status) { if (G.STATUS[k] && G.STATUS[k].kind === "dot") e.status[k].turns += 2; }
    if (rx.drain) { const h = Math.round(dmg*0.3); G.state.hp = Math.min(G.maxHp(), G.state.hp + h); }
    if (rx.cleanse) delete e.status[rx.status];
}
  return dmg;
};

G.playerAttack = function () {
  const e = G.targetEnemy(); if (!e) return;
  const strikes = Math.random() < G.doubleStrike() ? 2 : 1;
  let total = 0, crit = false;
  for (let i = 0; i < strikes; i++) {
    crit = Math.random() < G.playerCritChance();
    let dmg = Math.max(1, Math.round(G.atkPower() * G.roll(0.3) - e.def * 0.5));
    total += G.hitEnemy(e, dmg, "physical", { crit });
}
  G.clog(crit ? `💥 CRITICAL! You strike ${e.name} for ${total}.` : `⚔️ You strike ${e.name} for ${total}${strikes>1?" (double strike)":""}.`, crit ? "cl-crit" : "cl-good");
  G.Sound.play(crit ? "crit" : "sword");
  G.floatText((crit?"CRIT ":"") + total, crit ? "ft-crit" : "ft-good");
  if (crit) G.shake(null, true);
  G.bumpEnemy();
};

G.useSkill = function (key) {
  const p = G.state, c = p.combat, sk = G.ACTIVE_SKILLS[key];
  if (!sk) return false;
  if (!G.skillUnlocked(key)) { G.clog("❌ Skill not unlocked.", "cl-bad"); return false; }
  if (c.cooldowns[key] > 0) { G.clog(`⏳ ${sk.name} on cooldown (${c.cooldowns[key]}).`, "cl-bad"); return false; }
  if (p.energy < sk.cost) { G.clog(`❌ Need ${sk.cost} energy.`, "cl-bad"); return false; }
  p.energy -= sk.cost; c.cooldowns[key] = sk.cd;
  const isMagic = sk.element && sk.element !== "physical";

  if (sk.kind === "heal") {
    const heal = Math.round(G.spellPower()*sk.mult + 20);
    p.hp = Math.min(G.maxHp(), p.hp + heal);
    G.clog(`💚 ${sk.name} restores ${heal} HP.`, "cl-good"); G.floatText("+"+heal,"ft-heal"); G.Sound.play("heal");
    if (sk.status) G.applyStatus(c.playerStatus, sk.status, 0, 3);
    return true;
}
  if (sk.kind === "buff") { G.applyStatus(c.playerStatus, sk.status, 0, 3); G.clog(`🔮 ${sk.name} — you gain ${G.STATUS[sk.status].name}.`, "cl-good"); G.Sound.play("spell"); return true; }
  if (sk.kind === "escape") { G.clog("💨 You vanish in a cloud of smoke!", "cl-good"); G.endCombat(false, { fled:true }); return true; }

  if (sk.kind === "debuff") { const e = G.targetEnemy(); if (e) G.applyStatus(e.status, sk.status, 0, G.STATUS[sk.status].turns); G.clog(`${sk.emoji} ${sk.name} — ${e?e.name:"the foe"} is ${G.STATUS[sk.status].name}.`, "cl-good"); G.Sound.play("spell"); return true; }

  if (sk.kind === "multi") {
    const list = G.activeEnemies(); let total = 0;
    list.forEach(e => { let dmg = Math.max(1, Math.round(G.skillPowerBase(sk)*sk.mult*G.roll(0.25) - e.def*0.4)); total += G.hitEnemy(e, dmg, sk.element||"physical", {}); });
    if (isMagic && list.some(e => e.hp <= 0)) G.progressQuest("magicKills", "any", 1);
    G.clog(`${sk.emoji} ${sk.name} hits ${list.length} enemies for ${total} total.`, "cl-good");
    G.Sound.play(isMagic ? "spell" : "sword"); G.floatText(String(total), "ft-good"); G.bumpEnemy();
    return true;
}

  const e = G.targetEnemy(); if (!e) return false;
  const crit = sk.alwaysCrit || Math.random() < G.playerCritChance();
  let dmg = Math.max(1, Math.round(G.skillPowerBase(sk)*sk.mult*G.roll(0.25) - e.def*0.4));
  dmg = G.hitEnemy(e, dmg, sk.element||"physical", { crit });
  if (sk.selfDmg) { const self = Math.round(G.maxHp()*sk.selfDmg); p.hp -= self; G.clog(`🩸 The effort costs you ${self} HP.`, "cl-bad"); }
  if (isMagic && e.hp <= 0) G.progressQuest("magicKills", "any", 1);
  G.clog(`${sk.emoji} ${sk.name} hits ${e.name} for ${dmg}.`, crit ? "cl-crit" : "cl-good");
  G.Sound.play(isMagic ? "spell" : "sword");
  G.floatText((crit?"CRIT ":"")+dmg, crit ? "ft-crit" : "ft-good");
  if (crit) G.shake(null, true);
  G.bumpEnemy();
  if (sk.kind === "dot") { G.applyStatus(e.status, sk.status, Math.round(G.skillPowerBase(sk)*0.35), G.STATUS[sk.status].turns); G.clog(`${G.STATUS[sk.status].emoji} ${e.name} is afflicted with ${G.STATUS[sk.status].name}.`, "cl-bad"); }
  if (sk.kind === "stun") { G.applyStatus(e.status, "stun", 0, 1); G.clog(`💫 ${e.name} is stunned!`, "cl-good"); }
  if (sk.kind === "drain") { const heal = Math.round(dmg*0.5); p.hp = Math.min(G.maxHp(), p.hp+heal); G.clog(`🩸 You drain ${heal} life.`, "cl-good"); }
  return true;
};

G.usePotion = function (kind) {
  const p = G.state;
  if ((p.inv[kind]||0) < 1) { G.clog(`❌ No ${G.itemName(kind)} left.`, "cl-bad"); return false; }
  p.inv[kind]--;
  if (kind === "potion") { const h = 55 + p.attrs.vitality*2; p.hp = Math.min(G.maxHp(), p.hp+h); G.clog(`🧪 Potion restores ${h} HP.`, "cl-good"); G.floatText("+"+h,"ft-heal"); }
  else { p.energy = Math.min(G.maxEnergy(), p.energy+30); G.clog("⚗️ Draught restores 30 energy.", "cl-good"); }
  G.Sound.play("heal"); return true;
};
G.useAntidote = function () {
  const p = G.state, c = p.combat;
  if ((p.inv.antidote||0) < 1) { G.clog("❌ No antidote.", "cl-bad"); return; }
  p.inv.antidote--;
  ["poison","bleed","burn"].forEach(k => delete c.playerStatus[k]);
  G.clog("🧴 Antidote clears your afflictions.", "cl-good"); G.Sound.play("heal");
};
G.useUltimate = function () {
  const p = G.state, c = p.combat, u = G.ULTIMATES[p.cls];
  if (!u) { G.clog("❌ No ultimate available.", "cl-bad"); return; }
  p.limit = 0; p.stats.ultimateUses++;
  G.clog(`🌟 LIMIT BREAK — ${u.name}!`, "cl-crit");
  G.floatText("LIMIT BREAK", "ft-crit");
  G.Sound.play("crit"); G.shake(null, true); G.flash("rgba(224,179,77,.35)");
  if (u.kind === "guard") {
    p.hp = G.maxHp();
    G.applyStatus(c.playerStatus, "shield", 0, 3);
    G.applyStatus(c.playerStatus, "regen", Math.round(G.maxHp()*0.06), 3);
    G.clog("🛡️ You are fully restored and warded.", "cl-good");
    return;
}
  const list = u.kind === "single" ? [G.targetEnemy()].filter(Boolean) : G.activeEnemies();
  const hits = u.hits || 1;
  let total = 0;
  for (let h = 0; h < hits; h++) {
    list.forEach(e => {
      if (!e || !e.alive) return;
      const base = (u.element ? G.spellPower() : G.atkPower()) * u.mult;
      const dmg = Math.max(1, Math.round(base * G.roll(0.25) - e.def * 0.4));
      total += G.hitEnemy(e, dmg, u.element || "physical", { crit: u.crit });
});
}
  G.clog(`🌟 ${u.name} deals ${total} total damage!`, "cl-crit");
  G.bumpEnemy();
};

G.tryFlee = function () {
  const e = G.targetEnemy();
  if (e && e.boss) { G.clog("❌ The boss bars your escape!", "cl-bad"); return false; }
  if (Math.random() < G.fleeChance()) { G.clog("🏃 You slip away into the wilds.", "cl-good"); G.endCombat(false, { fled:true }); return true; }
  G.clog("❌ You failed to escape!", "cl-bad"); return false;
};

G.finishPlayerTurn = function () {
  const p = G.state, c = p.combat; if (!c.active) return;
  G.tickUnitStatuses(p, c.playerStatus, "You");
  if (p.hp <= 0) return G.endCombat(false, { died:true });
  G.decrementStatuses(c.playerStatus);
  if (!G.activeEnemies().length) return G.endCombat(true);
  c.companionGuard = false;
  if (G.companionTurn) G.companionTurn();
  if (!G.activeEnemies().length) return G.endCombat(true);
  G.enemyPhase();
  if (!c.active) return;
  c.playerDefending = false; c.turn++; c.rounds = (c.rounds||0) + 1;
  G.renderCombat(); G.save();
};

G.enemyPhase = function () {
  const p = G.state, c = p.combat;
  for (const e of G.activeEnemies()) {
    if (!e.alive) continue;
    G.tickUnitStatuses(e, e.status, e.name);
    if (e.hp <= 0) { G.killEnemy(e); continue; }
    if (G.hasStatus(e.status, "stun")) { G.clog(`💫 ${e.name} is stunned and cannot act.`, "cl-good"); G.decrementStatuses(e.status); continue; }
    G.enemyAct(e);
    if (p.hp <= 0) { G.endCombat(false, { died:true }); return; }
    G.decrementStatuses(e.status);
}
  if (!G.activeEnemies().length) G.endCombat(true);
};
G.enemyAct = function (e) {

  if (e.lowHpRage && !e.enraged && e.hp < e.maxHp * 0.3) { e.enraged = true; G.applyStatus(e.status, "rage", 0, 4); G.clog(`🔺 ${e.name} flies into a rage!`, "cl-bad"); }
  if (!e.boss && !e.telegraph && e.hp < e.maxHp * 0.22 && Math.random() < 0.3) { e.alive = false; e.fled = true; G.clog(`🏃 ${e.name} flees the battle!`, "cl-good"); return; }
  if (e.telegraph) { G.enemyAbility(e, e.telegraph); e.telegraph = null; return; }
  let ab = null; for (const a of e.abilities) { if (Math.random() < a.chance) { ab = a; break; } }
  if (ab && ab.kind === "heavy") { e.telegraph = ab; G.clog(`⚠️ ${e.name} ${ab.telegraph}...`, "cl-crit"); G.Sound.play("error"); return; }
  if (ab) { G.enemyAbility(e, ab); return; }
  G.enemyBasic(e);
};
G.enemyDamageToPlayer = function (raw, element) {
  const c = G.state.combat, p = G.state;
  let dmg = Math.max(1, Math.round(raw - G.defPower()*0.5));
  const res = G.playerResist(element || "physical");
  if (res) dmg = Math.round(dmg * (1 - res));
  if (c.playerDefending) dmg = Math.round(dmg*0.5);
  if (G.hasStatus(c.playerStatus, "shield")) dmg = Math.round(dmg*0.5);
  return Math.max(1, dmg);
};
G.hurtPlayer = function (e, dmg) {
  const p = G.state;
  if (G.companionIntercept && G.companionIntercept(dmg)) { G.Sound.play("hit"); G.shake(); return 0; }
  p.hp = Math.max(0, p.hp - dmg);
  if (p.combat) p.combat.dmgTaken = (p.combat.dmgTaken||0) + dmg;
  G.addLimit(dmg * 0.04);
  G.clog(`🩸 ${e.name} hits you for ${dmg}.`, "cl-bad");
  G.Sound.play("hit"); G.floatText("-"+dmg, "ft-bad", 50, 62); G.shake(); G.flash("rgba(209,70,58,.32)");
  if (e.onHitStatus && Math.random() < 0.5) { G.applyStatus(p.combat.playerStatus, e.onHitStatus, Math.round(e.atk*0.4), G.STATUS[e.onHitStatus].turns); G.clog(`☠️ You are afflicted with ${G.STATUS[e.onHitStatus].name}.`, "cl-bad"); }
  if (e.drain) { const h = Math.round(dmg * e.drain); e.hp = Math.min(e.maxHp, e.hp + h); G.clog(`🩸 ${e.name} drains ${h} life.`, "cl-bad"); }
  return dmg;
};
G.enemyBasic = function (e) {
  const mod = G.statMods(e.status);
  G.hurtPlayer(e, G.enemyDamageToPlayer(e.atk*mod.atk*G.roll(0.3), e.element));
};
G.enemyAbility = function (e, ab) {
  const p = G.state, c = p.combat;
  const mod = G.statMods(e.status);
  let dmg = 0;
  if (ab.mult) { dmg = G.enemyDamageToPlayer(e.atk*ab.mult*mod.atk*G.roll(0.25), ab.element||e.element); if (G.companionIntercept && G.companionIntercept(dmg)) { dmg = 0; } else { p.hp -= dmg; G.addLimit(dmg*0.04); } }

  if (ab.kind === "dot" && G.STATUS[ab.status]) G.applyStatus(c.playerStatus, ab.status, Math.round(e.atk*0.5), G.STATUS[ab.status].turns);
  if (ab.kind === "stun") G.applyStatus(c.playerStatus, "stun", 0, 1);
  if (ab.kind === "weaken") G.applyStatus(c.playerStatus, "weaken", 0, 3);
  if (ab.kind === "buff" && G.STATUS[ab.status]) G.applyStatus(e.status, ab.status, 0, 3);
  if (ab.kind === "drain") e.hp = Math.min(e.maxHp, e.hp + Math.round(dmg*0.6));
  G.clog(`💢 ${e.name} ${ab.msg}${dmg?` for ${dmg} damage`:""}!`, "cl-bad");
  if (ab.kind === "heavy") { G.Sound.play("crit"); G.shake(null,true); G.flash("rgba(209,70,58,.45)"); }
  else { G.Sound.play("hit"); G.shake(); G.flash("rgba(209,70,58,.3)"); }
  if (dmg) G.floatText("-"+dmg, "ft-bad", 50, 62);
};
G.bumpEnemy = function () { const box = document.getElementById("combat-enemies"); if (box) { box.classList.remove("enemy-hurt"); void box.offsetWidth; box.classList.add("enemy-hurt"); } };

G.killEnemy = function (e) {
  if (!e.alive) return;
  e.alive = false; e.hp = 0;
  const p = G.state;
  if (e.elite) p.stats.eliteKills++;
  G.clog(`☠️ ${e.name} falls!`, "cl-good"); G.Sound.play("victory");
  G.gainXP(e.xp);
  const gold = Math.round(e.gold * G.goldMult());
  p.gold += gold; p.stats.goldEarned += gold;
  p.stats.kills++; p.stats.byEnemy[e.id] = (p.stats.byEnemy[e.id]||0)+1;
  if (e.boss) p.stats.bossKills++;
  G.floatText(`+${gold}g`, "ft-gold");
  const loot = G.rollLoot(e); const names = [];
  for (const k in loot.items) { p.inv[k] = (p.inv[k]||0)+loot.items[k]; names.push(`${loot.items[k]} ${G.ITEMS[k]?G.ITEMS[k].name:k}`); }
  if (loot.gear) { p.gearBag.push(loot.gear); const rn = G.RARITIES[loot.gear.rarity].name; names.push(`${rn} ${G.GEAR[loot.gear.key].name}`); if (loot.gear.rarity === "legendary") p.stats.legendaries++; if (loot.gear.rarity === "mythic") p.stats.mythics++; G.notify("good", "Loot!", `${rn} ${G.GEAR[loot.gear.key].name}`); }
  if (names.length) G.log(`🎒 Looted: ${names.join(", ")}.`);
  if (G.onEnemyDefeated) G.onEnemyDefeated(e.id);
  G.checkAchievements();
};
G.rollRarity = function (tier) {
  const w = G.state.settlement.buildings.workshop || 0;
  const bonus = Math.min(11, tier*1.2 + w*1.6);
  const roll = Math.random()*100 - bonus;
  if (roll < 0.4) return "mythic";
  if (roll < 1.4) return "legendary";
  if (roll < 6) return "epic";
  if (roll < 24) return "rare";
  return "common";
};
G.rollLoot = function (e) {
  const out = { items:{}, gear:null };
  for (const k in e.drops) { const v = e.drops[k]; if (v >= 1) out.items[k] = (out.items[k]||0)+Math.round(v); else if (Math.random() < v) out.items[k] = (out.items[k]||0)+1; }
  if (Math.random() < 0.09 + e.tier*0.03) {
    const pool = Object.keys(G.GEAR).filter(k => G.GEAR[k].tier <= e.tier+1);
    if (pool.length) {
      const key = G.pick(pool), rarity = G.rollRarity(e.tier);
      const n = G.RARITIES[rarity].affixes, affixPool = Object.keys(G.AFFIXES), affixes = [];
      for (let i=0;i<n;i++) { const a = G.pick(affixPool); if (affixes.indexOf(a)<0) affixes.push(a); }
      out.gear = { key, plus:0, rarity, affix:affixes };
}
}
  return out;
};

G.endCombat = function (victory, opts) {
  opts = opts || {};
  const p = G.state, c = p.combat;
  const ov = document.getElementById("combat-overlay"); if (ov) ov.classList.add("hidden");
  const wasDungeon = c.context === "dungeon", questId = c.questId, ctx = c.context;
  p.combat = { active:false };
  if (G.reviveCompanions) G.reviveCompanions();
  const allFled = victory && c.enemies && c.enemies.length && c.enemies.every(e => e.fled);
  if (victory && allFled) {
    G.log("🏃 Your foes fled the field.");
} else if (victory) {
    G.log("✅ Victory!"); G.notify("good", "Victory!", "You won the battle.");
    if (G.onVictory) G.onVictory();
    if (ctx === "arena" && G.arenaWin) G.arenaWin();
    if (ctx === "endless" && G.endlessWin) G.endlessWin();
    if (ctx === "raid" && G.raidWon) G.raidWon();
    if (wasDungeon) { p.dungeon.depth++; p.stats.deepestDepth = Math.max(p.stats.deepestDepth, p.dungeon.depth); G.log(`🪜 Deeper. Depth ${p.dungeon.depth}.`); if (G.onDungeonDepth) G.onDungeonDepth(p.dungeon.depth); }
} else if (opts.died) { if (ctx === "raid" && G.raidLost) G.raidLost(); if (ctx === "endless" && G.endlessDeath) G.endlessDeath(); G.handleDeath(ctx, questId); }
  else if (opts.fled) { G.log("🏃 You fled the battle."); if (p.dungeon.active) { p.dungeon.active = false; p.dungeon.depth = 0; } }
  if (c.rounds) G.log(`⚔️ Fight recap: dealt ${c.dmgDealt||0}, took ${c.dmgTaken||0} over ${c.rounds} rounds.`);
  G.checkAchievements();
  G.render(); G.save();
};
G.autoBattleStep = function () {
  const c = G.state.combat; if (!c || !c.active || !c.auto) return;
  setTimeout(() => {
    const cc = G.state.combat; if (!cc || !cc.active || !cc.auto) return;
    const p = G.state;
    if (p.hp < G.maxHp()*0.35 && (p.inv.potion||0) > 0) G.combatAction("potion");
    else if (G.ultReady()) G.combatAction("ultimate");
    else G.combatAction("attack");
    if (G.state.combat.active && G.state.combat.auto) G.autoBattleStep();
    else G.renderCombat();
}, 650);
};
G.toggleAutoBattle = function () {
  const c = G.state.combat; if (!c.active) return;
  c.auto = !c.auto;
  G.settings.autoBattle = c.auto; G.saveSettings();
  G.renderCombat();
  if (c.auto) G.autoBattleStep();
};
G.handleDeath = function (context, questId) {
  const p = G.state;
  const lost = Math.floor(p.gold*0.1);
  p.gold -= lost; p.stats.deaths++;
  p.hp = Math.max(1, Math.floor(G.maxHp()*0.5));
  p.energy = Math.max(0, Math.floor(G.maxEnergy()*0.5));
  p.dungeon.active = false; p.dungeon.depth = 0;
  p.map.current = "oakhaven";
  G.log(`💀 You were slain. You wake in Oakhaven, ${lost}g lighter.`);
  G.notify("warning", "You have fallen", `Lost ${lost} gold. Respawned in Oakhaven.`);
  G.Sound.play("death");
  if (G.onDefeat) G.onDefeat(context, questId);
};

G.renderCombat = function () {
  const p = G.state, c = p.combat; if (!c.active) return;
  const boss = c.enemies.some(e => e.boss);
  const title = document.getElementById("combat-title"); if (title) title.textContent = boss ? "☠️ BOSS BATTLE" : "Battle!";
  const eb = document.getElementById("combat-enemies");
  if (eb) eb.innerHTML = c.enemies.map((e,i) => {
    const st = Object.keys(e.status).map(k => `<span class="st-chip" style="color:${G.STATUS[k].color}">${G.sprite("status."+k, G.STATUS[k].emoji)}${e.status[k].turns}</span>`).join("");
    const tel = e.telegraph ? `<span class="st-chip tel">⚠️ ${e.telegraph.name}</span>` : "";
    if (!e.alive) return `<div class="enemy-card dead"><span class="ec-emoji">${G.sprite("enemy."+e.id, e.emoji, {size:"portrait"})}</span><span class="ec-name">${e.name} — defeated</span></div>`;

    const el = k => G.ELEMENTS[k] || { name: k, color: "var(--muted)" };
    const weak = (e.weak||[]).map(w => `<span class="st-chip weak" style="color:${el(w).color}">⚡ weak: ${el(w).name}</span>`).join("");
    const res = Object.keys(e.resist||{}).map(w => `<span class="st-chip res">🛡 resists: ${el(w).name}</span>`).join("");
    return `<div class="enemy-card ${i===c.target?"selected":""}" data-wiki="enemy_${e.id}" onclick="Game.selectTarget(${i})">
      <div class="ec-head"><span class="ec-emoji">${G.sprite("enemy."+e.id, e.emoji, {size:"portrait"})}</span><span class="ec-name">${e.name}</span><span class="ec-hp">${Math.max(0,e.hp)}/${e.maxHp}</span></div>
      <div class="bar-bg"><div class="bar-fill bar-hp" style="width:${Math.max(0,e.hp/e.maxHp*100)}%"></div></div>
      <div class="ec-tags">${tel}${st}<span class="st-chip el" style="color:${el(e.element).color}">${el(e.element).name}</span>${weak}${res}</div></div>`;
}).join("");
  const pst = Object.keys(c.playerStatus).map(k => `<span class="st-chip" style="color:${G.STATUS[k].color}">${G.sprite("status."+k, G.STATUS[k].emoji)} ${G.STATUS[k].name} ${c.playerStatus[k].turns}</span>`).join("");
  const pb = document.getElementById("combat-player");
  if (pb) pb.innerHTML = `
    <div class="cs-head"><span class="cs-name"><span class="cs-emoji">${G.sprite("player."+p.cls, "🧝", {size:"portrait"})}</span>${p.name} the ${G.CLASSES[p.cls]?G.CLASSES[p.cls].name:"Wanderer"}</span><span class="cs-hp">${Math.max(0,Math.floor(p.hp))} / ${G.maxHp()}</span></div>
    <div class="bar-bg"><div class="bar-fill bar-hp" style="width:${Math.max(0,p.hp/G.maxHp()*100)}%"></div></div>
    <div class="cs-hp" style="margin-top:6px">⚡ ${Math.floor(p.energy)} · 🧪 ${p.inv.potion} · ⚗️ ${p.inv.ether} · 🧴 ${p.inv.antidote} · 🛡️ DEF ${Math.floor(G.defPower())}</div>
    ${p.cls ? `<div class="limit-wrap"><span class="limit-label">${G.ultReady() ? "🌟 LIMIT BREAK READY" : "Limit " + Math.floor(p.limit||0) + "%"}</span><div class="bar-bg limit-bg"><div class="bar-fill bar-limit" style="width:${Math.min(100,p.limit||0)}%"></div></div></div>` : ""}
    ${G.activeComp() ? `<div class="cs-hp" style="margin-top:6px">${G.sprite("companion."+G.activeComp().def.id, G.activeComp().def.emoji)} ${G.activeComp().def.name} — ${Math.max(0,Math.round(G.activeComp().st.hp))}/${G.activeComp().st.maxHp} HP</div>` : ""}
    <div class="ec-tags">${pst}</div>`;
  const stunned = G.hasStatus(c.playerStatus, "stun");
  const acts = document.getElementById("combat-actions");
  if (acts) {
    if (stunned) acts.innerHTML = `<button class="btn btn-block" onclick="Game.combatAction('none')">💫 Stunned — lose turn</button>`;
    else {
      let html = `<button class="btn" onclick="Game.combatAction('attack')" data-wiki="attack">⚔️ ${G.t("ui.attack")}</button>
        <button class="btn" onclick="Game.combatAction('defend')" data-wiki="defence">🛡️ ${G.t("ui.defend")}</button>
        <button class="btn" onclick="Game.combatAction('potion')" ${p.inv.potion<1?"disabled":""}>🧪 ${G.t("ui.potion")}</button>
        <button class="btn btn-danger" onclick="Game.combatAction('flee')" data-wiki="flee">🏃 ${G.t("ui.flee")}</button>`;
      G.combatSkills().forEach(k => {
        const sk = G.ACTIVE_SKILLS[k], cd = c.cooldowns[k]||0;
        const dis = (cd>0 || p.energy<sk.cost) ? "disabled" : "";
        html += `<button class="btn btn-magic" data-wiki="skill_${k}" onclick="Game.combatAction('skill','${k}')" ${dis} title="${sk.desc}">${G.sprite("skill."+k, sk.emoji)} ${sk.name}${cd>0?` (${cd})`:` (${sk.cost}⚡)`}</button>`;
});
      const u = G.ULTIMATES[p.cls];
      if (u) html += `<button class="btn btn-ult" onclick="Game.combatAction('ultimate')" ${G.ultReady()?"":"disabled"} title="${u.desc}">🌟 ${u.name}${G.ultReady()?"":` (${Math.floor(p.limit||0)}%)`}</button>`;
      html += `<button class="btn ${c.auto?"btn-primary":""}" onclick="Game.toggleAutoBattle()" title="Let the game fight this battle for you">${c.auto?"⏸ Auto (on)":"▶ Auto"}</button>`;
      acts.innerHTML = html;
}
}
};
})();
