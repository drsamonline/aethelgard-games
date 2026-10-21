
"use strict";
window.Game = window.Game || {};

const I18N = {
  en: {
    "ui.game":"Game",
    "ui.edition":"Choose your edition","ui.chooseslot":"Choose a save slot","ui.startdesc":"Eight classes, eight races, a branching story, and a world that remembers your choices.",
    "nav.story":"Story","nav.hero":"Hero","nav.skills":"Skills","nav.atlas":"Atlas","nav.home":"Home",
    "nav.forge":"Forge","nav.market":"Market","nav.underworld":"Underworld","nav.codex":"Codex",
    "nav.inventory":"Bag","nav.wiki":"Wiki","nav.notify":"Alerts",
    "ui.level":"Level","ui.gold":"Gold","ui.attack":"Attack","ui.defend":"Defend","ui.flee":"Flee",
    "ui.potion":"Potion","ui.buy":"Buy","ui.sell":"Sell","ui.craft":"Craft","ui.upgrade":"Upgrade",
    "ui.rest":"Rest","ui.travel":"Travel","ui.here":"Here","ui.locked":"Locked","ui.questlog":"Quest Log",
    "ui.journal":"Journal","ui.victory":"Victory!","ui.defeat":"Defeat","ui.newgame":"New Game",
    "ui.continue":"Continue","ui.menu":"Menu & Save","ui.close":"Close","ui.settings":"Settings",
    "ui.language":"Language","ui.sound":"Sound","ui.difficulty":"Difficulty","ui.progress":"Progress",
    "ui.reward":"Reward","ui.rewards":"Rewards","ui.unlocks":"Unlocks","ui.objectives":"Objectives",
    "ui.complete":"Complete","ui.empty":"Nothing here yet.","ui.inventory":"Inventory","ui.bag":"Bag",
    "ui.equipment":"Equipment","ui.attributes":"Attributes","ui.stats":"Statistics","ui.achievements":"Achievements",
    "ui.reputation":"Reputation","ui.class":"Class","ui.energy":"Energy","ui.nerve":"Nerve","ui.hp":"Health",
    "ui.confirm":"Confirm","ui.cancel":"Cancel","ui.tagline":"Chronicles of Fate","ui.credit":"Created by",
    "ui.ascend":"Ascend","ui.save":"Save","ui.slots":"Save Slots","ui.play":"Play","ui.delete":"Delete",
    "ui.name":"Name","ui.race":"Race","ui.gender":"Gender","ui.create":"Create your hero","ui.choose":"Choose",
    "ui.begin":"Begin the adventure","ui.prepare":"How to prepare","ui.failed":"Mission failed","ui.retry":"Try again",
    "ui.notifications":"Notifications","ui.theme":"Theme","ui.tooltips":"Tooltips","ui.notify":"Show notifications",
    "ui.damageNumbers":"Damage numbers","ui.screenShake":"Screen shake","ui.autosave":"Autosave","ui.compact":"Compact layout",
    "ui.colorblind":"Colourblind mode","ui.volume":"Volume","ui.world":"World map","ui.local":"Local map",
    "ui.all":"All","ui.back":"Back","ui.unlocked":"Unlocked","ui.newsq":"New quest unlocked","ui.newside":"New side quest",
    "ui.chapter":"Chapter","ui.choice":"Your choice","ui.outcome":"Outcome","ui.activity":"Activities",
    "ui.enemies":"Enemies","ui.use":"Use","ui.equip":"Equip","ui.salvage":"Salvage","ui.drop":"Drop",
    "ui.search":"Search","ui.boss":"Boss","ui.weak":"Weak to","ui.resists":"Resists","ui.filters":"Filters",
    "ui.mods":"Mods","ui.modsEnable":"Enabled mods","ui.modsRestart":"Needs restart","ui.modsSafeMode":"Safe mode (no mods)",
    "name.warrior":"Warrior","name.berserker":"Berserker","name.defender":"Defender","name.archer":"Archer",
    "name.thief":"Thief","name.swordmaster":"Swordmaster","name.duelist":"Duel Wielder","name.mage":"Mage",
    "name.human":"Human","name.elf":"Elf","name.dwarf":"Dwarf","name.orc":"Orc","name.halfling":"Halfling",
    "name.tiefling":"Tiefling","name.beastkin":"Beastkin","name.revenant":"Revenant",
}
};

const LANGUAGES = { en: "English" };

Object.assign(window.Game, { I18N, LANGUAGES });
