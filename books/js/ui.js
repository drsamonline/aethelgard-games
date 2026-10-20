/* ============================================================
   SAGA ENGINE — interface

   Title screen, the Diary, settings, the ending card, and every
   button the reader can press outside a scene.
   ============================================================ */
"use strict";
(function () {
const G = window.Game;
const $ = id => document.getElementById(id);

/* ---------------- screens ---------------- */
/* The game screen is the stage itself, so it has no #screen-game wrapper —
   the other two are real overlay screens. */
G.screen = function (name) {
  ["title","ending"].forEach(s => {
    const el = $("screen-" + s);
    if (el) el.classList.toggle("on", s === name);
  });
  G.showStage(name === "game");
};
G.showStage = function (on) { $("stage").classList.toggle("on", !!on); };

/* ---------------- title ---------------- */
G.renderTitle = function () {
  const has = G.hasSave(1);
  $("btn-continue").disabled = !has;
  $("btn-continue").textContent = has ? "Continue" : "No save yet";
  $("save-info").textContent = has ? "Book " + (G.load(1).book || 1) + " in progress" : "";
};

G.beginNew = function () {
  const s = G.newGame(1);
  s.book = 1;
  G.screen("game");
  G.Music.setMood("calm");
  G.startScene(G.FIRST_SCENE);
};

G.continueGame = function () {
  const s = G.load(1);
  if (!s) { G.notify("No save", "Start a new game."); return; }
  G.screen("game");
  G.startScene(s.scene || G.FIRST_SCENE, s.line || 0);
};

/* ---------------- the Diary ---------------- */
G.TABS = [
  { id:"people",   name:"People" },
  { id:"places",   name:"Places" },
  { id:"decisions",name:"Decisions" },
  { id:"lore",     name:"Lore" },
  { id:"deeds",    name:"Deeds" },
];
G.openDiary = function (tab) {
  $("diary").classList.add("show");
  G.diaryTab = tab || G.diaryTab || "people";
  G.renderDiary();
};

G.renderDiary = function () {
  const s = G.state; if (!s) return;
  $("diary-tabs").innerHTML = G.TABS.map(t =>
    `<button class="dtab ${t.id === G.diaryTab ? "on" : ""}" data-tab="${t.id}">${t.name}</button>`).join("");
  $("diary-tabs").querySelectorAll(".dtab").forEach(b =>
    b.onclick = () => { G.diaryTab = b.dataset.tab; G.renderDiary(); });

  let html = "";
  const listOf = t => {
    if (t === "people")    return s.people.map(e => typeof e === "string" ? e : e.text);
    if (t === "places")    return s.places.map(e => typeof e === "string" ? e : e.text);
    if (t === "lore")      return s.lore.map(e => typeof e === "string" ? e : e.text);
    if (t === "decisions") return s.decisions.map(d => d.text);
    return Object.keys(s.achievements).map(k => (G.ACHIEVEMENTS[k] || {}).name || k);
  };
  const items = listOf(G.diaryTab);
  if (!items.length) html = `<p class="dim">Nothing recorded yet.</p>`;
  else html = "<ul class='dlist'>" + items.map(x => `<li>${G.esc(x)}</li>`).join("") + "</ul>";

  // the axes are shown only here, and only as words
  if (G.diaryTab === "deeds") {
    html += `<h4>The four</h4><div class="axes">` + G.AXES.map(a =>
      `<div class="ax"><span>${G.AXIS_INFO[a].name}</span><b>${G.axisLabel(a)}</b></div>`).join("") + `</div>`;
  }
  $("diary-body").innerHTML = html;
};

/* ---------------- settings ---------------- */
G.openSettings = function () {
  $("settings").classList.add("show");
  const s = G.settings;
  $("settings-body").innerHTML = `
    <div class="srow"><span>Text speed</span>
      <select id="set-speed">${["Slow","Normal","Fast","Instant"].map((n,i)=>
        `<option value="${i}" ${s.textSpeed===i?"selected":""}>${n}</option>`).join("")}</select></div>
    <div class="srow"><span>Sound effects</span>
      <input type="checkbox" id="set-sound" ${s.sound?"checked":""}></div>
    <div class="srow"><span>Music</span>
      <input type="checkbox" id="set-music" ${s.music?"checked":""}></div>
    <div class="srow"><span>Effects volume</span>
      <input type="range" min="0" max="1" step="0.05" id="set-vol" value="${s.volume}"></div>
    <div class="srow"><span>Music volume</span>
      <input type="range" min="0" max="1" step="0.05" id="set-mvol" value="${s.musicVolume}"></div>
    <div class="srow"><span>Reduce motion</span>
      <input type="checkbox" id="set-motion" ${s.reduceMotion?"checked":""}></div>
    <hr>
    <div class="srow"><span>Save</span>
      <span><button id="set-export">Export</button> <button id="set-import">Import</button>
      <input type="file" id="set-file" accept=".json" hidden></span></div>
    <div class="srow"><span>Restart book</span><button id="set-restart">Start over</button></div>
    <hr>
    <hr>
    <div class="srow"><span>Mods</span><button id="set-mods">Show report</button></div>
    <div id="mod-list" class="mod-list"></div>
    <pre id="mod-report" class="mod-report"></pre>
    <p class="dim small">Version ${G.VERSION} · ${G.ENGINE} engine</p>`;

  $("set-speed").onchange = e => { G.settings.textSpeed = Number(e.target.value); G.saveSettings(); };
  $("set-sound").onchange = e => { G.settings.sound = e.target.checked; G.saveSettings(); };
  $("set-music").onchange = e => { G.settings.music = e.target.checked; G.saveSettings();
                                   G.settings.music ? G.Music.start() : G.Music.stop(); };
  $("set-vol").oninput   = e => { G.settings.volume = G.clampVol(e.target.value, 1); G.saveSettings(); G.Sound.setVolume(G.settings.volume); };
  $("set-mvol").oninput  = e => { G.settings.musicVolume = G.clampVol(e.target.value, 0.6); G.saveSettings(); G.Music.refreshVolume(); };
  $("set-motion").onchange = e => { G.settings.reduceMotion = e.target.checked; G.saveSettings();
                                    document.body.classList.toggle("reduce-motion", e.target.checked); };
  if (G.MODS && G.MODS.discovered.length) {
    $("mod-list").innerHTML = G.MODS.discovered.map(m => {
      const st = m._state || "off";
      const note = st === "conflict" ? `conflicts with ${m._conflictWith}`
                 : st === "invalid" ? (m._problems || []).join("; ")
                 : st === "blocked" ? `needs ${(m._blockedBy||[]).join(", ")}`
                 : st === "failed" ? m._error
                 : (G.modNeedsRestart && G.modNeedsRestart(m)) ? "applies on restart" : "";
      return `<label class="mod-row${st !== "loaded" ? " off" : ""}">
        <input type="checkbox" data-mod="${G.esc(m.id)}" ${G.modEnabled(m.id) ? "checked" : ""}>
        <span><b>${G.esc(m.name || m.id)}</b> <i>${G.esc(m.version || "")}</i>
        ${note ? `<em>${G.esc(note)}</em>` : ""}</span></label>`;
    }).join("");
    $("mod-list").querySelectorAll("input[data-mod]").forEach(cb =>
      cb.onchange = () => G.setModEnabled(cb.dataset.mod, cb.checked));
  }
  $("set-mods").onclick = () => {
    const el = $("mod-report");
    if (el.dataset.on === "1") { el.textContent = ""; el.dataset.on = "0"; return; }
    el.textContent = G.modReport ? G.modReport() : "no mod system";
    el.dataset.on = "1";
  };
  $("set-export").onclick = () => G.exportSaveFile();
  $("set-import").onclick = () => $("set-file").click();
  $("set-file").onchange = e => { if (e.target.files[0]) G.importSaveFile(e.target.files[0]); };
  $("set-restart").onclick = () => {
    if (!confirm("Start Book I over? Your current save will be erased.")) return;
    G.deleteSave(1); G.closeSettings(); G.screen("title"); G.renderTitle();
  };
};
G.closeSettings = function () { $("settings").classList.remove("show"); };

G.clampVol = function (v, fallback) {
  const n = Number(v);
  return isFinite(n) ? Math.max(0, Math.min(1, n)) : (fallback === undefined ? 1 : fallback);
};

/* ---------------- chapter end ---------------- */
G.showSceneEnd = function () {
  const idx = G.SCENE_ORDER.indexOf(G.state.scene);
  const next = G.SCENE_ORDER[idx + 1];
  const el = $("scene-end");
  el.innerHTML = `<h2>Chapter complete</h2>
    <p>${G.esc((G.SCENES[G.state.scene] || {}).title || "")}</p>
    <button id="se-next" ${next ? "" : "disabled"}>${next ? "Next chapter" : "To be continued"}</button>
    <button id="se-diary">Open the Diary</button>
    <button id="se-title">Title screen</button>`;
  el.classList.add("show");
  if (next) $("se-next").onclick = () => {
    el.classList.remove("show");
    const s = G.SCENES[next];
    G.state.book = s.book || G.state.book;
    G.startScene(next);
  };
  $("se-diary").onclick = () => { el.classList.remove("show"); G.openDiary(); };
  $("se-title").onclick = () => { el.classList.remove("show"); G.screen("title"); G.renderTitle(); };
};

/* ---------------- ending ---------------- */
G.showEnding = function (id) {
  const el = $("screen-ending");
  const names = G.ENDING_NAMES || { dawn:"Dawn" };
  const rung = ((G.ENDING_LADDER || []).indexOf(id)) + 1;
  el.innerHTML = `<div class="end-wrap">
    <p class="end-kicker">An ending${rung ? ` — ${rung} of 7` : ""}</p>
    <h1>${G.esc(names[id] || id)}</h1>
    <div class="end-axes">${G.AXES.map(a =>
      `<div class="ax"><span>${G.AXIS_INFO[a].name}</span><b>${G.axisLabel(a)}</b></div>`).join("")}</div>
    <p class="dim">${G.axisSummary ? G.axisSummary() : ""}</p>
    <p class="dim">Endings found: ${Object.keys(G.state.endingsSeen).length} of 7</p>
    <button id="end-diary">The Diary</button>
    <button id="end-title">Title screen</button>
  </div>`;
  G.screen("ending");
  $("end-diary").onclick = () => G.openDiary();
  $("end-title").onclick = () => { G.screen("title"); G.renderTitle(); };
};
})();
