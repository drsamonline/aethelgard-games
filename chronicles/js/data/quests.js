
"use strict";
window.Game = window.Game || {};

const CHAPTERS = [
  {
    id:1, title:"Chapter I — The Awakening",
    text:"You wake face-down in the Crimson Mire with no memory and no fate of your own. A diseased wolf circles, ribs showing, eyes hungry.",
    objective:{ type:"kill", target:"wolf", required:1, label:"Defeat the Diseased Wolf" },
    rewards:{ gold:60, xp:80 }, unlocks:["Crimson Mire explored"],
    prepare:["Equip your starting weapon","Buy a potion from the Market if you can","Attack every turn — the wolf is weak"],
    choices:[
      { label:"Burn the corpse as a warning", outcome:"You set the wolf alight. The smoke draws a scout from Oakhaven — and wary eyes from the Coven.", effects:{ flags:{ mire_choice:"burn" }, rep:{ oakhaven:8 }, xp:20, unlockSide:["sq_scout"] } },
      { label:"Bury it and move on quietly", outcome:"You give the beast to the earth. No one sees. The Mire keeps your secret.", effects:{ flags:{ mire_choice:"bury" }, rep:{ oakhaven:3, coven:3 }, gold:20, unlockSide:["sq_hermit"] } },
],
},
  {
    id:2, title:"Chapter II — The Long Road",
    text:"Boot-prints lead toward Oakhaven — but goblin scouts have been raiding its outskirts. Clear them from the mire.",
    objective:{ type:"kill", target:"goblin", required:2, label:"Defeat 2 Goblin Scouts" },
    rewards:{ gold:90, xp:140 }, unlocks:["Dark Cave revealed","Iron Peaks revealed"],
    prepare:["Two goblins hit hard early — potions help","Goblins bleed you: carry an Antidote","Hunt them one at a time from the Atlas"],
    choices:[
      { label:"Report to the Oakhaven guard", outcome:"The captain thanks you and opens the town armoury to you.", effects:{ flags:{ road_choice:"guard" }, rep:{ oakhaven:12 }, unlockLoc:["oakhaven_armory"], unlockSide:["sq_militia"] } },
      { label:"Sell the goblin ears to a fence", outcome:"A hooded figure pays well and mentions a guild that values discretion.", effects:{ flags:{ road_choice:"fence" }, gold:80, rep:{ bandits:6 }, unlockSide:["sq_guild_intro"] } },
],
},
  {
    id:3, title:"Chapter III — The Dark Below",
    text:"Oakhaven's elders whisper of the Iron Coven gathering in the Dark Cave. Descend and find where they nest.",
    objective:{ type:"depth", target:"cave", required:3, label:"Reach Depth 3 of the Dark Cave" },
    rewards:{ gold:130, xp:200 }, unlocks:["Dungeon depth rewards","Sunken Ruins rumoured"],
    prepare:["Bring 20+ energy for each descent","Bats drain life — kill them fast","Leave the dungeon to bank your depth progress"],
    choices:[
      { label:"Collapse the tunnel behind you", outcome:"You seal the deeper caves. Fewer monsters — but also fewer riches.", effects:{ flags:{ cave_choice:"seal" }, rep:{ oakhaven:10 }, unlockSide:["sq_seal"] } },
      { label:"Leave it open to explore deeper", outcome:"You keep the way open. The dark below promises treasure and terror alike.", effects:{ flags:{ cave_choice:"open" }, rep:{ coven:8 }, unlockSide:["sq_deep"] } },
],
},
  {
    id:4, title:"Chapter IV — The Coven Leader",
    text:"At the cave's heart stands the Coven Leader, wreathed in sickly green fire. Break the coven and Oakhaven is saved.",
    objective:{ type:"kill", target:"coven", required:1, label:"Defeat the Coven Leader" },
    rewards:{ gold:220, xp:340 }, unlocks:["Sunken Ruins revealed","Bandit Camp revealed"],
    prepare:["The Coven resists Dark — bring Fire damage","It heals via Soul Drain: burst it down","Full HP, 3+ potions, an Elixir of Might"],
    choices:[
      { label:"Spare the coven's prisoners", outcome:"Freed villagers spread word of your mercy across the land.", effects:{ flags:{ coven_choice:"mercy" }, rep:{ oakhaven:20, coven:-5 }, unlockSide:["sq_rescue"] } },
      { label:"Burn the coven to its roots", outcome:"Nothing survives the fire. The Coven is broken utterly — and so is any chance of peace with them.", effects:{ flags:{ coven_choice:"purge" }, rep:{ oakhaven:10, coven:-25 }, gold:120, unlockSide:["sq_purge"] } },
],
},
  {
    id:5, title:"Chapter V — The Iron Warden",
    text:"The coven's fall wakes something older: the Iron Warden, sealed beneath the Sunken Ruins. End it, and the land is truly free.",
    objective:{ type:"kill", target:"warden", required:1, label:"Defeat the Iron Warden" },
    rewards:{ gold:400, xp:600 }, unlocks:["Open World","Endless bounties","Ascension"],
    prepare:["The Warden resists Physical — Ice is its bane","Use Frost Nova / Ice weapons","It stuns with Tremor: keep an Antidote"],
    choices:[
      { label:"Claim the Warden's power", outcome:"Its ancient strength flows into you. Power — and a burden.", effects:{ flags:{ warden_choice:"claim" }, xp:200 } },
      { label:"Shatter it and free the land", outcome:"You break the seal forever. The land breathes. Bards will sing of this.", effects:{ flags:{ warden_choice:"free" }, rep:{ oakhaven:30 }, gold:200 } },
],
},
  {
    id:6, title:"Open World",
    text:"The Warden is still and the land breathes again. Roam freely: take bounties, grow your settlement, plunder the Underworld, and write your own legend.",
    objective:null, rewards:null, unlocks:[], prepare:[],
},
];

