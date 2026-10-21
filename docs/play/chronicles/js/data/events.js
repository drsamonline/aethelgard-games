
"use strict";
window.Game = window.Game || {};

const WORLD_EVENTS = [
  { id:"ambush",   weight:20, emoji:"⚔️", title:"Ambush!",             text:"Figures rise from the roadside brush.", choices:[{label:"Fight", action:"eventFight"},{label:"Try to slip away", action:"eventFlee"}] },
  { id:"merchant", weight:16, emoji:"🧳", title:"Wandering Merchant",   text:"A hooded trader offers cut-price goods.", choices:[{label:"Buy a potion (20g)", action:"eventBuyPotion"},{label:"Buy 2 iron (10g)", action:"eventBuyIron"},{label:"Move on", action:"eventNone"}] },
  { id:"shrine",   weight:13, emoji:"✨", title:"Wayside Shrine",       text:"A weathered idol hums with quiet power.", choices:[{label:"Pray for might", action:"eventBlessMight"},{label:"Pray for health", action:"eventBlessHp"},{label:"Move on", action:"eventNone"}] },
  { id:"cache",    weight:14, emoji:"📦", title:"Hidden Cache",         text:"A buried chest, half-rotted but intact.", choices:[{label:"Open it", action:"eventCache"},{label:"Leave it", action:"eventNone"}] },
  { id:"traveller",weight:12, emoji:"🧎", title:"Injured Traveller",    text:"A wounded traveller begs for help.", choices:[{label:"Bandage them (−10g)", action:"eventHelp"},{label:"Walk on", action:"eventNone"}] },
  { id:"thief",    weight:12, emoji:"🎭", title:"Cutpurse",             text:"A pickpocket brushes past you.", choices:[{label:"Catch them", action:"eventCatch"},{label:"Let it go", action:"eventNone"}] },
  { id:"caravan",  weight:10, emoji:"🐫", title:"Trade Caravan",        text:"A caravan master offers a wager on his goods.", choices:[{label:"Invest 40g", action:"eventCaravan"},{label:"Decline", action:"eventNone"}] },
  { id:"duel",     weight:9,  emoji:"🤺", title:"A Challenge",          text:"A wandering duelist challenges you for coin.", choices:[{label:"Accept the duel", action:"eventDuel"},{label:"Refuse", action:"eventNone"}] },
];

const SPONTANEOUS_EVENTS = [
  { id:"sp_treasure", weight:12, emoji:"💰", title:"Buried Treasure", text:"Your foot strikes something hollow — a buried strongbox!", action:"eventTreasure" },
  { id:"sp_meteor",   weight:8,  emoji:"☄️", title:"Meteor Shower",    text:"A burning streak splits the sky. Shards of strange ore scatter nearby.", action:"eventMeteor" },
  { id:"sp_boon",     weight:9,  emoji:"🌟", title:"A Moment of Clarity", text:"The air stills. Power gathers in your hands.", action:"eventBoon" },
  { id:"sp_plague",   weight:7,  emoji:"🦟", title:"Swarm of Flies",   text:"A buzzing swarm descends, biting and stinging.", action:"eventPlague" },
  { id:"sp_rumor",    weight:10, emoji:"🗣️", title:"Tavern Rumour",    text:"A drunkard swears he saw treasure near the Ruins.", action:"eventRumor" },
  { id:"sp_gift",     weight:9,  emoji:"🎁", title:"Grateful Stranger",text:"Someone you helped once leaves a gift at your camp.", action:"eventGift" },
  { id:"sp_storm",    weight:7,  emoji:"⛈️", title:"Violent Storm",    text:"Lightning hammers the hills. You take shelter — and lose time.", action:"eventStorm" },
  { id:"sp_raid",     weight:6,  emoji:"🔥", title:"Raiders!",         text:"Smoke on the horizon — bandits are raiding your settlement!", action:"eventRaid" },
  { id:"sp_assassin", weight:7,  emoji:"🥷", title:"Assassin!",        text:"A shadow peels off the wall and lunges for your throat!", action:"eventAmbush" },
  { id:"sp_windfall", weight:8,  emoji:"🪙", title:"Windfall",         text:"You stumble on a forgotten coin purse.", action:"eventWindfall" },
];

Object.assign(window.Game, { WORLD_EVENTS, SPONTANEOUS_EVENTS });
