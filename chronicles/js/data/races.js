
"use strict";
window.Game = window.Game || {};

const RACES = {
  human: {
    name:"Human", emoji:"🧑", desc:"Ambitious and adaptable. At home anywhere.",
    perk:"+1 to every attribute, +10% experience gained.",
    bonus:{ might:1, finesse:1, sorcery:1, vitality:1 }, xpMult:1.10,
},
  elf: {
    name:"Elf", emoji:"🧝", desc:"Ancient, keen-eyed folk of the deep woods.",
    perk:"+3 Finesse, +8% crit, sees clearly at night (less night penalty).",
    bonus:{ finesse:3, sorcery:1 }, crit:0.08, nightEase:true,
},
  dwarf: {
    name:"Dwarf", emoji:"🧔", desc:"Stone-hard and stubborn, born of the mountains.",
    perk:"+3 Vitality, +4 defence, gathers more ore and gems.",
    bonus:{ vitality:3, might:1 }, def:4, mineBonus:true,
},
  orc: {
    name:"Orc", emoji:"👹", desc:"Ferocious raiders with tusks and iron will.",
    perk:"+4 Might, +25 max HP, but −2 Finesse.",
    bonus:{ might:4, vitality:2, finesse:-2 }, hp:25,
},
  halfling: {
    name:"Halfling", emoji:"🧒", desc:"Small, quick and light-fingered.",
    perk:"+3 Finesse, +12% escape, +10% crime success.",
    bonus:{ finesse:3, vitality:-1 }, flee:0.12, crime:0.10,
},
  tiefling: {
    name:"Tiefling", emoji:"😈", desc:"Infernal blood runs hot in their veins.",
    perk:"+3 Sorcery, +20% fire resistance, +15 max energy.",
    bonus:{ sorcery:3 }, fireResist:0.2, energy:15,
},
  beastkin: {
    name:"Beastkin", emoji:"🐯", desc:"Cat-folk hunters with sharp instincts.",
    perk:"+2 Finesse, +2 Might, +8% crit, +8% escape.",
    bonus:{ finesse:2, might:2 }, crit:0.08, flee:0.08,
},
  revenant: {
    name:"Revenant", emoji:"💀", desc:"The risen dead, clinging to purpose.",
    perk:"+3 Vitality, +25% dark resistance, drains life on hit (+6% lifesteal).",
    bonus:{ vitality:3, sorcery:1 }, darkResist:0.25, lifesteal:0.06,
},
};

const GENDERS = {
  male:   { name:"Male",       emoji:"♂" },
  female: { name:"Female",     emoji:"♀" },
  nb:     { name:"Non-binary", emoji:"⚧" },
};

Object.assign(window.Game, { RACES, GENDERS });
