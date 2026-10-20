
window.AETHELGARD_MODS = window.AETHELGARD_MODS || [];

window.AETHELGARD_MODS.push({
  id: "lurker-hunt",
  name: "Lurker Hunt (add-on example)",
  version: "1.0.0",
  author: "Dr. Sohil Momin",
  description: "Extends the Marsh Lurker mod. Demonstrates requiresMods + loadAfter.",
  impact: "additive",

  requiresMods: ["marsh-lurker"],
  loadAfter:    ["marsh-lurker"],
  provides:     ["quest:lurker-hunt"],

  SIDE_QUESTS: [
    { id:"mod_lurker_hunt", name:"Cull the Lurker Pool", desc:"The Mire's new predator breeds fast. Kill 5 Marsh Lurkers.",
      objective:{ type:"kill", target:"marsh_lurker", required:5 },
      rewards:{ gold:300, xp:320, items:{ ruby:2 } }, unlocks:["Lurker Fang recipe", "Bounty board entry"],
      unlock:{ chapter:4 },
      prepare:["Marsh Lurkers resist Poison and are weak to Ice","Bring an Antidote — their venom stacks","Fight them one at a time; they hit hard in packs"] },
],

  ACHIEVEMENTS: [
    { id:"mod_lurker_culler", name:"Lurker Culler", emoji:"🦎", desc:"Defeat 5 Marsh Lurkers.",
      check:s => (s.stats.byEnemy.marsh_lurker || 0) >= 5 },
],

  WIKI: {
    mod_lurker_hunt: { key:"mod_lurker_hunt", title:"Cull the Lurker Pool", cat:"Quests",
      short:"Add-on quest", body:"An add-on quest that only exists while the Marsh Lurker mod is enabled." },
},
});
