
"use strict";
window.Game = window.Game || {};

const ENEMIES = {

  rat:        { name:"Giant Rat", emoji:"🐀", hp:22, atk:6, def:0, xp:20, gold:7, tier:1, element:"physical", drops:{ food:1 },
                abilities:[ {name:"Gnaw", chance:0.2, kind:"dot", status:"bleed", mult:0.6, msg:"gnaws at your legs"} ] },
  wolf:       { name:"Diseased Wolf", emoji:"🐺", hp:34, atk:8, def:1, xp:35, gold:12, tier:1, element:"physical", drops:{ leather:1 }, weak:["fire"],
                abilities:[ {name:"Rabid Bite", chance:0.28, kind:"dot", status:"bleed", mult:0.7, msg:"sinks its teeth in"} ] },
  goblin:     { name:"Goblin Scout", emoji:"👺", hp:58, atk:12, def:2, xp:55, gold:26, tier:1, element:"physical", drops:{ iron:1, potion:0.2 },
                abilities:[ {name:"Rusty Stab", chance:0.25, kind:"dot", status:"bleed", mult:0.7, msg:"slashes wildly"} ] },
  bat:        { name:"Cave Bat", emoji:"🦇", hp:26, atk:6, def:1, xp:30, gold:10, tier:1, element:"dark", drops:{ wood:1 }, weak:["fire"],
                abilities:[ {name:"Draining Bite", chance:0.3, kind:"drain", mult:0.8, msg:"drains your vitality"} ] },
  boar:       { name:"Wild Boar", emoji:"🐗", hp:48, atk:11, def:3, xp:48, gold:18, tier:1, element:"physical", drops:{ food:1, leather:0.5 },
                abilities:[ {name:"Gore", chance:0.25, kind:"heavy", mult:1.5, telegraph:"lowers its tusks", msg:"charges home"} ] },

  bandit:     { name:"Bandit", emoji:"🗡️", hp:78, atk:16, def:4, xp:72, gold:44, tier:2, element:"physical", drops:{ leather:1, gold:1 },
                abilities:[ {name:"Cheap Shot", chance:0.24, kind:"stun", mult:0.5, msg:"swings low"} ] },
  spider:     { name:"Giant Spider", emoji:"🕷️", hp:66, atk:14, def:3, xp:80, gold:40, tier:2, element:"poison", drops:{ leather:1, ruby:0.2 },
                abilities:[ {name:"Venomous Bite", chance:0.32, kind:"dot", status:"poison", mult:0.6, msg:"injects venom"} ] },
  harpy:      { name:"Harpy", emoji:"🦅", hp:70, atk:18, def:2, xp:88, gold:48, tier:2, element:"physical", drops:{ leather:1 }, weak:["ice"],
                abilities:[ {name:"Screech", chance:0.25, kind:"weaken", mult:0.3, msg:"lets out a piercing screech"},
                            {name:"Talon Dive", chance:0.2, kind:"heavy", mult:1.5, telegraph:"swoops upward", msg:"dives with talons"} ] },
  ghoul:      { name:"Ghoul", emoji:"🧟", hp:84, atk:17, def:4, xp:95, gold:52, tier:2, element:"dark", drops:{ herb:1 }, resist:{dark:0.4}, weak:["fire"],
                abilities:[ {name:"Ravenous Bite", chance:0.3, kind:"drain", mult:0.85, msg:"tears at your flesh"} ] },

  ogre:       { name:"Mountain Ogre", emoji:"👹", hp:124, atk:23, def:7, xp:125, gold:80, tier:3, element:"physical", drops:{ iron:2, food:1 }, resist:{fire:0.4},
                abilities:[ {name:"Crushing Blow", chance:0.3, kind:"heavy", mult:1.9, telegraph:"raises a massive fist", msg:"brings down a crushing blow"} ] },
  rogue_mage: { name:"Rogue Mage", emoji:"🧙", hp:92, atk:21, def:3, xp:105, gold:66, tier:3, element:"dark", drops:{ ruby:1 }, resist:{dark:0.5},
                abilities:[ {name:"Hex", chance:0.28, kind:"weaken", mult:0.4, msg:"mutters a hex"},
                            {name:"Ice Lance", chance:0.22, kind:"heavy", mult:1.5, telegraph:"gathers frost", msg:"hurls an ice lance", element:"ice"} ] },
  wraith:     { name:"Cave Wraith", emoji:"👻", hp:100, atk:20, def:5, xp:120, gold:70, tier:3, element:"dark", drops:{ ruby:1 }, resist:{physical:0.35, dark:0.6}, weak:["fire"],
                abilities:[ {name:"Life Siphon", chance:0.3, kind:"drain", mult:0.9, msg:"siphons your life"},
                            {name:"Wail", chance:0.2, kind:"weaken", mult:0.3, msg:"lets out a chilling wail"} ] },
  golem:      { name:"Stone Golem", emoji:"🗿", hp:160, atk:22, def:14, xp:150, gold:95, tier:3, element:"physical", drops:{ ore:2 }, resist:{physical:0.3}, weak:["ice"],
                abilities:[ {name:"Slam", chance:0.28, kind:"heavy", mult:1.7, telegraph:"raises both arms", msg:"slams the ground"} ] },

  wyvern:     { name:"Wyvern", emoji:"🐉", hp:190, atk:30, def:10, xp:230, gold:150, tier:4, element:"fire", drops:{ ruby:1, leather:2 }, resist:{fire:0.6}, weak:["ice"],
                abilities:[ {name:"Fire Breath", chance:0.3, kind:"dot", status:"burn", mult:1.1, element:"fire", msg:"exhales a torrent of flame"},
                            {name:"Tail Sweep", chance:0.2, kind:"heavy", mult:1.7, telegraph:"coils its tail", msg:"sweeps its tail"} ] },
  assassin:   { name:"Nightblade Assassin", emoji:"🥷", hp:150, atk:34, def:6, xp:210, gold:170, tier:4, element:"dark", drops:{ relic:0.4 },
                abilities:[ {name:"Shadow Strike", chance:0.3, kind:"heavy", mult:1.9, telegraph:"melts into shadow", msg:"strikes from behind"},
                            {name:"Poison Dart", chance:0.25, kind:"dot", status:"poison", mult:0.7, msg:"hurls a dart"} ] },

  bog_horror: { name:"Bog Horror", emoji:"🦠", hp:220, atk:24, def:6, xp:260, gold:160, tier:3, boss:true, element:"poison", drops:{ ruby:1, herb:2 }, resist:{poison:0.6}, weak:["fire"],
                abilities:[ {name:"Toxic Bloom", chance:0.3, kind:"dot", status:"poison", mult:1.0, msg:"bursts with toxins"},
                            {name:"Engulf", chance:0.25, kind:"heavy", mult:1.8, telegraph:"swells and lunges", msg:"tries to engulf you"} ] },
  spider_queen:{ name:"Spider Queen", emoji:"🕸️", hp:260, atk:26, def:8, xp:300, gold:190, tier:3, boss:true, element:"poison", drops:{ ruby:2, leather:3 }, resist:{poison:0.5}, weak:["fire"],
                abilities:[ {name:"Web Snare", chance:0.28, kind:"stun", mult:0.5, msg:"binds you in webbing"},
                            {name:"Brood Call", chance:0.22, kind:"buff", status:"rage", msg:"screams for her brood"} ] },
  coven:      { name:"Coven Leader", emoji:"🧟", hp:290, atk:28, def:9, xp:340, gold:200, tier:4, boss:true, element:"dark", drops:{ ruby:2, relic:1 }, resist:{dark:0.6}, weak:["fire"],
                abilities:[ {name:"Necrotic Wave", chance:0.3, kind:"heavy", mult:1.8, telegraph:"channels necrotic energy", msg:"unleashes a necrotic wave", element:"dark"},
                            {name:"Dark Ritual", chance:0.2, kind:"buff", status:"rage", msg:"performs a dark ritual"},
                            {name:"Soul Drain", chance:0.25, kind:"drain", mult:0.9, msg:"drains your soul"} ] },
  warlord:    { name:"Bandit Warlord", emoji:"⚔️", hp:320, atk:32, def:12, xp:380, gold:280, tier:4, boss:true, element:"physical", drops:{ relic:1, ore:2 }, resist:{physical:0.25},
                abilities:[ {name:"Cleave", chance:0.3, kind:"heavy", mult:1.9, telegraph:"raises his greatsword", msg:"cleaves downward"},
                            {name:"War Cry", chance:0.22, kind:"buff", status:"rage", msg:"roars a war cry"} ] },
  warden:     { name:"Iron Warden", emoji:"🗿", hp:420, atk:34, def:16, xp:600, gold:400, tier:5, boss:true, element:"physical", drops:{ ruby:3, ore:4, artifact:1 }, resist:{physical:0.3}, weak:["ice"],
                abilities:[ {name:"Sunder", chance:0.3, kind:"heavy", mult:2.0, telegraph:"raises both arms", msg:"sunders the ground"},
                            {name:"Fortify", chance:0.2, kind:"buff", status:"shield", msg:"hardens its plating"},
                            {name:"Tremor", chance:0.2, kind:"stun", mult:0.6, msg:"slams the earth"} ] },
};

Object.assign(window.Game, { ENEMIES });
