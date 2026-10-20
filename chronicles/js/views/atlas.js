
"use strict";
(function () {
const G = window.Game;
const t = k => G.t(k);
const n = v => G.fmt(v);
const W = k => `data-wiki="${k}"`;
const gearAffix = G.gearAffix;
const questCard = G.questCard;

G.viewAtlas = function () {
  const p = G.state;
  let h = `<div class="panel"><h2>🗺️ Atlas</h2>
    <div class="map-toggle">
      <button class="chip ${G.mapMode==="world"?"on":""}" onclick="Game.setMapMode('world')">🌍 ${t("ui.world")}</button>
      <button class="chip ${G.mapMode==="local"?"on":""}" onclick="Game.setMapMode('local')">📍 ${t("ui.local")}</button>
    </div>
    ${G.mapMode==="world" ? G.renderWorldMap() : G.renderLocalMap()}
    <div class="btn-row" style="margin-top:10px">
      ${G.mapMode==="local" ? `<button class="btn btn-sm" onclick="Game.searchSecrets()" ${p.energy<10?"disabled":""}>🔍 Search for secrets (10⚡)</button>` : ""}
      <button class="btn btn-sm" onclick="Game.returnToTown()">🏘️ Return to Oakhaven</button>
    </div>
    <p class="muted small" style="margin-top:10px">${G.mapMode==="world" ? "Click a discovered region to travel. Locked regions open as the story progresses." : "Click a point of interest to act. Danger rises with the region."}</p>
  </div>`;
  if (p.endless.active || p.stats.endlessBest > 0) {
    h += `<div class="panel"><h2>🕳️ The Depths</h2>
      <p class="story-text">An endless dungeon. Every floor is harder, with new modifiers — but the rewards grow too. Dying or retreating ends the run.</p>
      <div class="stats-grid">
        <div class="stat-node"><div class="sn-left"><span class="sn-name">Current floor</span></div><span class="sn-val">${p.endless.active ? p.endless.floor : "—"}</span></div>
        <div class="stat-node"><div class="sn-left"><span class="sn-name">Best floor</span></div><span class="sn-val">${p.stats.endlessBest}</span></div>
      </div>
      ${p.endless.active ? `<p class="muted small" style="margin-top:8px">Modifiers: ${(p.endless.mods||[]).map(k=>G.ENDLESS_MODS[k].emoji+" "+G.ENDLESS_MODS[k].name).join(", ")||"none"}</p>` : ""}
      <div class="btn-row" style="margin-top:10px">
        <button class="btn btn-danger" onclick="Game.startEndless()" ${p.energy<15?"disabled":""}>${p.endless.active?"Descend further":"Enter the Depths"} (15⚡)</button>
        ${p.endless.active?`<button class="btn" onclick="Game.endlessRetreat()">Retreat & bank rewards</button>`:""}
      </div></div>`;
}
  const cur = G.LOCATIONS[p.map.current];
  h += `<div class="panel"><h2 ${W("loc_"+p.map.current)}>${G.sprite("loc."+p.map.current, "📍")} ${cur.name}</h2><p class="story-text">${cur.desc}</p>`;
  if (p.dungeon.active) h += `<p class="story-text">Dungeon depth: <b style="color:var(--danger)">${p.dungeon.depth}</b></p><button class="btn btn-danger" onclick="Game.leaveDungeon()">🚪 Leave Dungeon</button>`;
  h += `</div>`;
  return h;
};

})();
