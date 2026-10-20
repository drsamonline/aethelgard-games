
window.AETHELGARD_MODS = window.AETHELGARD_MODS || [];

window.AETHELGARD_MODS.push({
  id: "long-winter",
  name: "The Long Winter (balance overhaul)",
  version: "1.0.0",
  author: "Dr. Sohil Momin",
  description: "A colder, crueller Aethelgard: tougher early enemies and a new difficulty.",
  impact: "overhaul",

  ENEMIES: {
    wolf:   { name:"Frostbitten Wolf", emoji:"🐺", hp:46, atk:11, def:2, xp:48, gold:18, tier:1, element:"ice",
              drops:{ leather:1 }, weak:["fire"], resist:{ice:0.4},
              abilities:[ { name:"Frozen Bite", chance:0.3, kind:"dot", status:"burn", mult:0.7, msg:"bites with frost-crusted jaws" } ] },
    goblin: { name:"Goblin Raider", emoji:"👺", hp:72, atk:15, def:3, xp:70, gold:34, tier:1, element:"physical",
              drops:{ iron:1, potion:0.25 },
              abilities:[ { name:"Rusty Stab", chance:0.25, kind:"dot", status:"bleed", mult:0.8, msg:"slashes wildly" },
                          { name:"Pack Call", chance:0.15, kind:"buff", status:"rage", msg:"screams for its pack" } ] },
    bandit: { name:"Winter Bandit", emoji:"🗡️", hp:96, atk:19, def:5, xp:88, gold:54, tier:2, element:"physical",
              drops:{ leather:1, gold:1 }, resist:{ice:0.2},
              abilities:[ { name:"Cheap Shot", chance:0.24, kind:"stun", mult:0.5, msg:"swings low" },
                          { name:"Frost Trap", chance:0.18, kind:"heavy", mult:1.6, telegraph:"scatters frost across the ground", msg:"springs a frost trap", element:"ice" } ] },
},

  DIFFICULTY: {
    winter: { label:"Long Winter", eAtk:1.6, eHp:1.5, xp:1.8, gold:1.5 },
},

  WIKI: {
    diff_winter: { key:"diff_winter", title:"Long Winter", cat:"Meta", short:"A mod-added difficulty",
      body:"A mod-added difficulty tier: enemies hit far harder and last far longer, but pay out much more." },
},

  GEAR: {
    frostbrand: { name:"Frostbrand", slot:"weapon", emoji:"❄️", atk:30, tier:4, cost:{ iron:12, ruby:4 } },
},

  init(G) {
    G.log("❄️ The Long Winter has settled over Aethelgard.");
    if (G.LOCATIONS && G.LOCATIONS.mountains && Array.isArray(G.LOCATIONS.mountains.spawns)) {
      ["wolf","goblin"].forEach(id => { if (G.LOCATIONS.mountains.spawns.indexOf(id) < 0) G.LOCATIONS.mountains.spawns.push(id); });
}
},
});
