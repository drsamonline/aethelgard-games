
"use strict";
window.Game = window.Game || {};
(function () {
const W = {};
const add = (key, title, cat, short, body) => { W[key] = { key, title, cat, short, body: body || short }; };

add("hp","Health (HP)","Basics","Your life. At 0 you are slain and respawn in Oakhaven, losing 10% gold.","Health is your life total. It regenerates slowly over time and is restored by potions, rest and prayer. If it reaches zero you are defeated — you wake in Oakhaven having lost 10% of your gold, and any dungeon progress is reset.");
add("energy","Energy","Basics","Spent on gathering, exploring, fighting, crafting and activities. Regenerates over time.","Energy powers nearly every action: gathering, mining, exploring the dungeon, starting a fight, casting skills and doing activities. It refills steadily as you play, and each level-up grants more maximum energy.");
add("nerve","Nerve","Basics","The currency of the Underworld — crimes, heists and guild jobs.","Nerve is spent on illicit actions in the Underworld tab: pickpocketing, lockpicking, heists and guild jobs. It regenerates slowly and is fully restored at the temple.");
add("xp","Experience (XP)","Basics","Fill the bar to level up.","Defeating enemies, completing quests and events all grant XP. When the bar fills you level up, gaining attribute points, a skill point, more health, energy and nerve, and a full heal.");
add("gold","Gold","Basics","The currency of Aethelgard.","Gold buys materials, gear upgrades, potions, rest, information and more. Sell gathered materials when market prices are high to maximise profit.");
add("might","Might","Attributes","Increases melee attack damage.","Each point of Might adds to your physical attack power. Essential for melee classes like the Berserker and Warrior.");
add("finesse","Finesse","Attributes","Increases critical-hit chance and escape chance.","Finesse sharpens your reflexes: more critical hits in combat and a better chance to flee. Valued by Rogues, Archers and Duelists.");
add("sorcery","Sorcery","Attributes","Increases spell power.","Sorcery raises the damage of magic skills. Mages live and die by it, but any class with a magic skill benefits.");
add("vitality","Vitality","Attributes","Increases maximum health and defence.","Vitality raises your max HP and your damage reduction. Never wasted on any build.");
add("swords","Swords Skill","Skills","Raises melee attack power.","Each level of the Swords skill adds to your melee attack. Train it with skill points or practise it in the field.");
add("magic","Magic Skill","Skills","Raises spell power.","Each level of Magic adds to your spell power. Practise it by casting skills.");
add("stealth","Stealth Skill","Skills","Raises crit, escape, defence and crime success.","Stealth improves critical chance, escape chance, a little defence, and your success rate at Underworld crimes.");
add("craft","Craft Skill","Skills","Improves gathering yields and crafting rarity.","Craft raises how much you gather and improves the rarity of items you forge. A Workshop boosts this further.");
add("crit","Critical Hits","Combat","A chance to deal greatly increased damage.","Critical hits multiply your damage. Crit chance comes from Finesse, Stealth, gear affixes, some races and classes, and the Focused status.");
add("defence","Defence","Combat","Reduces incoming physical damage.","Defence subtracts from enemy attacks. It comes from Vitality, armour, shields and skills. The Defend action halves the next hit on top of this.");
add("attack","Attack","Combat","Your physical damage rating.","Attack combines Might, the Swords skill and your weapon. It is the base for most physical skills.");
add("spellpower","Spell Power","Combat","Your magic damage rating.","Spell power combines Sorcery, the Magic skill, rings, amulets and staves. It drives all magical skills.");
add("flee","Escape","Combat","Your chance to flee a battle.","Escape chance depends on Finesse, Stealth, boots and class. Bosses cannot be fled from; the Smoke Bomb guarantees escape.");
add("telegraph","Telegraphed Attacks","Combat","Enemies warn before a heavy blow — Defend!","When an enemy shows a ⚠️ warning, it will unleash a powerful attack next turn. Use Defend to halve the damage, or stun it to cancel the attack entirely.");
add("multienemy","Multiple Enemies","Combat","Fights can involve several foes at once.","Tap an enemy card to target it. Area skills like Whirlwind and Multishot hit every enemy. Defeat them all to win.");
add("elements","Elements","Combat","Physical, Fire, Ice, Poison, Dark and Light.","Every attack has an element. Enemies may resist some elements and be weak to others — hitting a weakness deals 50% more, a resistance cuts damage.");
add("rarity","Item Rarity","Gear","Common, Rare, Epic, Legendary and Mythic.","Rarity multiplies an item's stats and grants random affixes. Higher rarity comes from tougher enemies, higher Craft skill and a better Workshop.");
add("affix","Affixes","Gear","Bonus properties on rare and better gear.","Affixes add stats like crit, might, health, spell power, defence, gold find, energy or lifesteal. The rarer the item, the more affixes it carries.");
add("gearupgrade","Gear Upgrades","Gear","Improve equipped gear up to +5 with iron and gold.","In the Hero tab you can upgrade any equipped item. Each level costs iron and gold and adds to its stats. Requires iron from the Iron Peaks.");
add("gearbag","Gear Bag","Gear","Where new equipment waits until you equip it.","Looted and crafted gear lands in your bag. Equip it from the Hero tab, or salvage it for gold. Equipping swaps out whatever you had.");
add("reputation","Reputation","World","How factions feel about you.","Oakhaven, the Iron Coven and the Bandits each track your standing. High Oakhaven reputation lowers market buy prices and opens doors; choices and kills shift it.");
add("heat","Heat","Underworld","Suspicion from the town watch.","Every crime adds Heat. At high Heat the watch may shake you down as you travel, costing gold. Cool it with the Lay Low action or let it decay over time.");
add("underworld","The Underworld","Underworld","Crime, heists and the black market.","Spend Nerve on pickpocketing, lockpicking, heists and guild jobs. Success scales with Stealth, Finesse and class. The black market trades contraband relics.");
add("guild","Thieves' Guild","Underworld","Renown unlocks better jobs.","Successful heists and guild jobs build renown. Higher renown unlocks more lucrative work.");
add("blackmarket","Black Market","Underworld","Buy and sell contraband.","The fence sells stolen relics cheap and buys them back at a premium. Risky, but profitable.");
add("settlement","Settlement","Home","Your growing base of operations.","Upgrade your settlement from Camp to City, then build structures and assign settlers. It generates passive income every tick while you play.");
add("workers","Settlers","Home","Assign population to buildings for bonuses.","Population grows with your settlement level and a Tavern. Assign settlers to a building to increase its output.");
add("ascension","Ascension (New Game+)","Meta","Reset your run for permanent power.","Once you reach the Open World or level 25 you may Ascend. Everything resets — but you keep achievements and gain +1 to every attribute and bonus points for each rank.");
add("difficulty","Difficulty","Meta","Story, Normal, Hard or Brutal.","Difficulty scales enemy attack, health and rewards. Story is gentle; Brutal is punishing but pays more XP and gold. You can change it in Settings.");
add("daynight","Day and Night Cycle","World","Time passes and the world changes.","The world cycles through Dawn, Day, Dusk and Night. Night makes enemies stronger and loot richer, and shifts market prices.");
add("notifications","Notifications","Meta","Alerts for events, quests and rewards.","Toasts appear for events, quest completions, unlocks, level-ups and achievements. The bell icon holds your notification history. Toggle them in Settings.");
add("tooltips","Tooltips & Wiki","Meta","Hover anything to learn about it.","Hovering a highlighted item, stat or button shows a wiki explanation. You can turn tooltips off in Settings, and browse everything in the Codex wiki tab.");
add("quest","Quests","Quests","Missions with objectives, rewards and unlocks.","Every quest lists what you must do, what you will earn, and what it unlocks. Complete them for gold, XP and new content.");
add("main_mission","Main Missions","Quests","The five chapters of the story.","The main story drives everything: each chapter unlocks new regions, side quests and rewards, and ends with a choice that shapes your path.");
add("side_quest","Side Quests","Quests","Optional missions unlocked as the story progresses.","After each chapter new side quests open. They offer extra rewards and sometimes unlock activities or titles.");
add("bounty","Bounties","Quests","Endless procedural missions in the Open World.","Once the Open World unlocks you can request bounties — hunt a set number of a random enemy for gold and XP.");
add("class_mission","Class Missions","Quests","Missions exclusive to your class.","Each class has its own mission line with unique rewards and a title. They test the strengths of your chosen path.");
add("prepare_hint","Preparation Hints","Quests","Advice shown after a failure.","If you fail a mission, a hint appears telling you how to prepare for the next attempt — gear, potions, elements, level and tactics.");
add("save","Saving","Meta","Your progress is saved automatically.","The game auto-saves to your slot. Use Menu → Export Save to copy a backup string, and Import Save to restore it on another device.");
add("arena","The Arena","Activities","Fight waves for gold and glory.","Available in Oakhaven. Each wave is harder than the last, but the rewards grow with it.");
add("fishing","Fishing","Activities","Catch fish in the Mire.","Spend energy to fish. Fish are sold at market or cooked into hearty meals.");
add("gambling","Gambling","Activities","Wager gold on the dice.","The Dice Den takes a wager and rolls. Win for profit, lose it all — the house always has an edge.");
add("cooking","Cooking","Activities","Turn ingredients into buffs.","Cooking combines fish and food into meals that grant regeneration in combat.");
add("farming","Farming","Activities","Grow crops in your settlement.","Tend your fields for food and a little coin. Requires a Farm.");
add("tavern","Tavern Rumours","Activities","Buy information for gold.","A round of drinks buys a rumour — a hint about enemies, weaknesses or hidden loot.");
add("hints","Hints","Meta","Contextual advice in the Story tab.","The Hints panel reads your situation and suggests what to do next — when to heal, where to spend points, and which element an upcoming boss fears.");
add("mods","Mods","Mods","Add-ons that change or extend the game.","A mod is a single JavaScript file dropped into the mods/ folder. The game finds mods automatically, lists them on the new-game screen and in Settings, and lets you switch each one on or off. Nothing in the core files needs editing.");
add("mod_format","Mod format","Mods","One JS file that pushes an object onto window.AETHELGARD_MODS.","A mod file pushes an object with id, name, version and optional data tables (ENEMIES, GEAR, SIDE_QUESTS, WIKI, I18N and so on). Listing an existing key replaces it; a new key adds it. See mods/README.md for the full reference and an example.");
add("mod_tiers","Mod impact tiers","Mods","content, story or overhaul.","Content mods (impact \"additive\") add enemies, items, quests or languages and can be toggled instantly. Story and overhaul mods change the narrative or rebalance the game, so they only load on a fresh start — never mid-session — to keep your save safe.");
add("mod_safe","Safe mode","Mods","Run the game with no mods at all.","Safe mode disables every mod for the session. Turn it on in Settings, or add ?safe=1 to the address. Use it if a mod misbehaves; your save is untouched and you can fix the mod and reload.");
add("graphics","Graphics packs","Mods","Art packs that replace the emoji with images.","A graphics pack is a mod that registers images for the game's sprite keys. Anything a pack does not cover keeps its emoji, so a partial pack still works. Pick one in Settings → Graphics pack."),
add("sprite_keys","Sprite keys","Mods","How the game asks for art.","The game draws every entity through one function, Game.sprite(key, fallback). Keys look like enemy.wolf, class.mage, item.potion, loc.oakhaven, companion.bryn. Register an image for a key and it replaces the emoji there."),
add("graphics_pack","Making an art pack","Mods","Ship images in a mod under GRAPHICS.","A mod adds a GRAPHICS object with an id, a base folder, an optional scale and palette, and a sprites map of key to image (or to a sheet cell, optionally animated). See mods/README.md and mods/example-graphics for a working pack."),
add("graphics_bg","Region backdrops","Graphics","Full-screen art behind the UI.","A graphics pack can supply a backdrop for each region (bg.<region>) plus bg.title, bg.world and bg.combat. The page background then changes as you travel. Backdrops are wide scenes, so they are never cut out — only character sprites are."),
add("mod_compat","Mod compatibility","Mods","Which mods work together, and which clash.","Settings → Mods checks every enabled mod against the others and reports: green if they all work together, amber for overlaps (two mods writing the same entry — the later one wins), red for problems, where the mod is skipped and the game carries on."),
add("mod_deps","Mod dependencies","Mods","requiresMods, conflicts, loadAfter, provides.","A mod can declare requiresMods (a hard dependency), conflicts (neither may be enabled), loadAfter/loadBefore (ordering), and provides/requiresProvides (capability tokens). An unmet dependency blocks just that mod and shows why."),
add("mod_add","Adding a mod","Mods","Drop a file in mods/ and rebuild the manifest.","Put your .js file in the mods/ folder, run python3 tools/build-mods-index.py to refresh the manifest, then reload. When the game is served over http/https it reads mods/mods.json; opened from disk it reads mods/index.js.");
add("bountyboard","Bounty Board","Activities","Take paid work in Oakhaven.","The board posts bounties for coin and renown. New bounties appear as you grow stronger.");

Object.keys(window.Game.CLASSES).forEach(k => {
  const c = window.Game.CLASSES[k];
  add("class_"+k, c.name, "Classes", c.blurb, `${c.desc} Role: ${c.role}. Perks: ${c.blurb}`);
});
Object.keys(window.Game.RACES).forEach(k => {
  const r = window.Game.RACES[k];
  add("race_"+k, r.name, "Races", r.perk, `${r.desc} Perk: ${r.perk}`);
});
Object.keys(window.Game.LOCATIONS).forEach(k => {
  const l = window.Game.LOCATIONS[k];
  add("loc_"+k, l.name, "Places", l.desc, `${l.desc} Danger rating: ${l.danger}/3.`);
});
Object.keys(window.Game.STATUS).forEach(k => {
  const s = window.Game.STATUS[k];
  add("status_"+k, s.name, "Status Effects", `${s.emoji} A ${s.kind} effect lasting ${s.turns||"—"} turns.`, `Status effect: ${s.name}. Kind: ${s.kind}.`);
});
Object.keys(window.Game.ELEMENTS).forEach(k => add("el_"+k, window.Game.ELEMENTS[k].name, "Elements", "An attack element.", `${window.Game.ELEMENTS[k].name} damage. Enemies may resist or be weak to it.`));
Object.keys(window.Game.RARITIES).forEach(k => { const r = window.Game.RARITIES[k]; add("rar_"+k, r.name, "Rarity", `${Math.round(r.mult*100)}% stats, ${r.affixes} affixes.`, `${r.name} items have ${Math.round(r.mult*100)}% base stats and up to ${r.affixes} affixes.`); });
Object.keys(window.Game.AFFIXES).forEach(k => add("aff_"+k, window.Game.AFFIXES[k].name, "Affixes", window.Game.AFFIXES[k].fmt, `Affix: ${window.Game.AFFIXES[k].fmt}.`));
Object.keys(window.Game.ITEMS).forEach(k => { const it = window.Game.ITEMS[k]; add("item_"+k, it.name, it.contraband ? "Contraband" : "Items", it.material ? "A crafting material." : (it.use ? "A consumable." : "An item."), `${it.name}${it.material ? " is a crafting material" : ""}${it.use ? ` can be used: ${it.use}` : ""}.`); });
Object.keys(window.Game.GEAR).forEach(k => { const g = window.Game.GEAR[k]; add("gear_"+k, g.name, "Gear", `${g.slot} · tier ${g.tier}`, `${g.name} occupies the ${g.slot} slot (tier ${g.tier}).${g.atk?` Attack +${g.atk}.`:""}${g.def?` Defence +${g.def}.`:""}${g.spell?` Spell +${g.spell}.`:""}`); });
Object.keys(window.Game.BUILDINGS).forEach(k => { const b = window.Game.BUILDINGS[k]; add("bld_"+k, b.name, "Buildings", b.desc, `${b.desc} Maximum level ${b.max}.`); });
Object.keys(window.Game.ACTIVITIES).forEach(k => { const a = window.Game.ACTIVITIES[k]; add("act_"+k, a.name, "Activities", a.desc, `${a.desc} Available in ${a.zone}.`); });
Object.keys(window.Game.ENEMIES).forEach(k => { const e = window.Game.ENEMIES[k]; add("enemy_"+k, e.name, e.boss ? "Bosses" : "Bestiary", `Tier ${e.tier} · ${window.Game.ELEMENTS[e.element].name}`, `${e.name} is a tier ${e.tier} ${e.boss?"boss":"enemy"}. Element: ${window.Game.ELEMENTS[e.element].name}.${e.weak&&e.weak.length?` Weak to: ${e.weak.join(", ")}.`:""}${e.resist?` Resists: ${Object.keys(e.resist).join(", ")}.`:""}`); });
Object.keys(window.Game.ACTIVE_SKILLS).forEach(k => { const s = window.Game.ACTIVE_SKILLS[k]; const cn = window.Game.CLASSES[s.cls] ? window.Game.CLASSES[s.cls].name : "any class"; add("skill_"+k, s.name, "Skills", s.desc, `${s.desc} Available to the ${cn} from level ${s.lvl}. Costs ${s.cost} energy; cooldown ${s.cd} turn(s).`); });
if (window.Game.GEMS) Object.keys(window.Game.GEMS).forEach(k => { const g = window.Game.GEMS[k]; add("gem_"+k, g.name, "Gems", g.desc, `${g.name}: ${g.desc}. Socket it into gear in the Hero tab's Enchanting panel.`); });
if (window.Game.GEAR_SETS) Object.keys(window.Game.GEAR_SETS).forEach(k => { const s = window.Game.GEAR_SETS[k]; add("set_"+k, s.name+" Set", "Sets", s.desc, `Wear 2 or more pieces of the ${s.name} set for: ${s.desc}. Pieces: ${s.pieces.map(p => window.Game.GEAR[p] ? window.Game.GEAR[p].name : p).join(", ")}.`); });
if (window.Game.ULTIMATES) Object.keys(window.Game.ULTIMATES).forEach(k => { const u = window.Game.ULTIMATES[k]; add("ult_"+k, u.name, "Ultimates", u.desc, `Limit Break for the ${window.Game.CLASSES[k] ? window.Game.CLASSES[k].name : k}. Fill the limit meter by fighting to unleash it.`); });
if (window.Game.REACTIONS) window.Game.REACTIONS.forEach(r => add("rx_"+r.id, r.name, "Reactions", `Hit a ${window.Game.STATUS[r.status].name} foe with ${window.Game.ELEMENTS[r.element].name}.`, `${r.name}: striking a ${window.Game.STATUS[r.status].name} enemy with ${window.Game.ELEMENTS[r.element].name} damage deals +${Math.round((r.mult-1)*100)}% damage and an extra effect.`));
if (window.Game.COMPANIONS) window.Game.COMPANIONS.forEach(c => add("comp_"+c.id, c.name, "Companions", c.perk, `${c.name} (${c.role}): ${c.desc} Perk: ${c.perk}`));
if (window.Game.ELITE_AFFIXES) Object.keys(window.Game.ELITE_AFFIXES).forEach(k => { const a = window.Game.ELITE_AFFIXES[k]; add("elite_"+k, a.name+" (elite)", "Elites", "An elite enemy affix.", `Elite affix "${a.name}": tougher enemies that give more XP and better loot.`); });
if (window.Game.ENDLESS_MODS) Object.keys(window.Game.ENDLESS_MODS).forEach(k => { const m = window.Game.ENDLESS_MODS[k]; add("emod_"+k, m.name, "Endless", m.desc, `The Depths modifier "${m.name}": ${m.desc}`); });

window.Game.WIKI = W;
window.Game.WIKI_CATS = ["Basics","Attributes","Skills","Combat","Reactions","Ultimates","Elites","Gear","Gems","Sets","World","Quests","Home","Underworld","Activities","Companions","Classes","Races","Places","Status Effects","Elements","Rarity","Affixes","Items","Buildings","Bestiary","Bosses","Endless","Mods","Meta"];
})();
