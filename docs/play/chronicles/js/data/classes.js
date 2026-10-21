
"use strict";
window.Game = window.Game || {};

const CLASSES = {
  berserker: {
    name:"Berserker", emoji:"🪓", role:"Damage", color:"#e8574a",
    desc:"A whirlwind of fury. Trades safety for overwhelming violence.",
    blurb:"+4 Might, +20 HP, +25% crit damage, but −3 defence.",
    bonus:{ might:4, vitality:2 }, hp:20, def:-3, critDmg:0.25,
    startGear:{ weapon:"hand_axe", armor:"clothes" },
},
  warrior: {
    name:"Warrior", emoji:"⚔️", role:"Bruiser", color:"#e0b34d",
    desc:"A disciplined soldier. Strong, steady, and hard to put down.",
    blurb:"+3 Might, +2 Vitality, +30 HP, +3 defence.",
    bonus:{ might:3, vitality:2 }, hp:30, def:3,
    startGear:{ weapon:"steel_sword", armor:"leather_armor" },
},
  defender: {
    name:"Defender", emoji:"🛡️", role:"Tank", color:"#5fc8ff",
    desc:"An immovable wall. Protects, endures, and outlasts.",
    blurb:"+4 Vitality, +8 defence, +45 HP, taunts and shields.",
    bonus:{ vitality:4 }, hp:45, def:8,
    startGear:{ weapon:"mace", offhand:"tower_shield", armor:"iron_plate" },
},
  archer: {
    name:"Archer", emoji:"🏹", role:"Ranged", color:"#7ad14a",
    desc:"Death from a distance. Precise, patient, deadly.",
    blurb:"+3 Finesse, +10% crit, +15% gold from hunts, ranged skills.",
    bonus:{ finesse:3, might:1 }, crit:0.10, goldBonus:0.15,
    startGear:{ weapon:"hunting_bow", armor:"leather_armor" },
},
  thief: {
    name:"Thief", emoji:"🗡️", role:"Stealth", color:"#b07cff",
    desc:"Shadow and silence. Strikes from behind, then vanishes.",
    blurb:"+4 Finesse, +12% crit, +20% crime & escape, backstab skills.",
    bonus:{ finesse:4, vitality:-1 }, crit:0.12, flee:0.10, crime:0.20,
    startGear:{ weapon:"dagger", armor:"clothes" },
},
  swordmaster: {
    name:"Swordmaster", emoji:"🤺", role:"Technique", color:"#ffe08a",
    desc:"Every strike is a lesson. Turns defence into opportunity.",
    blurb:"+2 Might, +2 Finesse, +8% crit, +12% riposte & counter.",
    bonus:{ might:2, finesse:2 }, crit:0.08, riposte:0.12, def:2,
    startGear:{ weapon:"katana", armor:"leather_armor" },
},
  duelist: {
    name:"Duel Wielder", emoji:"🗡️", role:"Speed", color:"#ff9a6a",
    desc:"Two blades, twice the cuts. A blur of steel.",
    blurb:"+2 Might, +3 Finesse, +18% attack speed (double strikes).",
    bonus:{ might:2, finesse:3 }, doubleStrike:0.18,
    startGear:{ weapon:"dagger", offhand:"dagger2", armor:"clothes" },
},
  mage: {
    name:"Mage", emoji:"🔮", role:"Magic", color:"#9b59d6",
    desc:"A scholar of the arcane. Bends reality to their will.",
    blurb:"+4 Sorcery, +35 max energy, +12 spell power.",
    bonus:{ sorcery:4 }, energy:35, spell:12,
    startGear:{ weapon:"apprentice_staff", armor:"clothes" },
},
};

