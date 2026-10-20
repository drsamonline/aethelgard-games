
"use strict";
(function () {
const G = window.Game;
const t = k => G.t(k);
const n = v => G.fmt(v);
const W = k => `data-wiki="${k}"`;
const gearAffix = G.gearAffix;
const questCard = G.questCard;

G.viewSkills = function () {
  const p = G.state;
  const branches = { "Combat":[["swords","Swords","+2.2 melee attack / level"]], "Magic":[["magic","Magic","+3 spell power / level"]], "Utility":[["stealth","Stealth","+crit, escape, defence, crime"],["craft","Craft","Better gathering & forging"]] };
  let h = `<div class="panel"><h2>🌳 Skill Trees <span class="muted small" style="margin-left:auto">${p.sp} SP</span></h2><div class="skill-tree">`;
  for (const cat in branches) { h += `<div class="skill-branch"><h3>${cat}</h3>`;
    branches[cat].forEach(([k,name,desc]) => { const lv = p.skills[k];
      h += `<div class="skill-node ${lv>=20?"maxed":""}" ${W(k)} onclick="Game.trainSkill('${k}')"><div class="sn-left"><span class="sk-name">${name} · Lv ${lv}</span><span class="sk-desc">${desc}</span></div><button class="btn btn-sm" ${p.sp<1||lv>=20?"disabled":""}>+1 SP</button></div>`; });
    h += `</div>`; }
  h += `</div></div>`;
  h += `<div class="panel"><h2>📖 Practice</h2><p class="muted small" style="margin-bottom:12px">Spend energy to practise — a chance to level without SP.</p><div class="btn-row">`;
  [["swords","Swords"],["magic","Magic"],["stealth","Stealth"],["craft","Craft"]].forEach(([k,name]) => h += `<button class="btn" onclick="Game.practiceSkill('${k}')" ${p.energy<5||p.skills[k]>=20?"disabled":""}>Practise ${name} (5⚡)</button>`);
  h += `</div></div>`;
  h += `<div class="panel"><h2>✨ ${p.cls?G.CLASSES[p.cls].name+" Skills":"Class Skills"}</h2><div class="stats-grid">`;
  Object.keys(G.ACTIVE_SKILLS).filter(k => G.ACTIVE_SKILLS[k].cls === p.cls).forEach(k => { const sk = G.ACTIVE_SKILLS[k], ok = G.skillUnlocked(k);
    h += `<div class="stat-node" style="opacity:${ok?1:0.5}" ${W("skill_"+k)}><div class="sn-left"><span class="sn-name">${G.sprite("skill."+k, sk.emoji)} ${sk.name}</span><span class="sn-sub">${sk.desc}</span><span class="sn-sub">Unlocks at level ${sk.lvl}</span></div><span class="sn-val">${ok?"✓":"🔒"}</span></div>`; });
  if (!p.cls) h += `<p class="muted">Choose a class to unlock skills.</p>`;
  h += `</div></div>`;
  return h;
};
G.trainSkill = function (s) { const p = G.state; if (p.sp<1) { G.notify("warning","No SP",""); return; } if (p.skills[s]>=20) { G.notify("warning","Skill is maxed",""); return; } p.sp--; p.skills[s]++; G.log(`🌳 ${s} → level ${p.skills[s]}.`); G.Sound.play("ui"); G.checkAchievements(); G.render(); };
G.practiceSkill = function (s) { const p = G.state; if (p.energy<5) { G.notify("warning","Not enough energy",""); return; } if (p.skills[s]>=20) { G.notify("warning","Skill is maxed",""); return; } p.energy -= 5;
  if (Math.random() < 0.18 + p.skills[s]*0.01) { p.skills[s]++; G.notify("good", `${s} practised up`, `Level ${p.skills[s]}`); G.Sound.play("pickup"); } else G.log(`📖 You practise ${s}.`); G.render(); };

})();
