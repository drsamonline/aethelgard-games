
"use strict";
(function () {
const G = window.Game;

G.diag = { errors: [], warnings: [], started: Date.now(), bootOk: false };

function record(kind, message, detail) {
  G.diag.errors.push({
    kind: kind, message: String(message || "").slice(0, 400),
    detail: detail ? String(detail).slice(0, 600) : "",
    at: new Date().toISOString(),
    tab: G.tab || "-", mode: (G.activeModeId && G.activeModeId()) || "-",
});
  if (G.diag.errors.length > 50) G.diag.errors.shift();
}

window.addEventListener("error", e => {
  if (e && e.target && e.target.tagName === "SCRIPT") {
    record("script", "Could not load " + String(e.target.src || "").split("/").pop(), e.target.src);
} else if (e && e.message) {
    record("runtime", e.message, (e.filename || "") + ":" + (e.lineno || ""));
}
});
window.addEventListener("unhandledrejection", e => {
  const r = e && e.reason;
  record("promise", (r && r.message) || r || "unhandled promise rejection", r && r.stack);
});

function explain(entry) {
  const m = entry.message.toLowerCase();
  if (entry.kind === "script") return "A game file did not load. The usual cause is opening index.html from inside the zip — extract the whole folder first, then open index.html from inside it.";
  if (m.indexOf("is not a function") >= 0) return "The game called something that does not exist. This normally means two files are from different versions — do a hard refresh (Ctrl+F5) to clear a stale cache.";
  if (m.indexOf("cannot read") >= 0 || m.indexOf("undefined") >= 0) return "Something the game expected to be there was missing. If it happened right after loading a save, the save may be from an older version; try importing a fresh export.";
  if (m.indexOf("quota") >= 0 || m.indexOf("storage") >= 0) return "Browser storage is full or blocked. Free some space, or turn off private browsing, then reload.";
  if (m.indexOf("network") >= 0 || m.indexOf("failed to fetch") >= 0) return "A file could not be fetched. Check that the whole folder was extracted and that nothing is blocking local files.";
  if (m.indexOf("audioparam") >= 0 || m.indexOf("audio") >= 0) return "The browser refused an audio value. Volume is clamped now; if sound is missing, check that the audio context reads \"running\" above and that sound and music are on.";
  return "Unexpected error. Copy the details below and include them in a bug report.";
}

G.diagnosticsReport = function () {
  const s = G.state;
  const lines = [];
  const push = (k, v) => lines.push(k.padEnd(22) + ": " + v);

  push("Game version", G.GAME_VERSION || "?");
  push("Boot", G.diag.bootOk ? "ok" : "did not finish");
  push("Uptime", Math.round((Date.now() - G.diag.started) / 1000) + "s");
  push("Mode", (G.activeModeId && G.activeModeId()) || "-");
  push("Language", G.settings && G.settings.lang);
  push("Graphics pack", (G.activeGraphicsPack || "Classic"));
  push("Sprites registered", Object.keys(G.SPRITES || {}).length);
  push("Storage", "localStorage");
  push("Save slots used", G.listSlots().filter(s => s.meta).length + " / 3");
  push("Saves readable", G.store.keys().length + " key(s)");

  if (s) {
    push("Character", (s.name || "?") + " · " + (s.cls || "?") + " · level " + s.level);
    push("Chapter", s.story ? s.story.chapter + (s.story.completed ? " (done)" : "") : "-");
    push("Location", s.map ? s.map.current : "-");
    push("Autosave", G.settings.autosave ? "on" : "off");
} else push("Character", "none loaded");

  const mods = (G.MODS && G.MODS.discovered) ? G.MODS.discovered : [];
  push("Mods found", mods.length);
  if (G.modCompatReport) {
    const rep = G.modCompatReport();
    push("Mod problems", rep.errors.length + " error(s), " + rep.warnings.length + " warning(s)");
}
  push("Service worker", ("serviceWorker" in navigator && navigator.serviceWorker.controller) ? "controlling" : "not controlling");

  const snd = G.Sound || {};
  const audioState = !snd.ctx ? "not started (needs a click)" : snd.ctx.state;
  push("Audio context", audioState);
  push("Sound / music", (G.settings.sound ? "on" : "off") + " / " + (G.settings.music ? "on" : "off"));
  push("Volumes", "effects " + G.settings.volume + ", music " + G.settings.musicVolume);
  push("Protocol", location.protocol);
  push("Viewport", window.innerWidth + "x" + window.innerHeight + " @" + (window.devicePixelRatio || 1) + "x");
  push("User agent", navigator.userAgent.slice(0, 110));

  lines.push("");
  lines.push("ERRORS (" + G.diag.errors.length + ")");
  if (!G.diag.errors.length) lines.push("  none");
  G.diag.errors.forEach((e, i) => {
    lines.push("  " + (i + 1) + ". [" + e.kind + "] " + e.message);
    if (e.detail) lines.push("     at " + e.detail);
    lines.push("     " + explain(e));
});
  return lines.join("\n");
};

G.diagnosticsHTML = function () {
  const rep = G.diagnosticsReport();
  const errs = G.diag.errors;
  const rows = [];
  const row = (k, v) => `<div class="diag-row"><span class="diag-k">${k}</span><span class="diag-v">${v}</span></div>`;
  rows.push(row("Game version", G.GAME_VERSION || "?"));
  rows.push(row("Boot", G.diag.bootOk ? "finished" : "<b>did not finish</b>"));
  rows.push(row("Mode", (G.activeModeId && G.activeModeId()) || "-"));
  rows.push(row("Graphics", G.activeGraphicsPack || "Classic"));
  rows.push(row("Sprites", Object.keys(G.SPRITES || {}).length));
  rows.push(row("Saves", G.listSlots().filter(s => s.meta).length + " of 3 slots used"));
  rows.push(row("Mods", ((G.MODS && G.MODS.discovered) || []).length));
  rows.push(row("Service worker", ("serviceWorker" in navigator && navigator.serviceWorker.controller) ? "controlling" : "not controlling"));
  const snd2 = G.Sound || {};
  const aState = !snd2.ctx ? "not started" : snd2.ctx.state;
  rows.push(row("Audio", (aState === "running" ? "running" : "<b>" + aState + "</b>") +
    " · sound " + (G.settings.sound ? "on" : "off") + " · music " + (G.settings.music ? "on" : "off")));
  rows.push(row("Viewport", window.innerWidth + "x" + window.innerHeight));

  let errBlock = "";
  if (errs.length) {
    errBlock = `<h3 style="color:var(--danger);margin-top:1rem">Errors (${errs.length})</h3>` +
      errs.slice(-8).reverse().map(e =>
        `<div class="diag-err"><div class="de-msg">${escapeHTML(e.message)}</div>
         <div class="de-why">${escapeHTML(explain(e))}</div>
         ${e.detail ? `<div class="de-at">${escapeHTML(e.detail)}</div>` : ""}</div>`).join("");
} else {
    errBlock = `<h3 style="margin-top:1rem">Errors</h3><p class="muted small">None recorded this session. Good.</p>`;
}

  return `<div class="diag">
    <p class="muted small">Everything the game knows about its own state. If something goes wrong, copy this and include it in a bug report.</p>
    ${rows.join("")}
    ${errBlock}
    <div id="content-check">${G.contentCheckHTML ? G.contentCheckHTML() : ""}</div>
    <div class="btn-row" style="margin-top:1rem">
      <button class="btn btn-sm" onclick="Game.copyDiagnostics()">Copy report</button>
      <button class="btn btn-sm" onclick="Game.downloadDiagnostics()">Download report</button>
      <button class="btn btn-sm btn-danger" onclick="Game.diag.errors.length=0;Game.buildSettings();Game.notify('good','Cleared','Error list emptied.')">Clear errors</button>
    </div>
    <details style="margin-top:1rem"><summary class="muted small">Full text report</summary>
      <pre class="diag-pre">${escapeHTML(rep)}</pre></details>
  </div>`;
};

function escapeHTML(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

G.copyDiagnostics = function () {
  const txt = G.diagnosticsReport();
  try {
    if (navigator.clipboard) navigator.clipboard.writeText(txt);
    G.notify("good", "Diagnostics copied", "Paste it into your bug report.");
} catch (e) { prompt("Diagnostics:", txt); }
};

G.downloadDiagnostics = function () {
  try {
    const blob = new Blob([G.diagnosticsReport()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "aethelgard-diagnostics.txt";
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
    G.notify("good", "Diagnostics downloaded", "");
} catch (e) { G.notify("bad", "Could not download", ""); }
};

G.markBootOk = function () { G.diag.bootOk = true; };
})();
