
"use strict";
window.Game = window.Game || {};

const REACTIONS = [
  { id:"detonate",   name:"Detonate",          emoji:"💥", element:"fire",     status:"poison", mult:2.0, aoe:true,  msg:"the poison ignites" },
  { id:"thermal",    name:"Thermal Shock",     emoji:"🌡️", element:"ice",      status:"burn",   mult:1.8, apply:"stun", msg:"steam and shock" },
  { id:"shatter",    name:"Shatter",           emoji:"🔨", element:"physical", status:"stun",   mult:2.0, msg:"the stunned form shatters" },
  { id:"hemorrhage", name:"Toxic Hemorrhage",  emoji:"🩸", element:"poison",   status:"bleed",  mult:1.6, extend:true, msg:"the open wound festers" },
  { id:"soulrend",   name:"Soul Rend",         emoji:"👻", element:"dark",     status:"weaken", mult:1.7, drain:0.3, msg:"the weakened soul is torn" },
  { id:"purge",      name:"Radiant Purge",     emoji:"✨", element:"light",    status:"burn",   mult:1.6, cleanse:true, msg:"light scours the burning flesh" },
];

const ULTIMATES = {
  berserker:   { name:"Rampage",       emoji:"🌋", kind:"multi",  hits:4, mult:0.9, desc:"Four furious strikes across all enemies." },
  warrior:     { name:"Bladestorm",    emoji:"🌪️", kind:"multi",  mult:1.7, desc:"A whirlwind of steel on every enemy." },
  defender:    { name:"Aegis",         emoji:"🛡️", kind:"guard",  desc:"Full heal, Ward, and reduced damage for 3 turns." },
  archer:      { name:"Rain of Arrows",emoji:"🏹", kind:"multi",  mult:1.8, crit:true, desc:"A devastating volley on all enemies." },
  thief:       { name:"Assassinate",   emoji:"🗡️", kind:"single", mult:4.5, crit:true, desc:"An execution strike on your target." },
  swordmaster: { name:"Perfect Form",  emoji:"🤺", kind:"multi",  hits:3, mult:1.3, crit:true, desc:"Three flawless strikes." },
  duelist:     { name:"Tempest",       emoji:"⚡", kind:"multi",  hits:6, mult:0.7, desc:"Six rapid cuts across every enemy." },
  mage:        { name:"Meteor",        emoji:"☄️", kind:"multi",  mult:2.2, element:"fire", desc:"Call fire down on every enemy." },
};

const ELITE_AFFIXES = {
  armored:  { name:"Armoured", emoji:"🛡", def:0.6,  hp:0.25 },
  swift:    { name:"Swift",    emoji:"💨", dodge:0.2, atk:0.10 },
  venomous: { name:"Venomous", emoji:"☠️", onHit:"poison" },
  berserk:  { name:"Berserk",  emoji:"🔺", lowHpRage:true },
  vampiric: { name:"Vampiric", emoji:"🩸", drain:0.30 },
  warded:   { name:"Warded",   emoji:"🔮", startShield:true },
  greedy:   { name:"Greedy",   emoji:"🍀", gold:0.6, drop:0.15 },
};

Object.assign(window.Game, { REACTIONS, ULTIMATES, ELITE_AFFIXES });