const ACTIVE_SKILLS = {

  frenzy:        { name:"Frenzy",        emoji:"😤", cls:"berserker", lvl:1,  cost:8,  cd:5, kind:"buff",  status:"rage",  desc:"Enter a rage: +50% attack for 3 turns." },
  reckless_swing:{ name:"Reckless Swing",emoji:"🪓", cls:"berserker", lvl:3,  cost:12, cd:3, kind:"dmg",   mult:2.1, selfDmg:0.08, desc:"A huge blow that costs you some health." },
  bloodlust:     { name:"Bloodlust",     emoji:"🩸", cls:"berserker", lvl:6,  cost:14, cd:4, kind:"drain", mult:1.4, desc:"Deal damage and heal for half of it." },

  power_strike:  { name:"Power Strike",  emoji:"💪", cls:"warrior", lvl:1,  cost:8,  cd:3, kind:"dmg",   mult:1.7, desc:"A heavy overhead blow." },
  shield_bash:   { name:"Shield Bash",   emoji:"🛡️", cls:"warrior", lvl:4,  cost:9,  cd:4, kind:"stun",  mult:0.8, status:"stun", desc:"Stun the enemy for a turn." },
  rend:          { name:"Rend",          emoji:"🩸", cls:"warrior", lvl:7,  cost:12, cd:4, kind:"dot",   status:"bleed", mult:1.0, desc:"Inflict a bleeding wound." },

  shield_wall:   { name:"Shield Wall",   emoji:"🧱", cls:"defender", lvl:1, cost:8,  cd:5, kind:"buff",  status:"shield", desc:"+50% defence for 3 turns." },
  taunt:         { name:"Taunt",         emoji:"📣", cls:"defender", lvl:4, cost:6,  cd:4, kind:"debuff",status:"weaken", desc:"Weaken the enemy's attacks." },
  bulwark:       { name:"Bulwark",       emoji:"🏰", cls:"defender", lvl:7, cost:14, cd:6, kind:"heal",  mult:1.0, desc:"Mend your wounds and gain Ward." },

  aimed_shot:    { name:"Aimed Shot",    emoji:"🎯", cls:"archer", lvl:1,  cost:9,  cd:3, kind:"dmg",   mult:1.6, alwaysCrit:true, desc:"A guaranteed critical shot." },
  multishot:     { name:"Multishot",     emoji:"🏹", cls:"archer", lvl:5,  cost:16, cd:4, kind:"multi", mult:1.1, desc:"Hit every enemy at once." },
  pinning_shot:  { name:"Pinning Shot",  emoji:"📌", cls:"archer", lvl:7,  cost:12, cd:5, kind:"stun",  mult:0.9, status:"stun", desc:"Pin the enemy in place (stun)." },

  backstab:      { name:"Backstab",      emoji:"🗡️", cls:"thief", lvl:1,  cost:10, cd:3, kind:"dmg",   mult:2.0, alwaysCrit:true, desc:"A devastating strike from the shadows." },
  poison_blade:  { name:"Poison Blade",  emoji:"☠️", cls:"thief", lvl:4,  cost:11, cd:4, kind:"dot",   status:"poison", mult:1.0, desc:"Coat your blade in poison." },
  smoke_bomb:    { name:"Smoke Bomb",    emoji:"💨", cls:"thief", lvl:6,  cost:6,  cd:5, kind:"escape", desc:"Vanish — guaranteed escape." },

  riposte:       { name:"Riposte",       emoji:"↩️", cls:"swordmaster", lvl:1, cost:9, cd:3, kind:"dmg", mult:1.5, desc:"Counter for heavy damage." },
  blade_dance:   { name:"Blade Dance",   emoji:"🌀", cls:"swordmaster", lvl:5, cost:15, cd:4, kind:"multi", mult:1.0, desc:"Strike all enemies in a flowing dance." },
  focus_stance:  { name:"Focus Stance",  emoji:"🎯", cls:"swordmaster", lvl:7, cost:8, cd:5, kind:"buff", status:"focus", desc:"+25% crit for 3 turns." },

  twin_strike:   { name:"Twin Strike",   emoji:"⚡", cls:"duelist", lvl:1, cost:9, cd:3, kind:"dmg", mult:1.9, desc:"Two rapid cuts with both blades." },
  whirlwind:     { name:"Whirlwind",     emoji:"🌪️", cls:"duelist", lvl:5, cost:16, cd:4, kind:"multi", mult:1.05, desc:"Spin through every enemy." },
  parry:         { name:"Parry",         emoji:"✋", cls:"duelist", lvl:7, cost:7, cd:4, kind:"buff", status:"shield", desc:"Deflect blows — +50% defence." },

  fireball:      { name:"Fireball",      emoji:"🔥", cls:"mage", lvl:1, cost:10, cd:0, kind:"dmg", mult:1.3, element:"fire", desc:"Hurl a ball of fire." },
  frost_nova:    { name:"Frost Nova",    emoji:"❄️", cls:"mage", lvl:4, cost:16, cd:4, kind:"stun", mult:1.2, element:"ice", status:"stun", desc:"Ice damage that stuns." },
  arcane_ward:   { name:"Arcane Ward",   emoji:"🔮", cls:"mage", lvl:6, cost:12, cd:5, kind:"buff", status:"shield", desc:"A shield of raw magic." },
  mend:          { name:"Mend",          emoji:"💚", cls:"mage", lvl:3, cost:14, cd:4, kind:"heal", mult:1.4, desc:"Knit your wounds with magic." },
};

