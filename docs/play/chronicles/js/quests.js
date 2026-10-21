
"use strict";
(function () {
const G = window.Game;

G.addQuest = function (def) {
  const p = G.state;
  if (!def || !def.id) return null;
  if (p.quests.some(q => q.id === def.id) || (p.completedQuests||[]).indexOf(def.id) >= 0) return null;
  const q = {
    id:def.id, type:def.type||"side", name:def.name, desc:def.desc,
    objective:{ type:def.objective.type, target:def.objective.target, required:def.objective.required, current:0 },
    rewards:def.rewards||{}, unlocks:def.unlocks||[], prepare:def.prepare||[], attempts:0, state:"active",
};
  p.quests.push(q);
  G.log(`📜 New quest: ${q.name}`);
  G.notify("quest", (q.type === "main" ? "Main mission" : q.type === "class" ? "Class mission" : "New quest") + ": " + q.name, q.desc);
  return q;
};
G.questById = function (id) { return G.state.quests.find(q => q.id === id); };
G.activeQuests = function () { return G.state.quests.filter(q => q.state === "active"); };

G.progressQuest = function (type, target, amount) {
  amount = amount || 1;
  G.state.quests.forEach(q => {
    if (q.state !== "active") return;
    const o = q.objective; if (o.type !== type) return;
    if (o.target !== target && o.target !== "any" && target !== "all") return;
    o.current = Math.min(o.required, o.current + amount);
    if (o.current >= o.required) G.completeQuest(q);
});
};
G.setQuestProgress = function (type, target, value) {
  G.state.quests.forEach(q => {
    if (q.state !== "active") return;
    const o = q.objective; if (o.type !== type) return;
    if (o.target !== target && o.target !== "any") return;
    o.current = Math.max(o.current, Math.min(o.required, value));
    if (o.current >= o.required) G.completeQuest(q);
});
};
G.completeQuest = function (q) {
  if (q.state !== "active") return;
  q.state = "done";
  const p = G.state;
  p.stats.questsDone++;
  p.completedQuests.push(q.id);
  G.grantRewards(q.rewards);
  const r = q.rewards;
  const rstr = [r.gold ? `${r.gold}g` : null, r.xp ? `${r.xp}xp` : null].filter(Boolean).join(" · ");
  G.log(`✅ Quest complete: ${q.name}${rstr ? ` (${rstr})` : ""}.`);
  G.notify("good", "Quest complete: " + q.name, rstr ? "Reward: " + rstr : "");
  G.Sound.play("victory");
  p.quests = p.quests.filter(x => x.id !== q.id || x.state !== "done");
  if (q.type === "main") G.onChapterObjectiveDone();
  if (q.type === "class") { p.stats.classMissions++; G.notify("good", "Class mission complete", q.name); }
  G.checkAchievements();
  if (G.render) G.render();
};
G.grantRewards = function (r) {
  if (!r) return;
  const p = G.state;
  if (r.gold) { p.gold += r.gold; p.stats.goldEarned += r.gold; }
  if (r.xp) G.gainXP(r.xp);
  if (r.items) for (const k in r.items) p.inv[k] = (p.inv[k]||0) + r.items[k];
  if (r.rep) for (const f in r.rep) G.addRep(f, r.rep[f]);
};

G.whereToFind = function (enemyId) {
  const out = [];
  Object.keys(G.LOCAL_MAPS || {}).forEach(rg => {
    const list = G.LOCAL_MAPS[rg] || [];
    if (list.some(o => (o.spawn || []).indexOf(enemyId) >= 0)) out.push(rg);
});
  return out;
};
G.regionName = function (id) {
  const l = G.LOCATIONS && G.LOCATIONS[id];
  return (l && l.name) || id;
};

G.startChapter = function () {
  const p = G.state;
  const ch = G.CHAPTERS.find(c => c.id === p.story.chapter);
  if (!ch || !ch.objective) return;
  G.addQuest({ id:"main_"+ch.id, type:"main", name:`Ch ${ch.id}: ${ch.title.split("— ")[1]||ch.title}`, desc:ch.objective.label, objective:{ type:ch.objective.type, target:ch.objective.target, required:ch.objective.required }, rewards:ch.rewards, unlocks:ch.unlocks, prepare:ch.prepare });
};
G.onChapterObjectiveDone = function () {
  const p = G.state;
  const ch = G.CHAPTERS.find(c => c.id === p.story.chapter);
  if (!ch) return;
  if (ch.choices && ch.choices.length) {
    p.story.pending = ch.id;
    G.notify("quest", "Chapter complete — make your choice", "Your decision will shape what follows.");
} else {
    G.advanceChapter();
}
  G.render();
};

G.openWorld = function () {
  const p = G.state;
  if (p.story.completed) return;
  p.mode = "open"; p.story.completed = true;
  G.notify("good", "Open World unlocked!", "Endless bounties, activities and ascension await.");
};

G.storyResume = function () {
  const p = G.state; if (!p || !p.story) return null;
  if (!p.story.completed) return null;
  const idx = G.CHAPTERS.findIndex(c => c.id === p.story.chapter);
  const next = G.CHAPTERS.slice(idx + 1).find(c => c.objective);
  if (!next) return null;
  p.story.chapter = next.id;
  p.story.completed = false;
  p.mode = "adventure";
  G.startChapter();
  G.notify("good", "New chapter available", next.title);
  G.log(`📜 ${next.title}`);
  return next;
};

G.advanceChapter = function () {
  const p = G.state;

  const idx = G.CHAPTERS.findIndex(c => c.id === p.story.chapter);
  const ch = idx >= 0 ? G.CHAPTERS[idx] : null;
  if (ch && ch.unlocks) ch.unlocks.forEach(u => G.notify("info", "Unlocked", u));

  const next = idx >= 0 ? G.CHAPTERS.slice(idx + 1).find(c => c.objective) : null;
  if (next) {
    p.story.chapter = next.id;

    if (idx + 1 === 1) ["cave","mountains"].forEach(l => { if (p.map.unlocked.indexOf(l) < 0) p.map.unlocked.push(l); });
    if (idx + 1 === 4) ["ruins","banditcamp"].forEach(l => { if (p.map.unlocked.indexOf(l) < 0) p.map.unlocked.push(l); });
    G.log(`📜 ${next.title}`);
    G.startChapter();
} else G.openWorld();
  G.unlockSideQuests();
  G.unlockClassMissions();
};
G.chooseOption = function (i) {
  const p = G.state;
  const ch = G.CHAPTERS.find(c => c.id === p.story.pending);
  if (!ch || !ch.choices[i]) return;
  const opt = ch.choices[i];
  p.story.choices["ch" + ch.id] = i;
  const e = opt.effects || {};
  if (e.flags) for (const k in e.flags) p.flags[k] = e.flags[k];
  if (e.gold) { p.gold += e.gold; p.stats.goldEarned += e.gold; }
  if (e.xp) G.gainXP(e.xp);
  if (e.rep) for (const f in e.rep) G.addRep(f, e.rep[f]);
  if (e.unlockSide) e.unlockSide.forEach(id => G.addQuest(G.SIDE_QUESTS.find(s => s.id === id)));
  G.log(`🔀 ${opt.label}: ${opt.outcome}`);
  G.notify("quest", "Your choice", opt.outcome);
  p.story.pending = null;
  G.closeChoice();
  G.advanceChapter();
  G.checkAchievements();
  G.render();
};

G.matchesUnlock = function (cond) {
  const p = G.state;
  if (!cond) return true;
  if (cond.chapter && p.story.chapter < cond.chapter) return false;
  if (cond.level && p.level < cond.level) return false;
  if (cond.cls && p.cls !== cond.cls) return false;
  if (cond.flag) { const [k, v] = cond.flag.split("="); if (String(p.flags[k]) !== v) return false; }
  return true;
};
G.unlockSideQuests = function () {
  const p = G.state;
  G.SIDE_QUESTS.forEach(sq => {
    if ((p.completedQuests||[]).indexOf(sq.id) >= 0) return;
    if (p.quests.some(q => q.id === sq.id)) return;
    if (G.matchesUnlock(sq.unlock)) G.addQuest(Object.assign({}, sq, { type:"side" }));
});
};
G.unlockClassMissions = function () {
  const p = G.state;
  if (!p.cls) return;
  const levels = { 0:3, 1:12 };
  G.CLASS_MISSIONS.filter(m => m.cls === p.cls).forEach((m, idx) => {
    if (p.level >= (levels[idx] || 3)) G.addQuest(Object.assign({}, m, { type:"class", objective:Object.assign({ current:0 }, m.objective) }));
});
};

G.onEnemyDefeated = function (id) {
  const p = G.state;
  G.progressQuest("kill", id, 1);
  const REP = { bandit:{oakhaven:2,bandits:-3}, rogue_mage:{oakhaven:1,bandits:-2}, ogre:{oakhaven:1}, spider:{oakhaven:1}, wraith:{oakhaven:2}, coven:{oakhaven:8,coven:-8}, warden:{oakhaven:12,coven:-4}, warlord:{oakhaven:10,bandits:-12}, bog_horror:{oakhaven:6}, spider_queen:{oakhaven:6} };
  if (REP[id]) for (const f in REP[id]) G.addRep(f, REP[id][f]);
  if (id === "wolf") p.flags.wolf = true;
  if (id === "coven") p.flags.coven = true;
  if (id === "warden") p.flags.warden = true;
};
G.onDungeonDepth = function (depth) {
  G.state.stats.deepestDepth = Math.max(G.state.stats.deepestDepth, depth);
  G.setQuestProgress("depth", "cave", depth);
};
G.onVictory = function () { G.progressQuest("wins", "any", 1); };

G.onDefeat = function (context, questId) {
  const p = G.state;
  let q = questId ? G.questById(questId) : null;
  if (!q) q = G.activeQuests().find(x => x.type === "main" || x.type === "class") || null;
  if (!q) return;
  q.attempts++;
  p.failedQuests[q.id] = (p.failedQuests[q.id]||0) + 1;
  G.showHelp(q);
};
G.showHelp = function (q) {
  const hints = (q.prepare && q.prepare.length) ? q.prepare : ["Level up a few times before trying again.", "Upgrade your weapon and armour at the Forge.", "Bring potions and an antidote into the fight."];
  const body = document.getElementById("help-body");
  const title = document.getElementById("help-title");
  if (title) title.textContent = `💡 How to prepare: ${q.name}`;
  if (body) body.innerHTML = `
    <p class="muted small">You have failed this mission ${q.attempts} time${q.attempts>1?"s":""}. Here is how to prepare:</p>
    <ul class="help-list">${hints.map(h => `<li>${h}</li>`).join("")}</ul>
    <p class="muted small">Rewards: ${q.rewards.gold||0}g · ${q.rewards.xp||0}xp${q.unlocks&&q.unlocks.length?` · Unlocks: ${q.unlocks.join(", ")}`:""}</p>`;
  G.openModal("help-overlay");
  G.notify("warning", "Mission failed", "A preparation hint is available.");
};
G.closeHelp = function () { G.closeModal("help-overlay"); };
G.closeChoice = function () { G.closeModal("choice-overlay"); };
G.openChoice = function () { G.openModal("choice-overlay"); };

G.achievedEnding = function () {
  const p = G.state;
  for (const e of G.ENDINGS) {
    const w = e.when || {};
    if (w.crimes) { if ((p.stats.crimes||0) >= w.crimes) return e; continue; }
    if (w.flag) { const [k,v] = w.flag.split("="); if (String(p.flags[k]) === v) return e; continue; }
    if (!Object.keys(w).length) return e;
}
  return G.ENDINGS[G.ENDINGS.length - 1];
};

G.generateBounty = function () {
  const id = G.pick(G.BOUNTY_POOL);
  const e = G.ENEMIES[id];
  const gold = 40 + e.tier*45, xp = 40 + e.tier*40;
  G.addQuest({ id:"bounty_"+Date.now(), type:"bounty", name:`Bounty: ${e.name}s`, desc:`Defeat 3 ${e.name}s in the wild.`, objective:{ type:"kill", target:id, required:3 }, rewards:{ gold, xp }, unlocks:["Bounty renown"], prepare:[`${e.name} is tier ${e.tier} — fight near your level`, "Carry potions; bounties can chain fights"] });
  G.state.stats.bounties++;
  G.render();
};
})();
