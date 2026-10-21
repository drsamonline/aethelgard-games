
"use strict";
(function () {
const G = window.Game;
const t = k => G.t(k);
const n = v => G.fmt(v);
const W = k => `data-wiki="${k}"`;
const gearAffix = G.gearAffix;
const questCard = G.questCard;

G.viewStory = function () {
  const p = G.state, ch = G.CHAPTERS.find(c => c.id === p.story.chapter);
  let h = `<div class="panel"><h2>📜 ${ch.title}</h2><p class="story-text">${ch.text}</p>`;
  if (p.story.pending) {
    h += `<p class="gold-text">${t("ui.choice")}:</p>`;
    ch.choices.forEach((c,i) => h += `<button class="btn btn-primary btn-block" onclick="Game.chooseOption(${i})">${c.label}</button>`);
} else if (ch.objective) {
    const q = G.questById("main_"+ch.id);
    h += `<p class="story-text">Objective: <b>${ch.objective.label}</b>${q?` <span class="muted">(${q.objective.current}/${q.objective.required})</span>`:""}</p>`;
    // say WHERE to go, and offer to travel there directly
    const o = ch.objective;
    if (o.type === "kill" && o.target) {
      const where = G.whereToFind ? G.whereToFind(o.target) : [];
      if (where.length) {
        h += `<p class="story-text muted small">Found in: <b class="gold-text">${where.map(r=>G.regionName(r)).join(", ")}</b></p>`;
        h += where.map(r => `<button class="btn btn-primary" onclick="Game.goHunt('${r}','${o.target}')">⚔️ Travel to ${G.regionName(r)}</button> `).join("");
} else {
        h += `<p class="story-text" style="color:var(--danger)">No such enemy can be found in the world right now — this objective cannot be completed. That is a bug; please report it from Settings → Diagnostics.</p>`;
}
}
    h += `<button class="btn" onclick="Game.switchTab('atlas')">🗺️ Open the Atlas</button>`;
} else {
    h += `<button class="btn btn-primary" onclick="Game.generateBounty()">📜 Request a Bounty</button> <button class="btn" onclick="Game.switchTab('atlas')">🗺️ Explore</button>`;
}
  h += `</div>`;

  h += `<div class="panel"><h2>📋 ${t("ui.questlog")} <span class="muted small" style="margin-left:auto">${G.activeQuests().length} active</span></h2>`;
  const qs = G.activeQuests();
  if (!qs.length) h += `<p class="muted">No active quests.</p>`;
  qs.forEach(q => h += questCard(q));
  h += `</div>`;

  h += `<div class="panel hints-panel"><h2>💡 Hints</h2><ul class="hint-list">${G.getHints().map(x => `<li>${x}</li>`).join("")}</ul></div>`;

  h += `<div class="panel"><h2>📖 ${t("ui.journal")}</h2><ul id="event-log">${p.log.length?p.log.map(l=>`<li>${l}</li>`).join(""):`<li class="muted">Your story begins...</li>`}</ul></div>`;
  return h;
};

})();
