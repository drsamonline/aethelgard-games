
"use strict";
window.Game = window.Game || {};

const GEAR = {

  dagger:       { name:"Rusty Dagger",  slot:"weapon", emoji:"🗡️", atk:3,  tier:1 },
  hand_axe:     { name:"Hand Axe",      slot:"weapon", emoji:"🪓", atk:8,  tier:1, cost:{ wood:3, iron:2 } },
  hunting_bow:  { name:"Hunting Bow",   slot:"weapon", emoji:"🏹", atk:9,  tier:1, cost:{ wood:5, leather:2 } },
  apprentice_staff:{ name:"Apprentice Staff", slot:"weapon", emoji:"🪄", atk:4, spell:8, tier:1, cost:{ wood:4, ruby:1 } },
  mace:         { name:"Iron Mace",     slot:"weapon", emoji:"🔨", atk:12, tier:2, cost:{ iron:5, wood:1 } },
  katana:       { name:"Folded Katana", slot:"weapon", emoji:"🤺", atk:14, tier:2, cost:{ iron:6, wood:2 } },
  steel_sword:  { name:"Steel Sword",   slot:"weapon", emoji:"⚔️", atk:13, tier:2, cost:{ iron:5, wood:2 } },
  twin_dagger:  { name:"Twin Daggers",  slot:"weapon", emoji:"🗡️", atk:11, tier:2, crit:0.06, cost:{ iron:4, leather:2 } },
  runic_blade:  { name:"Runic Blade",   slot:"weapon", emoji:"🗡️", atk:26, spell:6, tier:3, cost:{ iron:8, ruby:2 } },
  arcane_staff: { name:"Arcane Staff",  slot:"weapon", emoji:"🔮", atk:10, spell:22, tier:3, cost:{ wood:6, ruby:3 } },
  dragonfang:   { name:"Dragonfang",    slot:"weapon", emoji:"🐉", atk:44, tier:4, cost:{ iron:14, ruby:5, relic:1 } },

  dagger2:      { name:"Parrying Dagger", slot:"offhand", emoji:"🗡️", atk:5, def:2, tier:1, cost:{ iron:3, leather:1 } },
  tower_shield: { name:"Tower Shield",  slot:"offhand", emoji:"🛡️", def:10, tier:2, cost:{ iron:6, wood:2 } },
  buckler:      { name:"Buckler",       slot:"offhand", emoji:"🛡️", def:5, flee:0.05, tier:1, cost:{ iron:3, leather:1 } },
  spell_tome:   { name:"Spell Tome",    slot:"offhand", emoji:"📕", spell:12, tier:3, cost:{ leather:4, ruby:2 } },

  clothes:      { name:"Tattered Clothes", slot:"armor", emoji:"👕", def:0, tier:1 },
  leather_armor:{ name:"Leather Armor", slot:"armor", emoji:"🛡️", def:7, tier:2, cost:{ leather:5 } },
  iron_plate:   { name:"Iron Plate",    slot:"armor", emoji:"🥋", def:16, tier:3, cost:{ iron:9, leather:3 } },
  dragonscale:  { name:"Dragonscale",   slot:"armor", emoji:"🐲", def:30, tier:4, cost:{ iron:12, leather:6, ruby:3 } },
  robe:         { name:"Arcane Robe",   slot:"armor", emoji:"🧥", def:8, spell:8, tier:3, cost:{ leather:5, ruby:2 } },

  iron_helm:    { name:"Iron Helm",     slot:"helmet", emoji:"⛑️", def:5, tier:2, cost:{ iron:4, leather:1 } },
  hood:         { name:"Shadow Hood",   slot:"helmet", emoji:"🧢", def:2, crit:0.05, tier:2, cost:{ leather:3 } },
  circlet:      { name:"Arcane Circlet",slot:"helmet", emoji:"👑", spell:7, tier:3, cost:{ ruby:2, iron:2 } },

  swift_boots:  { name:"Swift Boots",   slot:"boots", emoji:"👢", flee:0.08, def:2, tier:2, cost:{ leather:3, wood:1 } },
  plated_boots: { name:"Plated Boots",  slot:"boots", emoji:"🥾", def:6, tier:3, cost:{ iron:5, leather:2 } },

  ruby_ring:    { name:"Ruby Ring",     slot:"ring", emoji:"💍", spell:9, tier:2, cost:{ ruby:1, iron:2 } },
  signet:       { name:"Warlord's Signet", slot:"ring", emoji:"💍", atk:7, tier:3, cost:{ ruby:2, ore:2 } },

  arcane_amulet:{ name:"Arcane Amulet", slot:"amulet", emoji:"📿", spell:16, tier:3, cost:{ ruby:3, iron:3 } },
  guardian_amulet:{ name:"Guardian Amulet", slot:"amulet", emoji:"📿", def:9, hp:30, tier:3, cost:{ ruby:2, ore:2 } },
};

const CONSUMABLE_RECIPES = {
  potion:   { name:"Health Potion",  emoji:"🧪", cost:{ wood:1, leather:1 } },
  ether:    { name:"Energy Draught", emoji:"⚗️", cost:{ ruby:1, food:1 } },
  antidote: { name:"Antidote",       emoji:"🧴", cost:{ leather:1, herb:1 } },
  elixir:   { name:"Elixir of Might",emoji:"🧪", cost:{ herb:2, ruby:1 } },
  meal:     { name:"Hearty Meal",    emoji:"🍲", cost:{ food:2, fish:1 } },
  lockpick: { name:"Lockpick",       emoji:"🗝️", cost:{ iron:1 } },
};

Object.assign(window.Game, { GEAR, CONSUMABLE_RECIPES });
