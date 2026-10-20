
window.AETHELGARD_MODS = window.AETHELGARD_MODS || [];

window.AETHELGARD_MODS.push({
  id: "marsh-lurker",
  name: "Marsh Lurker",
  version: "1.0.0",
  author: "Dr. Sohil Momin",
  description: "Adds a new Mire predator, a fang weapon, a quest and an achievement.",
  impact: "additive",
  provides: ["bestiary:marsh-lurker"],

  ENEMIES: {
    marsh_lurker: {
      name:"Marsh Lurker", emoji:"🦎", hp:110, atk:20, def:6, xp:140, gold:90, tier:3,
      element:"poison", drops:{ herb:2, ruby:0.3 }, weak:["ice"], resist:{poison:0.4},
      abilities:[
        { name:"Tongue Lash", chance:0.3, kind:"dot", status:"poison", mult:0.8, msg:"lashes with its tongue" },
        { name:"Ambush", chance:0.2, kind:"heavy", mult:1.7, telegraph:"coils to spring", msg:"springs from the water" },
],
},
},

  GEAR: {
    lurker_fang: { name:"Lurker Fang", slot:"weapon", emoji:"🗡️", atk:20, crit:0.04, tier:3, cost:{ iron:6, ruby:2 } },
},

  SIDE_QUESTS: [
    { id:"mod_lurker", name:"The Marsh Lurker", desc:"Something new stalks the Mire. Defeat 3 Marsh Lurkers.",
      objective:{ type:"kill", target:"marsh_lurker", required:3 },
      rewards:{ gold:220, xp:240, items:{ ruby:1 } }, unlocks:["Lurker Fang recipe"],
      unlock:{ chapter:3 }, prepare:["Marsh Lurkers are weak to Ice","Bring an Antidote for their venom"] },
],

  ACHIEVEMENTS: [
    { id:"mod_lurker_slain", name:"Lurker Slain", emoji:"🦎", desc:"Defeat 3 Marsh Lurkers.",
      check:s => (s.stats.byEnemy.marsh_lurker || 0) >= 3 },
],

  WIKI: {
    enemy_marsh_lurker: { key:"enemy_marsh_lurker", title:"Marsh Lurker", cat:"Bestiary", short:"Tier 3 · Poison",
      body:"A mod-added predator of the Crimson Mire. Weak to Ice, resists Poison." },
    gear_lurker_fang: { key:"gear_lurker_fang", title:"Lurker Fang", cat:"Gear", short:"weapon · tier 3",
      body:"A mod-added weapon forged from a Marsh Lurker's fang." },
},

  init(G) {
    if (G.LOCATIONS && G.LOCATIONS.mire && Array.isArray(G.LOCATIONS.mire.spawns) && G.LOCATIONS.mire.spawns.indexOf("marsh_lurker") < 0) {
      G.LOCATIONS.mire.spawns.push("marsh_lurker");
}
    if (G.LOCAL_MAPS && Array.isArray(G.LOCAL_MAPS.mire) && !G.LOCAL_MAPS.mire.some(p => p.id === "lurker")) {
      G.LOCAL_MAPS.mire.push({ id:"lurker", name:"Lurker Pool", emoji:"🦎", x:62, y:52, act:"hunt", spawn:["marsh_lurker"], desc:"Hunt the Marsh Lurker (mod)." });
}
    if (G.BOUNTY_POOL && G.BOUNTY_POOL.indexOf("marsh_lurker") < 0) G.BOUNTY_POOL.push("marsh_lurker");
},
});
