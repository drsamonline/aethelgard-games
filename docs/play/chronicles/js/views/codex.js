
"use strict";
(function () {
const G = window.Game;
const t = k => G.t(k);
const n = v => G.fmt(v);
const W = k => `data-wiki="${k}"`;
const gearAffix = G.gearAffix;
const questCard = G.questCard;

G.viewCodex = function () {
  const p = G.state, st = p.stats;
  const unlocked = G.ACHIEVEMENTS.filter(a => p.achievements[a.id]).length;
  let h = `<div class="panel"><h2>🏅 ${t("ui.achievements")} <span class="muted small" style="margin-left:auto">${unlocked}/${G.ACHIEVEMENTS.length}</span></h2><div class="ach-grid">`;
  G.ACHIEVEMENTS.forEach(a => { const got = !!p.achievements[a.id];
    h += `<div class="ach ${got?"got":""}"><span class="ach-emoji">${G.sprite("ach."+a.id, a.emoji, {size:"lg"})}</span><div><span class="ach-name">${a.name}</span><span class="ach-desc">${a.desc}</span></div><span class="ach-tick">${got?"✓":""}</span></div>`; });
  h += `</div></div>`;
  const mins = Math.floor((st.timePlayed||0)/60);
  h += `<div class="panel"><h2>📊 ${t("ui.stats")}</h2><div class="stats-grid">
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Level</span></div><span class="sn-val">${p.level}</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Kills</span></div><span class="sn-val">${st.kills}</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Bosses</span></div><span class="sn-val">${st.bossKills}</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Gold earned</span></div><span class="sn-val">${n(st.goldEarned)}g</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Items crafted</span></div><span class="sn-val">${st.itemsCrafted}</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Quests done</span></div><span class="sn-val">${st.questsDone}</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Deepest depth</span></div><span class="sn-val">${st.deepestDepth}</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Deaths</span></div><span class="sn-val">${st.deaths}</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Crimes</span></div><span class="sn-val">${st.crimes}</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Fish caught</span></div><span class="sn-val">${st.fish}</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Arena wins</span></div><span class="sn-val">${st.arenaWins}</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Random events</span></div><span class="sn-val">${st.events}</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Time played</span></div><span class="sn-val">${mins}m</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Difficulty</span></div><span class="sn-val">${G.diff().label}</span></div>
    <div class="stat-node"><div class="sn-left"><span class="sn-name">Ascensions</span></div><span class="sn-val">${p.ascensions}</span></div>
  </div></div>`;
  h += `<div class="panel"><h2>♾️ ${t("ui.ascend")}</h2><p class="story-text">New Game+ resets your run but grants permanent power: +1 to every attribute and bonus points per rank.</p>
    <button class="btn ${G.canAscend()?"btn-primary":""}" onclick="Game.ascend()" ${G.canAscend()?"":"disabled"}>${G.canAscend()?t("ui.ascend"):"Reach the Open World or level 25"}</button></div>`;

  h += `<div class="panel"><h2>🎬 Endings</h2>`;
  const ending = G.achievedEnding ? G.achievedEnding() : null;
  if (p.story.completed && ending) {
    h += `<div class="stat-node" style="border-left-color:var(--gold)"><div class="sn-left"><span class="sn-name">${G.sprite("ending."+ending.id, ending.emoji)} ${ending.name}</span><span class="sn-sub">${ending.text}</span></div></div>`;
    h += `<p class="muted small" style="margin-top:8px">Other endings exist. Different choices across the chapters lead elsewhere — try another run, or Ascend.</p>`;
} else {
    h += `<p class="muted small">Finish the five chapters to reach an ending. Your choices along the way decide which one.</p>`;
}
  h += `</div>`;

  if (G.MODS && G.MODS.loaded.length) {
    h += `<div class="panel"><h2>🧩 Mods</h2><div class="stats-grid">` +
      G.MODS.loaded.map(m => `<div class="stat-node"><div class="sn-left"><span class="sn-name">${m.name}</span><span class="sn-sub">v${m.version}</span></div><span class="sn-val">✓</span></div>`).join("") +
      `</div></div>`;
}
  return h;
};

})();
