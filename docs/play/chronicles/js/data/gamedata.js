
"use strict";
window.Game = window.Game || {};

const AUTHOR = "Dr. Sohil Momin";
const GAME_VERSION = 7;

const ELEMENTS = {
  physical:{ name:"Physical", color:"#c9c4dd" },
  fire:    { name:"Fire",     color:"#ff7a45" },
  ice:     { name:"Ice",      color:"#5fc8ff" },
  poison:  { name:"Poison",   color:"#7ad14a" },
  dark:    { name:"Dark",     color:"#b07cff" },
  light:   { name:"Light",    color:"#ffe08a" },
};

const STATUS = {
  bleed:  { name:"Bleed",   emoji:"🩸", kind:"dot", color:"#e8574a", turns:3 },
  poison: { name:"Poison",  emoji:"☠️", kind:"dot", color:"#7ad14a", turns:4 },
  burn:   { name:"Burn",    emoji:"🔥", kind:"dot", color:"#ff7a45", turns:3 },
  stun:   { name:"Stunned", emoji:"💫", kind:"stun", color:"#ffd76a", turns:1 },
  weaken: { name:"Weakened",emoji:"🔻", kind:"mod", atk:-0.3, color:"#9b95b4", turns:3 },
  shield: { name:"Warded",  emoji:"🔮", kind:"mod", def:+0.5, color:"#5fc8ff", turns:3 },
  rage:   { name:"Enraged", emoji:"🔺", kind:"mod", atk:+0.5, color:"#ff7a45", turns:3 },
  regen:  { name:"Regen",   emoji:"💚", kind:"hot", color:"#43c96a", turns:3 },
  focus:  { name:"Focused", emoji:"🎯", kind:"mod", crit:+0.25, color:"#ffe08a", turns:3 },
  mark:   { name:"Marked",  emoji:"🎯", kind:"mod", dmgTaken:+0.25, color:"#ff9a6a", turns:3 },
};

const RARITIES = {
  common:    { name:"Common",    color:"#c9c4dd", mult:1.0, affixes:0 },
  rare:      { name:"Rare",      color:"#5fc8ff", mult:1.15, affixes:1 },
  epic:      { name:"Epic",      color:"#b07cff", mult:1.3,  affixes:2 },
  legendary: { name:"Legendary", color:"#e0b34d", mult:1.5,  affixes:2 },
  mythic:    { name:"Mythic",    color:"#ff7ad0", mult:1.8,  affixes:3 },
};
const AFFIXES = {
  crit:   { name:"of the Fox",     stat:"crit",   val:0.06, fmt:"+6% crit" },
  might:  { name:"of the Bear",    stat:"might",  val:2,    fmt:"+2 might" },
  hp:     { name:"of Vitality",    stat:"hp",     val:22,   fmt:"+22 max HP" },
  spell:  { name:"of the Arcane",  stat:"spell",  val:7,    fmt:"+7 spell power" },
  def:    { name:"of the Wall",    stat:"def",    val:5,    fmt:"+5 defence" },
  gold:   { name:"of Greed",       stat:"gold",   val:0.25, fmt:"+25% gold" },
  energy: { name:"of Endurance",   stat:"energy", val:15,   fmt:"+15 max energy" },
  lifesteal:{name:"of Leeching",   stat:"lifesteal", val:0.08, fmt:"+8% lifesteal" },
};

const DIFFICULTY = {
  story:  { label:"Story",  eAtk:0.7,  eHp:0.75, xp:1.3, gold:1.15 },
  normal: { label:"Normal", eAtk:1.0,  eHp:1.0,  xp:1.0, gold:1.0 },
  hard:   { label:"Hard",   eAtk:1.2,  eHp:1.15, xp:1.2, gold:1.15 },
  brutal: { label:"Brutal", eAtk:1.4,  eHp:1.35, xp:1.5, gold:1.3 },
};

