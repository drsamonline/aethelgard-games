
"use strict";
window.Game = window.Game || {};

const GEMS = {
  ruby:     { name:"Ruby",     emoji:"🔴", stat:"fire",      val:0.15, desc:"+15% fire damage" },
  sapphire: { name:"Sapphire", emoji:"🔵", stat:"ice",       val:0.15, desc:"+15% ice damage" },
  emerald:  { name:"Emerald",  emoji:"🟢", stat:"poison",    val:0.15, desc:"+15% poison damage" },
  topaz:    { name:"Topaz",    emoji:"🟡", stat:"crit",      val:0.05, desc:"+5% crit chance" },
  amethyst: { name:"Amethyst", emoji:"🟣", stat:"spell",     val:8,    desc:"+8 spell power" },
  diamond:  { name:"Diamond",  emoji:"💠", stat:"def",       val:7,    desc:"+7 defence" },
  onyx:     { name:"Onyx",     emoji:"⚫", stat:"lifesteal", val:0.06, desc:"+6% lifesteal" },
};

const SOCKETS_BY_RARITY = { common:0, rare:1, epic:1, legendary:2, mythic:2 };
const GEM_COST = { gold:60, ruby:1 };

const GEAR_SETS = {
  ironclad: { name:"Ironclad",   emoji:"🛡️", pieces:["iron_plate","iron_helm","plated_boots"],
              b2:{ def:6 }, b3:{ hp:60 }, desc:"+6 defence · +60 max HP" },
  shadow:   { name:"Shadow",     emoji:"🌑", pieces:["hood","swift_boots","twin_dagger"],
              b2:{ crit:0.06 }, b3:{ flee:0.10, crime:0.15 }, desc:"+6% crit · +10% escape, +15% crime" },
  arcane:   { name:"Arcane",     emoji:"🔮", pieces:["robe","circlet","arcane_staff","arcane_amulet"],
              b2:{ spell:10 }, b3:{ energy:25 }, desc:"+10 spell · +25 max energy" },
  dragon:   { name:"Dragonscale",emoji:"🐲", pieces:["dragonscale","dragonfang","guardian_amulet"],
              b2:{ def:8 }, b3:{ atk:12, hp:50 }, desc:"+8 defence · +12 attack, +50 max HP" },
  duelist:  { name:"Duelist",    emoji:"⚔️", pieces:["katana","dagger2","buckler"],
              b2:{ crit:0.05 }, b3:{ atk:8 }, desc:"+5% crit · +8 attack" },
};

Object.assign(window.Game, { GEMS, SOCKETS_BY_RARITY, GEM_COST, GEAR_SETS });