const SIDE_QUESTS = [
  { id:"sq_scout", name:"The Scout's Report", desc:"The Oakhaven scout wants proof the Mire is safe — bring 6 leather.", objective:{ type:"gather", target:"leather", required:6 }, rewards:{ gold:70, xp:70 }, unlocks:["Oakhaven reputation"], unlock:{ chapter:2 }, prepare:["Hunt wolves and bandits for leather","Spiders also drop leather"] },
  { id:"sq_hermit", name:"The Mire Hermit", desc:"A hermit trades secrets for herbs. Gather 5 herbs.", objective:{ type:"gather", target:"herb", required:5 }, rewards:{ gold:60, xp:90, items:{ potion:2 } }, unlocks:["Herb foraging knowledge"], unlock:{ chapter:2 }, prepare:["Forage for herbs in the Mire and Ruins","Ghouls drop herbs too"] },
  { id:"sq_militia", name:"Militia Duty", desc:"Train with the militia: win 4 battles.", objective:{ type:"wins", target:"any", required:4 }, rewards:{ gold:90, xp:100 }, unlocks:["Oakhaven armory discount"], unlock:{ flag:"road_choice=guard" }, prepare:["Rest at the inn between fights","Use your class skills, not just Attack"] },
  { id:"sq_guild_intro", name:"A Quiet Word", desc:"The fence wants you to prove discretion: commit 3 crimes.", objective:{ type:"crimes", target:"any", required:3 }, rewards:{ gold:110, xp:90 }, unlocks:["Thieves' guild access"], unlock:{ flag:"road_choice=fence" }, prepare:["Raise Stealth skill first","Pickpocket is safest; lockpicking pays more"] },
  { id:"sq_seal", name:"Seal the Breach", desc:"With the cave sealed, hunt 5 Cave Bats above ground.", objective:{ type:"kill", target:"bat", required:5 }, rewards:{ gold:120, xp:130 }, unlocks:["Bat wing trophy"], unlock:{ flag:"cave_choice=seal" }, prepare:["Bats drain life — kill them in one burst","Fire damage is super-effective"] },
  { id:"sq_deep", name:"Into the Deep", desc:"You kept the way open. Reach Depth 5 of the Dark Cave.", objective:{ type:"depth", target:"cave", required:5 }, rewards:{ gold:200, xp:220, items:{ ruby:1 } }, unlocks:["Deep cave loot tier"], unlock:{ flag:"cave_choice=open" }, prepare:["Each descent costs 20 energy","Bank depth by leaving and re-entering","Bring antidotes for spiders"] },
  { id:"sq_rescue", name:"The Rescued", desc:"A freed villager asks you to clear the roads: defeat 4 bandits.", objective:{ type:"kill", target:"bandit", required:4 }, rewards:{ gold:150, xp:170 }, unlocks:["Villager gratitude (rep)"], unlock:{ flag:"coven_choice=mercy" }, prepare:["Bandits stun with Cheap Shot","Bring 2+ potions"] },
  { id:"sq_purge", name:"Ash and Iron", desc:"The purge continues: defeat 4 Rogue Mages.", objective:{ type:"kill", target:"rogue_mage", required:4 }, rewards:{ gold:190, xp:210, items:{ relic:1 } }, unlocks:["Coven resistance weakened"], unlock:{ flag:"coven_choice=purge" }, prepare:["Rogue Mages weaken you — end it fast","Ice Lance telegraphs: Defend"] },
  { id:"sq_farm", name:"A Humble Start", desc:"Build a Farm in your settlement.", objective:{ type:"build", target:"farm", required:1 }, rewards:{ gold:80, xp:80 }, unlocks:["Farming activity"], unlock:{ chapter:2 }, prepare:["Chop wood in the Crimson Mire","25 wood is enough"] },
  { id:"sq_smith", name:"The Apprentice Smith", desc:"Craft 5 items at the Forge.", objective:{ type:"craft", target:"any", required:5 }, rewards:{ gold:100, xp:120 }, unlocks:["Forge rarity bonus"], unlock:{ chapter:2 }, prepare:["Potions are cheap to craft","Gather wood and leather first"] },
  { id:"sq_angler", name:"Gone Fishing", desc:"Catch 6 fish at the Mire's shallows.", objective:{ type:"fish", target:"any", required:6 }, rewards:{ gold:90, xp:100 }, unlocks:["Cooking activity"], unlock:{ chapter:3 }, prepare:["Travel to the Crimson Mire","Fishing costs energy — rest first"] },
  { id:"sq_arena", name:"Blood and Sand", desc:"Survive 3 Arena waves in Oakhaven.", objective:{ type:"arena", target:"any", required:3 }, rewards:{ gold:200, xp:240 }, unlocks:["Arena champion title"], unlock:{ chapter:3 }, prepare:["Waves grow harder each round","Heal between waves — bring potions"] },
  { id:"sq_hunter", name:"Wanted: Ogre", desc:"The Iron Peaks need clearing: defeat 3 Ogres.", objective:{ type:"kill", target:"ogre", required:3 }, rewards:{ gold:180, xp:200 }, unlocks:["Ogre slayer bounty"], unlock:{ chapter:3 }, prepare:["Ogres resist Fire — use physical or Ice","They telegraph Crushing Blow: Defend"] },
  { id:"sq_explore", name:"Cartographer", desc:"Visit every region of Aethelgard.", objective:{ type:"explore", target:"all", required:7 }, rewards:{ gold:250, xp:300 }, unlocks:["World map complete"], unlock:{ chapter:4 }, prepare:["Unlock regions through the story","Some open only in the Open World"] },
  { id:"sq_relic", name:"Relic Hunter", desc:"Recover 3 Ancient Relics.", objective:{ type:"gather", target:"relic", required:3 }, rewards:{ gold:300, xp:320 }, unlocks:["Relic appraisal"], unlock:{ chapter:5 }, prepare:["Assassins and bosses drop relics","The black market sells them too"] },
  { id:"sq_ascend", name:"Beyond Fate", desc:"Reach level 25.", objective:{ type:"level", target:"any", required:25 }, rewards:{ gold:500, xp:0 }, unlocks:["Ascension available"], unlock:{ chapter:5 }, prepare:["Bounties give steady XP","The Arena is the fastest levelling"] },
];

const BOUNTY_POOL = ["wolf","goblin","spider","bandit","ogre","rogue_mage","wraith","harpy","ghoul"];

Object.assign(window.Game, { CHAPTERS, SIDE_QUESTS, BOUNTY_POOL });
