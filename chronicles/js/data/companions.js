
"use strict";
window.Game = window.Game || {};

const COMPANIONS = [
  { id:"bryn",  name:"Bryn the Bulwark", emoji:"🛡️", role:"Guardian",
    desc:"A stoic ex-soldier who never left a comrade behind.",
    perk:"Intercepts blows and shields you each round.",
    atk:0.65, hpMult:1.5, def:8, behaviour:"guard",
    recruit:{ rep:{ oakhaven:15 } }, cost:{ gold:0 },
    quip:"Stand behind me." },
  { id:"sylva", name:"Sylva Nightthorn", emoji:"🏹", role:"Ranger",
    desc:"An elf scout who speaks more to wolves than to people.",
    perk:"Strikes a random enemy every round and marks it.",
    atk:1.0, hpMult:0.9, crit:0.15, behaviour:"strike",
    recruit:{ level:6 }, cost:{ gold:120 },
    quip:"The wilds are watching." },
  { id:"mordecai", name:"Mordecai Ash", emoji:"🔮", role:"Warlock",
    desc:"A disgraced mage who bargained with something old.",
    perk:"Casts dark bolts that weaken the target.",
    atk:0.9, hpMult:0.8, spell:1.0, behaviour:"hex",
    recruit:{ flag:"coven_choice=purge" }, cost:{ gold:200 },
    quip:"Everything has a price." },
  { id:"pip",  name:"Pip", emoji:"🎭", role:"Cutpurse",
    desc:"A cheerful thief who insists he's only borrowing.",
    perk:"Steals gold from enemies mid-fight and improves your loot.",
    atk:0.8, hpMult:0.7, crime:0.2, behaviour:"steal",
    recruit:{ flag:"road_choice=fence" }, cost:{ gold:80 },
    quip:"Hands where I can see 'em!" },
  { id:"sister_maeve", name:"Sister Maeve", emoji:"✨", role:"Cleric",
    desc:"A temple healer who follows the wounded wherever they go.",
    perk:"Heals you when you fall below half health.",
    atk:0.4, hpMult:1.1, behaviour:"heal",
    recruit:{ rep:{ oakhaven:40 } }, cost:{ gold:150 },
    quip:"Hold still. This will sting." },
];

const NPCS = {
  oakhaven: [
    { id:"captain", name:"Captain Rodrik", emoji:"💂", lines:[
      "Keep your blade sharp, wanderer. The Mire breeds monsters.",
      "The Coven grows bolder each night. We need people like you." ],
      options:[ {label:"Ask about the Coven", action:"npcRumour"}, {label:"Ask for work", action:"npcBounty"}, {label:"Leave", action:"npcNone"} ] },
    { id:"smith", name:"Dagna the Smith", emoji:"🔨", lines:[
      "Bring me iron and I'll bring you steel.",
      "A weapon is only as good as the hand that swings it." ],
      options:[ {label:"Open the Forge", action:"npcForge"}, {label:"Enchant my gear", action:"npcEnchant"}, {label:"Leave", action:"npcNone"} ] },
    { id:"innkeep", name:"Innkeep Marta", emoji:"🍺", lines:[
      "Ale's warm, beds are warmer, and rumours are cheapest of all.",
      "You look like you've been sleeping in a ditch." ],
      options:[ {label:"Rest (25g)", action:"npcRest"}, {label:"Buy a rumour (15g)", action:"npcRumour"}, {label:"Leave", action:"npcNone"} ] },
],
  temple: [
    { id:"priest", name:"Father Anselm", emoji:"🙏", lines:[
      "The light mends what steel cannot.",
      "Gold given freely returns threefold, they say." ],
      options:[ {label:"Pray (40g)", action:"npcPray"}, {label:"Leave", action:"npcNone"} ] },
],
  mire: [
    { id:"hermit", name:"The Mire Hermit", emoji:"🧙", lines:[
      "I know the Mire's secrets. They cost herbs, not gold.",
      "The bog keeps what it takes." ],
      options:[ {label:"Trade herbs for a secret", action:"npcHermit"}, {label:"Leave", action:"npcNone"} ] },
],
  banditcamp: [
    { id:"fence", name:"The Fence", emoji:"🎭", lines:[
      "No names, no questions, no refunds.",
      "Relics move fast around here. So do knives." ],
      options:[ {label:"Trade contraband", action:"npcBlack"}, {label:"Leave", action:"npcNone"} ] },
],
};

const ENDLESS_MODS = {
  enraged:  { name:"Enraged",  emoji:"🔺", desc:"Enemies deal +25% damage.", atk:1.25 },
  armored:  { name:"Armoured", emoji:"🛡", desc:"Enemies have +40% defence.", def:1.4 },
  swarm:    { name:"Swarm",    emoji:"🐝", desc:"Extra enemies in every fight.", extra:1 },
  venomous: { name:"Venomous", emoji:"☠️", desc:"Every enemy hit can poison you.", onHit:"poison" },
  fog:      { name:"Choking Fog", emoji:"🌫️", desc:"Healing is halved.", healMult:0.5 },
  greedy:   { name:"Greedy",   emoji:"💰", desc:"Double gold, but tougher foes.", gold:2.0, atk:1.1 },
  cursed:   { name:"Cursed",   emoji:"⛓️", desc:"You cannot flee.", noFlee:true },
  elite:    { name:"Elite Ranks", emoji:"⭐", desc:"All enemies are elite.", allElite:true },
};
const ENDLESS_FLOOR_POOL = ["bat","spider","ghoul","harpy","wraith","golem","bandit","ogre","rogue_mage","wyvern","assassin"];

const ENDINGS = [
  { id:"warden_free",  name:"The Land Breathes", emoji:"🌅", when:{ flag:"warden_choice=free" },
    text:"You shattered the Warden's seal and walked away from its power. Oakhaven's bells ring for a hero who wanted nothing in return." },
  { id:"warden_claim", name:"The New Colossus",  emoji:"🗿", when:{ flag:"warden_choice=claim" },
    text:"You took the Warden's strength into yourself. The land is safe — but something ancient now looks out through your eyes." },
  { id:"mercy",        name:"The Merciful Blade",emoji:"🕊️", when:{ flag:"coven_choice=mercy" },
    text:"You spared the coven's prisoners, and they carried your name across every village. Mercy, it turns out, is a kind of power too." },
  { id:"purge",        name:"Ash and Iron",      emoji:"🔥", when:{ flag:"coven_choice=purge" },
    text:"You burned the coven to its roots. Nothing evil survived — and nothing else did either. The survivors speak of you in whispers." },
  { id:"shadow",       name:"King of Shadows",   emoji:"🎭", when:{ crimes:15 },
    text:"You ended the age of monsters and began an age of something subtler. The guild knows your name. So does every locked door in Aethelgard." },
  { id:"legend",       name:"Chronicles of Fate",emoji:"⭐", when:{},
    text:"You were Fateless when you woke in the Mire. Now the bards argue over which of your deeds to sing first. The land is yours, and so is the story." },
];

Object.assign(window.Game, { COMPANIONS, NPCS, ENDLESS_MODS, ENDLESS_FLOOR_POOL, ENDINGS });