const CLASS_MISSIONS = [
  { id:"cm_ber_1", cls:"berserker", name:"Blood Trial",       desc:"Prove your fury by felling 3 Mountain Ogres.", objective:{ type:"kill", target:"ogre", required:3 }, rewards:{ gold:180, xp:220 }, unlocks:["Berserker skill: Bloodlust"], prepare:["Gain ~15 levels and a weapon above 20 attack","Stock 3+ potions — you take self-damage","Fight ogres one at a time in the Iron Peaks"] },
  { id:"cm_ber_2", cls:"berserker", name:"The Unbroken",      desc:"Defeat the Iron Warden alone.", objective:{ type:"kill", target:"warden", required:1 }, rewards:{ gold:400, xp:500, items:{ relic:1 } }, unlocks:["Berserker title: The Unbroken"], prepare:["Reach the Open World first","Get Fire/Ice damage — the Warden resists physical","Bring an Elixir of Might"] },
  { id:"cm_war_1", cls:"warrior", name:"Shield and Sword",  desc:"Clear 4 Bandits from the roads.", objective:{ type:"kill", target:"bandit", required:4 }, rewards:{ gold:150, xp:180 }, unlocks:["Warrior skill: Rend"], prepare:["Upgrade your armour at the Forge","Bandits stun — keep a Defend turn ready"] },
  { id:"cm_war_2", cls:"warrior", name:"The Officer's Oath",desc:"Defeat the Coven Leader.", objective:{ type:"kill", target:"coven", required:1 }, rewards:{ gold:350, xp:450 }, unlocks:["Warrior title: Oathkeeper"], prepare:["Reach the Dark Cave depths","The Coven resists Dark — bring Fire","Full HP and 2+ potions before you enter"] },
  { id:"cm_def_1", cls:"defender", name:"Hold the Line",     desc:"Survive and win 5 battles.", objective:{ type:"wins", target:"any", required:5 }, rewards:{ gold:160, xp:200 }, unlocks:["Defender skill: Bulwark"], prepare:["Build a Barracks for more max HP","Defend when enemies telegraph"] },
  { id:"cm_def_2", cls:"defender", name:"The Last Wall",     desc:"Defeat the Iron Warden.", objective:{ type:"kill", target:"warden", required:1 }, rewards:{ gold:420, xp:520 }, unlocks:["Defender title: Bulwark"], prepare:["Use Shield Wall before its Sunder","Bring an Antidote for the Tremor stun"] },
  { id:"cm_arc_1", cls:"archer", name:"Silent Kill",         desc:"Hunt 4 Cave Spiders.", objective:{ type:"kill", target:"spider", required:4 }, rewards:{ gold:150, xp:180 }, unlocks:["Archer skill: Pinning Shot"], prepare:["Spiders poison — carry an Antidote","Fire damage burns them quickly"] },
  { id:"cm_arc_2", cls:"archer", name:"The Long Shot",       desc:"Defeat a Rogue Mage.", objective:{ type:"kill", target:"rogue_mage", required:1 }, rewards:{ gold:220, xp:280 }, unlocks:["Archer title: Deadeye"], prepare:["Rogue Mages weaken you — burst them down","Bring energy draughts for Aimed Shot"] },
  { id:"cm_thi_1", cls:"thief", name:"Light Fingers",        desc:"Commit 8 crimes without dying.", objective:{ type:"crimes", target:"any", required:8 }, rewards:{ gold:200, xp:200 }, unlocks:["Thief skill: Smoke Bomb"], prepare:["Raise Stealth — it drives crime success","Lay Low (50g) to cool Heat between jobs"] },
  { id:"cm_thi_2", cls:"thief", name:"The Big Score",        desc:"Pull off 3 successful heists.", objective:{ type:"heists", target:"any", required:3 }, rewards:{ gold:500, xp:400 }, unlocks:["Thief title: King of Shadows"], prepare:["Reach 8+ nerve — heists cost a lot","Higher guild renown improves odds"] },
  { id:"cm_swm_1", cls:"swordmaster", name:"First Form",     desc:"Win 3 duels against Bandits.", objective:{ type:"kill", target:"bandit", required:3 }, rewards:{ gold:170, xp:190 }, unlocks:["Swordmaster skill: Blade Dance"], prepare:["Riposte rewards patience — Defend then strike","Upgrade your blade to +2"] },
  { id:"cm_swm_2", cls:"swordmaster", name:"The Perfect Cut",desc:"Defeat the Coven Leader with technique.", objective:{ type:"kill", target:"coven", required:1 }, rewards:{ gold:380, xp:470 }, unlocks:["Swordmaster title: Grandmaster"], prepare:["Focus Stance before your burst","Bring Fire — the Coven resists Dark"] },
  { id:"cm_due_1", cls:"duelist", name:"Two Blades",         desc:"Defeat 5 enemies.", objective:{ type:"wins", target:"any", required:5 }, rewards:{ gold:160, xp:190 }, unlocks:["Duelist skill: Whirlwind"], prepare:["Whirlwind is best with 2+ enemies","Upgrade both weapons for double-strike damage"] },
  { id:"cm_due_2", cls:"duelist", name:"The Storm",          desc:"Clear the Sunken Ruins halls 3 times.", objective:{ type:"kill", target:"wraith", required:3 }, rewards:{ gold:340, xp:420 }, unlocks:["Duelist title: The Storm"], prepare:["Wraiths resist physical — bring Ice/Fire","Buy Swift Boots to escape when low"] },
  { id:"cm_mag_1", cls:"mage", name:"First Spark",           desc:"Defeat 4 enemies with magic.", objective:{ type:"magicKills", target:"any", required:4 }, rewards:{ gold:170, xp:200 }, unlocks:["Mage skill: Arcane Ward"], prepare:["Raise Sorcery and Magic skills","Carry Energy Draughts"] },
  { id:"cm_mag_2", cls:"mage", name:"The Archon",            desc:"Defeat the Iron Warden with magic.", objective:{ type:"kill", target:"warden", required:1 }, rewards:{ gold:400, xp:520 }, unlocks:["Mage title: Archon"], prepare:["Frost Nova stuns — use it before Sunder","The Warden is weak to Ice"] },
];

Object.assign(window.Game, { CLASSES, ACTIVE_SKILLS, CLASS_MISSIONS });