const ITEMS = {
  wood:    { name:"Wood",     emoji:"🪵", material:true, val:10 },
  iron:    { name:"Iron",     emoji:"⛏️", material:true, val:15 },
  leather: { name:"Leather",  emoji:"🟫", material:true, val:12 },
  ruby:    { name:"Ruby",     emoji:"💎", material:true, val:55 },
  food:    { name:"Food",     emoji:"🍞", material:true, val:8 },
  fish:    { name:"Fish",     emoji:"🐟", material:true, val:9 },
  herb:    { name:"Herb",     emoji:"🌿", material:true, val:11 },
  ore:     { name:"Deep Ore", emoji:"🪨", material:true, val:26 },
  relic:   { name:"Stolen Relic", emoji:"🏺", contraband:true, val:110 },
  potion:  { name:"Health Potion", emoji:"🧪", use:"heal",  val:55, price:30 },
  ether:   { name:"Energy Draught", emoji:"⚗️", use:"energy", val:30, price:40 },
  antidote:{ name:"Antidote", emoji:"🧴", use:"cure", price:25 },
  elixir:  { name:"Elixir of Might", emoji:"🧪", use:"buff", buff:"rage", price:60 },
  lockpick:{ name:"Lockpick", emoji:"🗝️", use:"tool" },
  meal:    { name:"Hearty Meal", emoji:"🍲", use:"meal", buff:"regen", price:45 },
  artifact:{ name:"Ancient Artifact", emoji:"🔮", quest:true },
};

const BUILDINGS = {
  farm:     { name:"Farm",     emoji:"🌾", desc:"Grows food each tick.", max:3, cost:{ wood:25 } },
  mine:     { name:"Mine",     emoji:"⛏️", desc:"Produces iron each tick.", max:3, cost:{ wood:35, iron:10 } },
  tavern:   { name:"Tavern",   emoji:"🍺", desc:"Gold and renown; attracts settlers.", max:3, cost:{ wood:40, leather:10 } },
  barracks: { name:"Barracks", emoji:"⚔️", desc:"Trains militia — +8 max HP per level.", max:3, cost:{ wood:45, iron:15 } },
  workshop: { name:"Workshop", emoji:"🔨", desc:"Improves crafting rarity odds.", max:3, cost:{ wood:50, iron:20, leather:10 } },
  market:   { name:"Trade Post",emoji:"⚖️", desc:"Better market prices per level.", max:3, cost:{ wood:55, iron:15, leather:15 } },
  temple:   { name:"Shrine",   emoji:"🛕", desc:"Slow HP regen while you adventure.", max:2, cost:{ wood:40, ruby:1 } },
};

const SLOTS = [["weapon","Weapon"],["offhand","Offhand"],["armor","Armor"],["helmet","Helmet"],["boots","Boots"],["ring","Ring"],["amulet","Amulet"]];

const LOCATIONS = {
  oakhaven:   { name:"Oakhaven",      emoji:"🏘️", safe:true, danger:0, desc:"A walled town. Rest, trade and plan your next move." },
  mire:       { name:"Crimson Mire",  emoji:"🌫️", danger:1, spawns:["wolf","goblin","spider","boar"], desc:"Boggy hunting grounds — timber, wolves and goblins." },
  cave:       { name:"Dark Cave",     emoji:"🕳️", danger:2, desc:"A descending dungeon. Deeper means richer, and deadlier." },
  mountains:  { name:"Iron Peaks",    emoji:"⛰️", danger:2, spawns:["bandit","ogre","harpy","ghoul"], desc:"Ore-rich crags prowled by bandits and ogres." },
  temple:     { name:"Sunken Temple", emoji:"🛕", danger:0, desc:"An old shrine. Offer gold for full restoration." },
  banditcamp: { name:"Bandit Camp",   emoji:"🏕️", danger:3, spawns:["bandit","rogue_mage","assassin"], desc:"A lawless nest of cutthroats and rogue mages." },
  ruins:      { name:"Sunken Ruins",  emoji:"🏛️", danger:3, spawns:["wraith","spider","golem"], desc:"Flooded halls where the wraiths gather." },
  depths:     { name:"The Depths",    emoji:"🕳️", danger:3, desc:"An endless dungeon that reshapes itself on every floor." },
};

const THEMES = {
  dark:     { name:"Dark",          cls:"" },
  midnight: { name:"Midnight Blue", cls:"theme-midnight" },
  light:    { name:"Parchment",     cls:"theme-light" },
  contrast: { name:"High Contrast", cls:"theme-contrast" },
};

Object.assign(window.Game, { AUTHOR, GAME_VERSION, ELEMENTS, STATUS, RARITIES, AFFIXES, DIFFICULTY, ITEMS, BUILDINGS, SLOTS, LOCATIONS, THEMES });
