
"use strict";
(function () {
const G = window.Game;

G.mapBackdrop = function (key) {
  const s = G.SPRITES && key ? G.SPRITES[key] : null;
  return s && s.src ? `url('${s.src}')` : "none";
};

G.mapMode = "world";
G.setMapMode = function (m) { G.mapMode = m; G.render(); };

G.renderWorldMap = function () {
  const p = G.state;

  const links = (G.WORLD_LINKS || []).map(([a,b]) => {
    const A = G.WORLD_POS[a], B = G.WORLD_POS[b];
    if (!A || !B) return "";
    return `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="wm-link"/>`;
}).join("");
  const nodes = Object.keys(G.LOCATIONS).filter(id => G.WORLD_POS[id]).map(id => {
    const pos = G.WORLD_POS[id], l = G.LOCATIONS[id];
    const unlocked = G.isUnlocked(id), here = p.map.current === id;
    return `<div class="wm-node ${unlocked?"":"locked"} ${here?"here":""}" style="left:${pos.x}%;top:${pos.y}%" ${unlocked?`onclick="Game.travel('${id}')"`:""} data-wiki="loc_${id}">
      <span class="wm-emoji">${G.sprite("loc."+id, l.emoji, {size:"lg"})}</span><span class="wm-name">${l.name}</span>
      ${here?'<span class="wm-here">you are here</span>':(unlocked?"":'<span class="wm-lock">🔒</span>')}
    </div>`;
}).join("");
  return `<div class="map-frame"><div class="world-map" style="--map-bg:${G.mapBackdrop("bg.world")}">
    <svg class="wm-links" viewBox="0 0 100 100" preserveAspectRatio="none">${links}</svg>
    ${nodes}
    <div class="wm-compass">N</div>
  </div></div>`;
};

G.renderLocalMap = function () {
  const p = G.state;
  const pois = G.LOCAL_MAPS[p.map.current] || [];
  const l = G.LOCATIONS[p.map.current];
  if (!pois.length) return `<p class="muted">No points of interest here.</p>`;

  const ACT_ART = { gather: "item.wood", fish: "item.fish", forage: "item.herb",
                    prospect: "item.ore", cook: "item.meal", farm: "item.food" };
  const poiIcon = poi => {
    const own = "poi." + p.map.current + "." + poi.id;
    if (G.SPRITES && G.SPRITES[own]) return G.sprite(own, poi.emoji, { size: "lg" });
    const spawn = (poi.spawn && poi.spawn[0]) || null;
    if (spawn && G.SPRITES && G.SPRITES["enemy." + spawn]) return G.sprite("enemy." + spawn, poi.emoji, { size: "lg" });
    const act = ACT_ART[poi.act];
    if (act && G.SPRITES && G.SPRITES[act]) return G.sprite(act, poi.emoji, { size: "lg" });
    return G.sprite(own, poi.emoji, { size: "lg" });
};
  let nodes = pois.map(poi => `
    <button class="poi" style="left:${poi.x}%;top:${poi.y}%" onclick="Game.localAct('${poi.id}')" data-wiki="loc_${p.map.current}" title="${poi.desc}">
      <span class="poi-emoji">${poiIcon(poi)}</span><span class="poi-name">${poi.name}</span>
    </button>`).join("");

  if (G.regionSecrets && G.secretFound) {
    G.regionSecrets(p.map.current).forEach((s, i) => {
      if (!G.secretFound(p.map.current, s.id)) return;
      const claimed = p.secrets[G.secretKey(p.map.current, s.id)] === "claimed";
      nodes += `<button class="poi poi-secret" style="left:${18 + i*26}%;top:${14 + (i%2)*10}%" onclick="Game.claimSecret('${p.map.current}','${s.id}')" title="${claimed ? 'Already claimed' : 'Claim your reward'}">
        <span class="poi-emoji">${G.sprite("secret."+p.map.current+"."+s.id, s.emoji, {size:"lg"})}</span><span class="poi-name">${s.name}${claimed ? " ✓" : ""}</span></button>`;
});
}
  return `<div class="map-frame"><div class="local-map" style="--map-bg:${G.mapBackdrop("bg." + p.map.current)}">
    <div class="lm-ground"></div>${nodes}
    <div class="lm-label">${G.sprite("loc."+p.map.current, l.emoji)} ${l.name}</div>
  </div></div>`;
};
})();
