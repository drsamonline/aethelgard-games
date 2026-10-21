
"use strict";
window.Game = window.Game || {};

const ACTIVITIES = {
  fishing:  { name:"Fishing",      emoji:"🎣", zone:"mire",       cost:{ energy:8 },  desc:"Cast a line in the shallows for fish." },
  foraging: { name:"Foraging",     emoji:"🌿", zone:"mire",       cost:{ energy:6 },  desc:"Search the undergrowth for herbs." },
  farming:  { name:"Farming",      emoji:"🌾", zone:"oakhaven",   cost:{ energy:5 },  desc:"Tend your fields for food and coin." },
  gambling: { name:"Dice Den",     emoji:"🎲", zone:"oakhaven",   cost:{ gold:20 },   desc:"Wager gold on a roll of the bones." },
  arena:    { name:"The Arena",    emoji:"🏟️", zone:"oakhaven",   cost:{ energy:15 }, desc:"Fight waves of foes for glory and gold." },
  cooking:  { name:"Cooking",      emoji:"🍳", zone:"oakhaven",   cost:{ energy:4 },  desc:"Turn fish and food into hearty meals." },
  tavern:   { name:"Tavern Rumours",emoji:"🍺",zone:"oakhaven",   cost:{ gold:15 },   desc:"Buy a round and learn something useful." },
  bounty:   { name:"Bounty Board", emoji:"📜", zone:"oakhaven",   cost:{},            desc:"Take on paid bounties for coin and renown." },
  mining:   { name:"Mining",       emoji:"⛏️", zone:"mountains",  cost:{ energy:8 },  desc:"Break ore from the Iron Peaks." },
  prospect: { name:"Prospecting",  emoji:"💠", zone:"mountains",  cost:{ energy:12 }, desc:"Search for gems in the deep seams." },
  woodcut:  { name:"Woodcutting",  emoji:"🪵", zone:"mire",       cost:{ energy:5 },  desc:"Fell timber for building and crafting." },
  pray:     { name:"Pray",         emoji:"🙏", zone:"temple",     cost:{ gold:40 },   desc:"Offer gold for a full restoration." },
};

const ARENA_WAVES = [
  { name:"Novice Bracket",  enemies:["rat","rat"],           reward:{ gold:40, xp:40 } },
  { name:"Soldier Bracket", enemies:["goblin","wolf"],       reward:{ gold:70, xp:70 } },
  { name:"Veteran Bracket", enemies:["bandit","spider"],     reward:{ gold:110, xp:120 } },
  { name:"Champion Bracket",enemies:["ogre","harpy"],        reward:{ gold:180, xp:200 } },
  { name:"Grand Champion",  enemies:["wyvern","assassin"],   reward:{ gold:300, xp:350 } },
];

const TAVERN_RUMOURS = [
  "They say the Coven Leader fears fire above all else.",
  "A merchant near the Ruins sells relics cheap if you know the password.",
  "The Iron Warden's plates crack under ice — a mage's trick.",
  "Spider venom can be cured with a simple antidote of herb and leather.",
  "Bandits never attack anyone with a full purse and an empty head — carry less.",
  "The Arena pays double if you never flee a wave.",
  "There's a hidden strongbox beneath the old shrine in the Mire.",
  "Night makes monsters bolder — and loot richer.",
  "Ogres telegraph their crushing blow. Guard, then strike.",
  "The fence in the Underworld buys relics for a hundred and more.",
];

Object.assign(window.Game, { ACTIVITIES, ARENA_WAVES, TAVERN_RUMOURS });
