
"use strict";
(function () {
const G = window.Game;
const t = k => G.t(k);
const n = v => G.fmt(v);
const W = k => `data-wiki="${k}"`;

G.switchTab = function (tab) {
  G.tab = tab;
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  G.render();
};
G.applyNav = function () {
  document.querySelectorAll(".nav-item").forEach(b => { const l = b.querySelector(".ni-label"); if (l) l.textContent = t("nav." + b.dataset.tab); });
  const sc = document.querySelector(".start-credit"); if (sc) sc.innerHTML = `${t("ui.credit")} <b>${G.AUTHOR}</b>`;
};

G.updateStatus = function () {
  const p = G.state; if (!p) return;
  const set = (id,v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  const width = (id,v) => { const e = document.getElementById(id); if (e) e.style.width = Math.max(0,Math.min(100,v))+"%"; };
  set("ui-lvl", p.level);
  width("ui-hp-bar", p.hp/G.maxHp()*100); set("ui-hp-text", `${Math.max(0,Math.floor(p.hp))}/${G.maxHp()}`);
  width("ui-en-bar", p.energy/G.maxEnergy()*100); set("ui-en-text", `${Math.floor(p.energy)}/${G.maxEnergy()}`);
  width("ui-nv-bar", p.nerve/G.maxNerve()*100); set("ui-nv-text", `${Math.floor(p.nerve)}/${G.maxNerve()}`);
  set("ui-gold", n(p.gold));
  width("ui-xp-bar", p.xp/G.xpNeeded()*100); set("ui-xp-text", `${p.xp}/${G.xpNeeded()}`);
  set("ui-phase", (G.isNight()?"🌙 ":"☀️ ")+G.phaseName()+" · Day "+p.time.day);
  const mq = (G.activeQuests && G.activeQuests().find(q => q.type === "main")) || (G.activeQuests && G.activeQuests()[0]);
  set("ui-quest", mq ? `📜 ${mq.name} (${mq.objective.current}/${mq.objective.required})` : "📜 No active quest");
  G.updateBell();
};

G.LIVE_TABS = { hero:1, home:1, market:1, inventory:1, underworld:1 };
G.render = function () {
  const p = G.state; if (!p) return;
  if (G.Music && G.Music.update) G.Music.update();
  if (G.refreshBackground) G.refreshBackground();
  G.updateStatus();
  if (p.combat.active) return;
  G.renderView();
};
G.renderView = function () {
  const p = G.state; if (!p) return;
  const vc = document.getElementById("view-container"); if (!vc) return;

  const ae = document.activeElement;
  if (ae && ae.tagName === "INPUT" && vc.contains(ae)) return;
  const scroll = vc.scrollTop, oldLog = document.getElementById("event-log"), logScroll = oldLog ? oldLog.scrollTop : 0;
  let html = "";
  switch (G.tab) {
    case "story": html = G.viewStory(); break;
    case "hero": html = G.viewHero(); break;
    case "skills": html = G.viewSkills(); break;
    case "atlas": html = G.viewAtlas(); break;
    case "home": html = G.viewHome(); break;
    case "forge": html = G.viewForge(); break;
    case "market": html = G.viewMarket(); break;
    case "underworld": html = G.viewUnderworld(); break;
    case "inventory": html = G.viewInventory(); break;
    case "codex": html = G.viewCodex(); break;
    case "wiki": html = G.viewWiki(); break;
    default: html = G.viewStory();
}
  vc.innerHTML = `<div class="tab-view">${html}</div>`;
  vc.scrollTop = scroll;
  const nl = document.getElementById("event-log"); if (nl) nl.scrollTop = logScroll;
  if (p.story.pending) G.openChoice();
};

function gearAffix(item) { const l = Array.isArray(item.affix)?item.affix:(item.affix?[item.affix]:[]); return l.map(a => `<span class="affix">${G.AFFIXES[a].fmt}</span>`).join(" "); }
function questCard(q) {
  const o = q.objective, pct = Math.min(100, o.current/o.required*100);
  const rw = [q.rewards.gold?`${q.rewards.gold}g`:null, q.rewards.xp?`${q.rewards.xp}xp`:null].filter(Boolean).join(" · ");
  const items = q.rewards.items ? Object.keys(q.rewards.items).map(k=>`${q.rewards.items[k]} ${G.sprite("item."+k, G.itemEmoji(k))}`).join(" ") : "";
  const badge = q.type === "main" ? "main" : q.type === "class" ? "class" : q.type === "bounty" ? "bounty" : "side";
  return `<div class="quest-item ${badge}">
    <div class="q-top"><span class="q-badge ${badge}">${badge}</span><span class="q-name">${q.name}</span></div>
    <div class="q-desc">${q.desc}</div>
    <div class="q-progress"><div style="width:${pct}%"></div></div>
    <div class="q-meta"><span>${t("ui.objectives")}: ${o.current}/${o.required}</span><span>${t("ui.rewards")}: ${rw} ${items}</span></div>
    ${q.unlocks&&q.unlocks.length?`<div class="q-unlock">🔓 ${t("ui.unlocks")}: ${q.unlocks.join(", ")}</div>`:""}
    ${q.attempts>0?`<button class="btn btn-sm" onclick="Game.showHelp(Game.questById('${q.id}'))">💡 ${t("ui.prepare")}</button>`:""}
  </div>`;
}

G.openMenu = function () { G.openModal("menu-modal"); };
G.closeMenu = function () { G.closeModal("menu-modal"); };
G.openSettings = function () { G.buildSettings(); G.openModal("settings-modal"); };
G.closeSettings = function () { G.closeModal("settings-modal"); };
G.openNotifications = function () { G.markAllRead(); G.buildNotifications(); G.openModal("notify-modal"); };
G.closeNotifications = function () { G.closeModal("notify-modal"); };
G.buildNotifications = function () {
  const p = G.state;
  const body = document.getElementById("notify-body"); if (!body) return;
  if (!p.notifications.length) { body.innerHTML = `<p class="muted">No notifications yet.</p>`; return; }
  const icons = { good:"✅", warning:"⚠️", quest:"📜", event:"⚡", info:"ℹ️" };
  body.innerHTML = p.notifications.map(x => `<div class="notif ${x.type}"><span class="nf-ico">${icons[x.type]||"ℹ️"}</span><div><span class="nf-title">${x.title}</span>${x.body?`<span class="nf-body">${x.body}</span>`:""}</div></div>`).join("");
};
G.buildSettings = function () {
  const s = G.settings, p = G.state;
  const body = document.getElementById("settings-body"); if (!body) return;
  const chips = (list, cur, fn) => `<div class="chip-row">${list.map(([v,l]) => `<button class="chip ${cur===v?"on":""}" onclick="${fn}('${v}')">${l}</button>`).join("")}</div>`;
  const toggle = (label, key, wiki) => `<div class="set-row" ${wiki?`data-wiki="${wiki}"`:""}><span>${label}</span>
    <div class="chip-row"><button class="chip ${s[key]?"on":""}" onclick="Game.setToggle('${key}',true)">On</button><button class="chip ${!s[key]?"on":""}" onclick="Game.setToggle('${key}',false)">Off</button></div></div>`;
  body.innerHTML = `
        <h3>${t("ui.theme")}</h3>${chips(Object.keys(G.THEMES).map(k=>[k,G.THEMES[k].name]), s.theme, "Game.setTheme")}
    <h3>${t("ui.difficulty")}</h3>${chips(Object.keys(G.DIFFICULTY).map(k=>[k,G.DIFFICULTY[k].label]), p?p.difficulty:"normal", "Game.setDifficulty")}
    <h3>Text size</h3>${chips([[0.9,"90%"],[1,"100%"],[1.15,"115%"]], s.fontScale, "Game.setFont")}
    <h3>${t("ui.sound")}</h3>${toggle("Sound effects", "sound", "energy")}
    <div class="set-row"><span>${t("ui.volume")}</span><input type="range" min="0" max="1" step="0.1" value="${s.volume}" oninput="Game.setVolume(this.value)" /></div>
    <h3>🎵 Music</h3>${toggle("Procedural soundtrack (changes with where you are)", "music")}
    <div class="set-row"><span>Music volume</span><input type="range" min="0" max="1" step="0.1" value="${s.musicVolume}" oninput="Game.setMusicVolume(this.value)" /></div>
    <p class="muted small">Now playing: <b class="gold-text">${G.Music ? G.Music.moodName() : "—"}</b></p>
    <h3>Gameplay</h3>
    ${toggle(t("ui.tooltips"), "tooltips", "tooltips")}
    ${toggle(t("ui.notify"), "notify", "notifications")}
    ${toggle(t("ui.damageNumbers"), "damageNumbers")}
    ${toggle(t("ui.screenShake"), "screenShake")}
    ${toggle(t("ui.autosave"), "autosave", "save")}
    ${toggle("Auto-battle by default", "autoBattle")}
    <h3>Accessibility</h3>
    ${toggle(t("ui.reduceMotion")||"Reduced motion", "reduceMotion")}
    ${toggle(t("ui.compact"), "compact")}
    ${toggle(t("ui.colorblind"), "colorblind")}
    <div class="set-row"><span>Font</span><div class="chip-row"><button class="chip ${s.font!=="dyslexic"?"on":""}" onclick="Game.setFontFamily('default')">Default</button><button class="chip ${s.font==="dyslexic"?"on":""}" onclick="Game.setFontFamily('dyslexic')">Dyslexia-friendly</button></div></div>
    <div class="set-row"><span>Colours</span><div class="chip-row"><button class="chip ${s.palette!=="alt"?"on":""}" onclick="Game.setPalette('default')">Standard</button><button class="chip ${s.palette==="alt"?"on":""}" onclick="Game.setPalette('alt')">High-contrast</button></div></div>
    ${G.graphicsSettingsHTML ? G.graphicsSettingsHTML() : ""}
    ${G.modSettingsHTML ? G.modSettingsHTML() : ""}
    <h3>Diagnostics</h3>${G.diagnosticsHTML ? G.diagnosticsHTML() : ""}`;
};

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
G._lastFocus = null;
G.openModal = function (id) {
  const el = document.getElementById(id); if (!el) return;
  if (el.classList.contains("hidden")) G._lastFocus = document.activeElement;
  el.classList.remove("hidden");
  el.setAttribute("aria-hidden", "false");
  const f = el.querySelectorAll(FOCUSABLE);
  if (f.length) setTimeout(() => { try { f[0].focus(); } catch (e) {} }, 30);
};
G.closeModal = function (id) {
  const el = document.getElementById(id); if (!el) return;
  el.classList.add("hidden");
  el.setAttribute("aria-hidden", "true");
  if (G._lastFocus && G._lastFocus.focus) { try { G._lastFocus.focus(); } catch (e) {} }
  G._lastFocus = null;
};
document.addEventListener("keydown", e => {
  if (e.key !== "Tab") return;
  const open = Array.from(document.querySelectorAll(".overlay"))
    .filter(o => !o.classList.contains("hidden") && o.id !== "start-screen");
  if (!open.length) return;
  const el = open[open.length - 1];
  const f = Array.from(el.querySelectorAll(FOCUSABLE)).filter(x => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

G.graphicsSettingsHTML = function () {
  const packs = G.graphicsPackList ? G.graphicsPackList() : [];
  const cur = G.settings.graphics;
  let h = `<h3>🎨 Graphics pack</h3>`;
  if (!packs.length) {
    h += `<p class="muted small">No art packs installed. A graphics pack is a mod that ships images for the game's sprite keys — see <b>mods/README.md</b>. Without one, the game uses emoji.</p>`;
    return h;
}
  h += `<div class="chip-row"><button class="chip ${!cur?"on":""}" onclick="Game.setGraphicsPack('')">Default (emoji)</button>`;
  packs.forEach(pk => { h += `<button class="chip ${cur===pk.id?"on":""}" onclick="Game.setGraphicsPack('${pk.id}')">${pk.name||pk.id}</button>`; });
  h += `</div><p class="muted small">${packs.length} pack(s) available. Images replace emoji wherever art exists; anything a pack does not cover keeps its emoji, so a partial pack still works.</p>`;
  return h;
};
G.setGraphicsPack = function (id) {
  G.settings.graphics = id || null; G.saveSettings();
  if (G.applyGraphicsPack) G.applyGraphicsPack(id || null);
  G.buildSettings(); G.render();
};

G.modSettingsHTML = function () {
  const list = (G.MODS && G.MODS.discovered) || [];
  const safe = G.safeMode ? G.safeMode() : false;
  const rep = G.modCompatReport ? G.modCompatReport() : { enabled:[], errors:[], warnings:[], order:[] };
  const nameOf = id => { const d = list.find(x => x.id === id); return d ? d.name : id; };
  let h = `<h3>🧩 ${t("ui.mods")} <span class="muted small">${list.length} found</span></h3>`;
  h += `<div class="set-row"><span>${t("ui.modsSafeMode")}</span><div class="chip-row">
      <button class="chip ${!safe?"on":""}" onclick="Game.setSafeMode(false)">Off</button>
      <button class="chip ${safe?"on":""}" onclick="Game.setSafeMode(true)">On</button></div></div>`;
  if (safe) h += `<p class="muted small">Safe mode is on — the game is running with no mods. Reload after turning it off.</p>`;
  if (!list.length) {
    h += `<p class="muted small">No mods found. Drop a .js file into the <b>mods/</b> folder and run <code>python3 tools/build-mods-index.py</code>, then reload.</p>`;
    return h;
}

  const nErr = rep.errors.length, nWarn = rep.warnings.length;
  const cls = nErr ? "error" : nWarn ? "warn" : "ok";
  const line = nErr
    ? `✗ ${nErr} problem${nErr > 1 ? "s" : ""} — those mods will not load`
    : nWarn ? `⚠ ${nWarn} overlap${nWarn > 1 ? "s" : ""} — mods still work, last one wins`
    : `✓ All ${rep.enabled.length} enabled mod${rep.enabled.length === 1 ? "" : "s"} work together`;
  h += `<div class="compat compat-${cls}">${line}</div>`;
  if (rep.errors.length) h += `<ul class="compat-list">` + rep.errors.map(e => `<li><b>${nameOf(e.id)}</b> — ${e.msg}</li>`).join("") + `</ul>`;
  if (rep.warnings.length) h += `<ul class="compat-list warn">` + rep.warnings.map(w => `<li><b>${nameOf(w.id)}</b> — ${w.msg}</li>`).join("") + `</ul>`;
  if (rep.order && rep.order.length > 1) h += `<p class="muted small">Load order: ${rep.order.map(nameOf).join(" → ")}</p>`;

  h += `<div class="mod-list">`;
  list.forEach(d => {
    const on = G.modEnabled(d.id);
    const st = G.modStatus ? G.modStatus(d.id, rep) : { state:"ok", reasons:[] };
    const badge = st.state === "error" ? "✗ incompatible" : st.state === "warn" ? "⚠ overlap" : "✓ works";
    h += `<div class="mod-card ${on ? "on" : ""} status-${st.state}">
      <div class="mc-head"><span class="mc-name">${d.name}</span><span class="mc-badge ${d.impact}">${G.modBadge(d.obj)}</span></div>
      <span class="mc-sub">v${d.version} · ${d.author}${d.description ? " · " + d.description : ""}</span>
      <span class="mc-status mc-status-${st.state}">${on ? badge : "off"}</span>
      ${st.reasons.length ? `<span class="mc-warn">${st.reasons.join("; ")}</span>` : ""}
      ${d.needsRestart ? `<span class="mc-warn">Changing this needs a restart to take effect.</span>` : ""}
      <div class="chip-row"><button class="chip ${on ? "on" : ""}" onclick="Game.setModEnabled('${d.id}',true)">On</button>
      <button class="chip ${!on ? "on" : ""}" onclick="Game.setModEnabled('${d.id}',false)">Off</button></div>
    </div>`;
});
  h += `</div>`;
  if (G.MODS.blocked && G.MODS.blocked.length) {
    h += `<p class="muted small" style="color:var(--danger)">Not loaded: ${G.MODS.blocked.map(b => b.name + " (" + b.reasons.join("; ") + ")").join(" · ")}</p>`;
}
  if (G.MODS.errors && G.MODS.errors.length) {
    h += `<p class="muted small" style="color:var(--danger)">${G.MODS.errors.length} load problem(s): ${G.MODS.errors.map(e => (e.mod || e.file || "?") + " — " + e.error).join("; ")}</p>`;
}
  return h;
};

G.creationModsHTML = function () {
  const list = (G.MODS && G.MODS.discovered) || [];
  if (!list.length) return "";
  const artIds = (G.graphicsMods ? G.graphicsMods() : []).map(d => d.id);
  const content = list.filter(d => artIds.indexOf(d.id) < 0);
  const packs = G.EDITIONS ? G.EDITIONS() : [];
  let h = "";

  if (content.length) {
    h += `<h3>🧩 ${t("ui.mods")} <span class="muted small">content — toggle before you begin</span></h3><div class="mod-list compact">`;
    content.forEach(d => {
      const on = G.modEnabled(d.id);
      h += `<div class="mod-card ${on?"on":""}">
        <div class="mc-head"><span class="mc-name">${d.name}</span><span class="mc-badge ${d.impact}">${G.modBadge(d.obj)}</span></div>
        <span class="mc-sub">${d.description||("v"+d.version)}</span>
        ${d.needsRestart?`<span class="mc-warn">Takes effect on restart.</span>`:""}
        <div class="chip-row"><button class="chip ${on?"on":""}" onclick="Game.setModEnabled('${d.id}',true)">On</button>
        <button class="chip ${!on?"on":""}" onclick="Game.setModEnabled('${d.id}',false)">Off</button></div>
      </div>`;
});
    h += `</div>`;
}

  if (packs.length > 1) {
    const cur = G.settings.graphics || null;
    h += `<h3>🎨 Art pack <span class="muted small">pick one — the rest switch off</span></h3>`;
    h += `<div class="chip-row">` + packs.map(e =>
      `<button class="chip ${cur === e.id ? "on" : ""}" onclick="Game.setEdition(${e.id ? `'${e.id}'` : "''"})">${e.name}</button>`
).join("") + `</div>`;
    h += `<p class="muted small" style="margin-top:6px">${G.editionNote(cur) || ""} Only one art pack can be active. <b>Classic</b> is the emoji fallback and is always available.</p>`;
}
  return h;
};

G.setLang = function (l) { G.settings.lang = l; G.saveSettings(); G.applySettings(); G.applyNav(); G.renderStart(); G.buildSettings(); if (G.state) G.render(); };
G.setTheme = function (v) { G.settings.theme = v; G.saveSettings(); G.applySettings(); G.buildSettings(); };
G.setDifficulty = function (d) { if (G.state) G.state.difficulty = d; G.saveSettings(); G.buildSettings(); G.render(); };
G.setFont = function (f) { G.settings.fontScale = Number(f); G.saveSettings(); G.applySettings(); G.buildSettings(); };

G.clampVol = function (v, fallback) {
  const n = Number(v);
  return isFinite(n) ? Math.max(0, Math.min(1, n)) : (fallback === undefined ? 1 : fallback);
};
G.setVolume = function (v) { G.settings.volume = G.clampVol(v, 1); G.saveSettings(); if (G.Sound && G.Sound.setVolume) G.Sound.setVolume(G.settings.volume); G.applySettings(); };
G.setToggle = function (k, v) { G.settings[k] = v; G.saveSettings(); G.applySettings(); if (k === "tooltips" && !v) G.hideTooltip(); if (k === "music" && G.Music) G.Music.update(); G.buildSettings(); };
G.setInvSort = function (m) { G.invSort = m; G.render(); };
G.setMusicVolume = function (v) { G.settings.musicVolume = G.clampVol(v, 0.6); G.saveSettings(); if (G.Music) G.Music.refreshVolume(); };
G.setFontFamily = function (f) { G.settings.font = f; G.saveSettings(); G.applySettings(); G.buildSettings(); };
G.setPalette = function (p) { G.settings.palette = p; G.saveSettings(); G.applySettings(); G.buildSettings(); };
G.exportSave = function () { if (G.exportSaveFile) G.exportSaveFile(G.state.slot || 1); };
G.importSave = function () { if (G.importSavePaste) G.importSavePaste(); };
G.resetGame = function () { if (!confirm("Erase this slot and start over?")) return; G.deleteSlot(G.state.slot||1); location.reload(); };

G.creation = { name:"", race:"human", gender:"nb", cls:"warrior" };
G.showCreation = function () {
  G.creation = { name:"", race:"human", gender:"nb", cls:"warrior" };
  G.renderCreation();
  G.openModal("creation-screen");
};
G.renderCreation = function () {
  const c = G.creation;
  const box = document.getElementById("creation-body"); if (!box) return;
  box.innerHTML = `
    <h3>${t("ui.name")}</h3>
    <input class="create-name" maxlength="18" placeholder="Your name" value="${c.name}" oninput="Game.setCreate('name',this.value)" />
    <h3>${t("ui.race")}</h3>
    <div class="pick-grid">${Object.keys(G.RACES).map(k => { const r = G.RACES[k];
      return `<button class="pick ${c.race===k?"on":""}" onclick="Game.setCreate('race','${k}')" data-wiki="race_${k}"><span class="pick-emoji">${G.sprite("race."+k, r.emoji, {size:"xl"})}</span><span class="pick-name">${r.name}</span><span class="pick-sub">${r.perk}</span></button>`; }).join("")}</div>
    <h3>${t("ui.gender")}</h3>
    <div class="chip-row">${Object.keys(G.GENDERS).map(k => `<button class="chip ${c.gender===k?"on":""}" onclick="Game.setCreate('gender','${k}')">${G.sprite("gender."+k, G.GENDERS[k].emoji)} ${G.GENDERS[k].name}</button>`).join("")}</div>
    <h3>${t("ui.class")}</h3>
    <div class="pick-grid">${G.modeClassIds().map(k => { const cl = G.CLASSES[k];
      return `<button class="pick ${c.cls===k?"on":""}" onclick="Game.setCreate('cls','${k}')" data-wiki="class_${k}"><span class="pick-emoji">${G.sprite("class."+k, cl.emoji, {size:"xl"})}</span><span class="pick-name" style="color:${cl.color}">${cl.name}</span><span class="pick-sub">${cl.blurb}</span></button>`; }).join("")}</div>
    ${G.creationModsHTML ? G.creationModsHTML() : ""}`;
};
G.setCreate = function (k, v) { G.creation[k] = v; G.renderCreation(); };
G.confirmCreation = function () {
  const c = G.creation;
  const name = (c.name||"").trim() || "Wanderer";
  G.state = G.defaultState(G.pendingSlot||1, G.pendingDifficulty||"normal");
  G.state.name = name; G.state.race = c.race; G.state.gender = c.gender; G.state.cls = c.cls;
  G.applyRaceClass();
  G.closeModal("creation-screen");
  G.seed();
  G.begin();
  G.notify("good", `Welcome, ${name}`, `${G.raceName(c.race)} ${G.clsName(c.cls)}`);
};
/* publish the shared render helpers for js/views/*.js */
G.gearAffix = gearAffix;
G.questCard = questCard;
G.wikiAttr = W;
})();
