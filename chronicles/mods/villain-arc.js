
window.AETHELGARD_MODS = window.AETHELGARD_MODS || [];

window.AETHELGARD_MODS.push({
  id: "villain-arc",
  name: "The Crown's Shadow (villain arc)",
  version: "1.0.0",
  author: "Dr. Sohil Momin",
  description: "Play as one of the five bosses. The heroes become your enemies and the story is told from the other side. Needs a restart.",
  impact: "overhaul",
  provides: ["mode:villain"],

  init(G) {
    const SPOTS = [
      ["oakhaven",  { id:"hunter",   name:"Hunter at the Gate", emoji:"\uD83C\uDFF9", x:12, y:12,
                      act:"hunt", spawn:["hero_hunter"],      desc:"The village hunter who came to your door." }],
      ["oakhaven",  { id:"patrol",   name:"Guard Patrol",       emoji:"\uD83D\uDEE1", x:88, y:12,
                      act:"hunt", spawn:["hero_guard"],       desc:"Oakhaven guards on the road." }],
      ["mire",      { id:"trackers", name:"Trackers",           emoji:"\uD83D\uDEE1", x:14, y:12,
                      act:"hunt", spawn:["hero_guard"],       desc:"They followed you home." }],
      ["mountains", { id:"roadwatch",name:"Road Watch",         emoji:"\uD83D\uDEE1", x:14, y:54,
                      act:"hunt", spawn:["hero_guard"],       desc:"Guards posted on the mountain road." }],
      ["mountains", { id:"ambush",   name:"Mountain Ambush",    emoji:"\uD83D\uDEE1", x:54, y:86,
                      act:"hunt", spawn:["hero_guard"],       desc:"A patrol waiting for you." }],
      ["ruins",     { id:"order",    name:"The Order",          emoji:"\u2694", x:12, y:54,
                      act:"hunt", spawn:["hero_knight"],      desc:"A knight of the Order has come." }],
      ["banditcamp",{ id:"champion", name:"The Champion",       emoji:"\uD83D\uDDF1", x:18, y:60,
                      act:"hunt", spawn:["hero_swordmaster"], desc:"The Order's champion, blade drawn." }],
      ["temple",    { id:"crown",    name:"The Crown's Shadow", emoji:"\uD83D\uDC51", x:80, y:26,
                      act:"hunt", spawn:["champion"],         desc:"Everything they sent, in one shape." }],
      ["cave",      { id:"war_mage", name:"War Mage",           emoji:"\uD83D\uDD2F", x:80, y:24,
                      act:"hunt", spawn:["hero_mage"],        desc:"A battle-mage of the Order." }],
      ["depths",    { id:"longbow",  name:"Longbowman",         emoji:"\uD83C\uDFF9", x:14, y:20,
                      act:"hunt", spawn:["hero_archer"],      desc:"An archer down in the dark." }],
];
    const nameOf = { hero_hunter:"the Village Hunter", hero_guard:"an Oakhaven Guard",
                     hero_knight:"a Knight of the Order", hero_swordmaster:"the Order's Champion",
                     champion:"the Champion", hero_mage:"a War Mage", hero_archer:"a Longbowman" };
    G.VILLAIN_SPOTS = SPOTS.map(s => ({ region:s[0], poi:s[1] }));
    SPOTS.forEach(([region, poi]) => {
      if (!G.LOCAL_MAPS || !G.LOCAL_MAPS[region]) return;
      const list = G.LOCAL_MAPS[region];
      if (list.some(p => p.id === poi.id)) return;
      list.push(Object.assign({}, poi));
});

    G.targetWhere = G.targetWhere || {};
    SPOTS.forEach(([region, poi]) => (poi.spawn || []).forEach(e => {
      (G.targetWhere[e] = G.targetWhere[e] || []).push(region);
}));
    G.targetNameOf = nameOf;
},

  MODE: {
    id: "villain",
    name: "The Crown's Shadow",
    accent: "#b07aff",
    desc: "Play as one of the five bosses. The heroes are your enemies, the campaign is told from the other side, and your saves are kept apart from Chronicles.",
    startDesc: "Five bosses. The heroes of Aethelgard are your enemies, and the campaign is told from the other side.",
    titleBg: "bg.villain",
    classes: ["coven_leader", "iron_warden", "bandit_warlord", "spider_queen", "bog_horror"],
    heroesHidden: true,
},

  CLASSES: {
    coven_leader: {
      name: "Coven Leader", emoji: "🕯️", role: "Dark caster", color: "#b07aff",
      desc: "You were the shadow behind the mire, the one whose name the village children were told not to say. They came for you anyway.",
      blurb: "+6 Sorcery, +25 HP, drains life with every spell — but frail in armour.",
      bonus: { sorcery: 6, vitality: 2 }, hp: 25, def: -2, critDmg: 0.15,
      startGear: { weapon: "arcane_staff", armor: "robe" },
},
    iron_warden: {
      name: "Iron Warden", emoji: "🔒", role: "Guardian", color: "#8fa3c8",
      desc: "You have stood at the seal for three hundred years and let nothing through. You will not explain yourself to a stranger with a sword.",
      blurb: "+8 Vitality, +60 HP, +6 defence — the wall the heroes break against.",
      bonus: { vitality: 8, might: 2 }, hp: 60, def: 6, critDmg: 0,
      startGear: { weapon: "mace", armor: "iron_plate" },
},
    bandit_warlord: {
      name: "Bandit Warlord", emoji: "🏴", role: "Berserker", color: "#e0a04a",
      desc: "The roads were yours because nobody else wanted them. Now they call you a tyrant for taxing the same caravans they robbed first.",
      blurb: "+5 Might, +4 Finesse, double strike — fast, brutal, and greedy.",
      bonus: { might: 5, finesse: 4 }, hp: 15, def: 0, critDmg: 0.2,
      startGear: { weapon: "hand_axe", armor: "leather_armor" },
},
    spider_queen: {
      name: "Spider Queen", emoji: "🕷️", role: "Poisoner", color: "#7ac88f",
      desc: "You built a nest in a drowned chapel and asked for nothing. They came with torches and called it cleansing.",
      blurb: "+5 Finesse, poison on every strike, and you heal from the wounds you open.",
      bonus: { finesse: 5, sorcery: 2 }, hp: 10, def: 1, critDmg: 0.18,
      startGear: { weapon: "dagger", armor: "clothes" },
},
    bog_horror: {
      name: "Bog Horror", emoji: "🫧", role: "Bruiser", color: "#6fae72",
      desc: "You are older than the mire and made of what it swallowed. You do not hate the hunters. You simply do not stop.",
      blurb: "+7 Vitality, +45 HP, regenerates every turn — the thing that will not die.",
      bonus: { vitality: 7, might: 3 }, hp: 45, def: 3, critDmg: 0.05,
      startGear: { weapon: "mace", armor: "clothes" },
},
},

  ACTIVE_SKILLS: {
    soul_drain:    { name: "Soul Drain",    emoji: "🕯️", cls: "coven_leader", lvl: 1, cost: 8,  cd: 3, kind: "drain",  mult: 1.6, desc: "Tear life out of them and keep it." },
    hex_of_ruin:   { name: "Hex of Ruin",   emoji: "💀", cls: "coven_leader", lvl: 5, cost: 12, cd: 4, kind: "debuff", status: "weaken", mult: 0.5, desc: "Curse them: their blows land soft." },
    dark_communion:{ name: "Dark Communion",emoji: "🌑", cls: "coven_leader", lvl: 8, cost: 14, cd: 5, kind: "dot",    status: "poison", mult: 1.4, desc: "The dark answers you and eats at them." },

    bulwark_stance:{ name: "Bulwark Stance",emoji: "🔒", cls: "iron_warden", lvl: 1, cost: 8, cd: 5, kind: "buff", status: "shield", desc: "Set your feet. Nothing moves you." },
    sundering_blow:{ name: "Sundering Blow",emoji: "🔨", cls: "iron_warden", lvl: 4, cost: 12, cd: 4, kind: "heavy", mult: 1.9, telegraph: "raises both fists", desc: "A blow that cracks stone." },
    seal_the_wound:{ name: "Seal the Wound",emoji: "⛓️", cls: "iron_warden", lvl: 7, cost: 10, cd: 4, kind: "stun", mult: 0.9, status: "stun", desc: "Pin them where they stand." },

    raid_strike:   { name: "Raid Strike",   emoji: "🏴", cls: "bandit_warlord", lvl: 1, cost: 7,  cd: 3, kind: "dmg",   mult: 1.7, desc: "The first blow of a very short fight." },
    plunder:       { name: "Plunder",       emoji: "💰", cls: "bandit_warlord", lvl: 4, cost: 9,  cd: 4, kind: "dmg",   mult: 1.5, goldSteal: true, desc: "Hit them and take what they drop." },
    reign_of_terror:{name: "Reign of Terror",emoji:"☠️", cls: "bandit_warlord", lvl: 7, cost: 13, cd: 5, kind: "debuff", status: "weaken", mult: 0.6, desc: "They have heard what you do to people." },

    venom_bite:    { name: "Venom Bite",    emoji: "🕷️", cls: "spider_queen", lvl: 1, cost: 7,  cd: 3, kind: "dot",   status: "poison", mult: 1.2, desc: "Your venom does the work for you." },
    web_snare:     { name: "Web Snare",     emoji: "🕸️", cls: "spider_queen", lvl: 4, cost: 9,  cd: 4, kind: "stun",  mult: 0.6, status: "stun", desc: "Wrap them up. Take your time." },
    brood_feast:   { name: "Brood Feast",   emoji: "🥚", cls: "spider_queen", lvl: 7, cost: 12, cd: 4, kind: "drain", mult: 1.5, desc: "The brood feeds; so do you." },

    rot_swing:     { name: "Rot Swing",     emoji: "🫧", cls: "bog_horror", lvl: 1, cost: 8,  cd: 3, kind: "dmg",   mult: 1.8, desc: "A slow arm, and heavy." },
    mire_grasp:    { name: "Mire Grasp",    emoji: "🌫️", cls: "bog_horror", lvl: 4, cost: 10, cd: 4, kind: "dot",   status: "bleed", mult: 1.3, desc: "The bog holds them while you work." },
    endless_hunger:{ name: "Endless Hunger",emoji: "♾️", cls: "bog_horror", lvl: 7, cost: 13, cd: 5, kind: "drain", mult: 1.6, desc: "You have been hungry for a very long time." },
},

  CLASS_MISSIONS: [
    { id: "cm_vil_cov_1", cls: "coven_leader", name: "The First Warning",
      desc: "Break three Oakhaven Guards on the road.", objective: { type: "kill", target: "hero_guard", required: 3 },
      rewards: { gold: 200, xp: 240 }, unlocks: ["Coven skill: Hex of Ruin"],
      prepare: ["Guards shield each other — burst one down", "Your spells ignore armour; lean on them", "Keep 10 energy for Soul Drain"] },
    { id: "cm_vil_cov_2", cls: "coven_leader", name: "The Name They Fear",
      desc: "Kill the Templar Champion who leads the hunt.",
      objective: { type: "kill", target: "champion", required: 1 },
      rewards: { gold: 500, xp: 700, items: { relic: 1 } }, unlocks: ["Coven title: The Unnamed"],
      prepare: ["The Champion resists Dark — bring Fire or Ice", "He heals; out-damage the healing", "Full HP and 3 potions before you face him"] },

    { id: "cm_vil_war_1", cls: "iron_warden", name: "Hold the Seal",
      desc: "Survive and win five battles without leaving the cave.",
      objective: { type: "wins", target: "any", required: 5 },
      rewards: { gold: 220, xp: 260 }, unlocks: ["Warden skill: Sundering Blow"],
      prepare: ["Bulwark Stance before every fight", "You are slow — let them come to you", "Repair your plate at the Forge first"] },
    { id: "cm_vil_war_2", cls: "iron_warden", name: "Three Hundred Years",
      desc: "Defeat the Swordmaster who claims to be your equal.",
      objective: { type: "kill", target: "hero_swordmaster", required: 1 },
      rewards: { gold: 520, xp: 720 }, unlocks: ["Warden title: The Unbroken Seal"],
      prepare: ["He ripostes — do not attack into his guard", "Sundering Blow on the turn he telegraphs", "Bring an Antidote; his cuts bleed"] },

    { id: "cm_vil_ban_1", cls: "bandit_warlord", name: "Tax Collection",
      desc: "Rob eight travellers on the roads.", objective: { type: "crimes", target: "any", required: 8 },
      rewards: { gold: 260, xp: 260 }, unlocks: ["Warlord skill: Plunder"],
      prepare: ["Raise Finesse — it drives a clean robbery", "Plunder pays out more on a killing blow", "Lay Low between jobs if your Heat climbs"] },
    { id: "cm_vil_ban_2", cls: "bandit_warlord", name: "The Badlands Are Mine",
      desc: "Kill the Knight of the Order sent to clear the roads.",
      objective: { type: "kill", target: "hero_knight", required: 1 },
      rewards: { gold: 540, xp: 700 }, unlocks: ["Warlord title: King of the Roads"],
      prepare: ["He wears plate — bring a weapon with +attack", "Plunder before he can heal", "Do not let him stun-lock you"] },

    { id: "cm_vil_spi_1", cls: "spider_queen", name: "Nothing Wasted",
      desc: "Poison-kill five enemies.", objective: { type: "kill", target: "any", required: 5 },
      rewards: { gold: 240, xp: 280 }, unlocks: ["Spider skill: Web Snare"],
      prepare: ["Venom Bite first, then let the poison work", "Brood Feast heals you off their wounds", "Fight in the nest where you are strongest"] },
    { id: "cm_vil_spi_2", cls: "spider_queen", name: "The Cleansing",
      desc: "Kill the Battle Mage who came to burn your nest.",
      objective: { type: "kill", target: "hero_mage", required: 1 },
      rewards: { gold: 560, xp: 740 }, unlocks: ["Spider title: Mother of the Nest"],
      prepare: ["She casts Fire — you are not built to tank it", "Web Snare her before the big spells land", "Bring 2 antidotes and 3 potions"] },

    { id: "cm_vil_bog_1", cls: "bog_horror", name: "The Mire Keeps Its Own",
      desc: "Win five battles in the Crimson Mire.",
      objective: { type: "wins", target: "any", required: 5 },
      rewards: { gold: 230, xp: 270 }, unlocks: ["Horror skill: Mire Grasp"],
      prepare: ["You regenerate — long fights favour you", "Mire Grasp bleeds them while you heal", "Do not chase; let them come into the water"] },
    { id: "cm_vil_bog_2", cls: "bog_horror", name: "Older Than the Mire",
      desc: "Kill the Archer who has been hunting you for sport.",
      objective: { type: "kill", target: "hero_archer", required: 1 },
      rewards: { gold: 500, xp: 700 }, unlocks: ["Horror title: The First Drowned"],
      prepare: ["She kites — close the distance fast", "Endless Hunger to out-sustain her", "Bring 2 antidotes for her poison arrows"] },
],

  ENEMIES: {
    hero_guard: {
      name: "Oakhaven Guard", emoji: "🛡️", hp: 150, atk: 26, def: 12, xp: 180, gold: 90,
      tier: 3, element: "physical", resists: ["physical"], weak: ["dark"],
      drops: { iron: 1, potion: 0.3 },
      abilities: [
        { name: "Shield Wall", chance: 0.25, kind: "buff", status: "shield", mult: 0, msg: "raises a shield wall" },
        { name: "Spear Thrust", chance: 0.28, kind: "heavy", mult: 1.4, telegraph: "levels a spear", msg: "drives the spear home" },
],
},
    hero_hunter: {
      name: "Village Hunter", emoji: "🏹", hp: 120, atk: 30, def: 6, xp: 170, gold: 80,
      tier: 3, element: "physical", weak: ["dark"],
      drops: { leather: 1, food: 1 },
      abilities: [
        { name: "Snare Trap", chance: 0.24, kind: "stun", mult: 0.4, msg: "snaps a snare around your leg" },
        { name: "Aimed Shot", chance: 0.3, kind: "heavy", mult: 1.6, telegraph: "draws and holds", msg: "looses a shot into your throat" },
],
},
    hero_knight: {
      name: "Knight of the Order", emoji: "⚔️", hp: 280, atk: 38, def: 20, xp: 320, gold: 180,
      tier: 4, element: "physical", resists: ["physical"], weak: ["dark", "fire"],
      drops: { iron: 2, relic: 0.3 },
      abilities: [
        { name: "Order's Edict", chance: 0.22, kind: "weaken", mult: 0.35, msg: "reads an edict that dulls your strength" },
        { name: "Lance Charge", chance: 0.26, kind: "heavy", mult: 1.8, telegraph: "lowers a lance", msg: "charges you down" },
],
},
    hero_mage: {
      name: "Battle Mage", emoji: "🔥", hp: 170, atk: 40, def: 8, xp: 300, gold: 160,
      tier: 4, element: "fire", weak: ["ice"],
      drops: { ruby: 0.4, ether: 0.5 },
      abilities: [
        { name: "Firestorm", chance: 0.28, kind: "heavy", mult: 1.7, telegraph: "gathers flame", msg: "drops a storm of fire" },
        { name: "Warding Sigil", chance: 0.2, kind: "buff", status: "shield", mult: 0, msg: "traces a warding sigil" },
],
},
    hero_swordmaster: {
      name: "Swordmaster of the Order", emoji: "🗡️", hp: 300, atk: 44, def: 16, xp: 360, gold: 200,
      tier: 4, element: "physical", weak: ["dark"],
      drops: { relic: 0.35, iron: 1 },
      abilities: [
        { name: "Riposte", chance: 0.3, kind: "heavy", mult: 1.9, telegraph: "settles into a guard", msg: "turns your own blow back on you" },
        { name: "Perfect Cut", chance: 0.22, kind: "dot", status: "bleed", mult: 1.2, msg: "opens a cut that will not close" },
],
},
    hero_archer: {
      name: "Order Archer", emoji: "🎯", hp: 160, atk: 34, def: 7, xp: 260, gold: 140,
      tier: 3, element: "poison", weak: ["dark"],
      drops: { leather: 1, herb: 1 },
      abilities: [
        { name: "Poison Arrow", chance: 0.3, kind: "dot", status: "poison", mult: 0.9, msg: "puts a poisoned arrow through you" },
        { name: "Pinning Shot", chance: 0.22, kind: "stun", mult: 0.5, msg: "pins your foot to the ground" },
],
},
    champion: {
      name: "Champion of Aethelgard", emoji: "👑", hp: 900, atk: 52, def: 26, xp: 1600, gold: 900,
      tier: 5, boss: true, element: "light", weak: ["dark"], resists: ["physical", "light"],
      drops: { relic: 3, artifact: 1 },
      abilities: [
        { name: "Radiant Smite", chance: 0.26, kind: "heavy", mult: 1.9, telegraph: "raises a burning blade", msg: "smites you with holy light" },
        { name: "Lay on Hands", chance: 0.18, kind: "heal", mult: 0, msg: "calls on his god and knits his wounds shut" },
        { name: "Judgement", chance: 0.2, kind: "stun", mult: 1.0, msg: "passes judgement and roots you in place" },
],
},
},

  CHAPTERS: [
    {
      id: 1, title: "Chapter I — The Thing They Hunt",
      text: "You wake in your lair to the sound of boots. It is always boots first — the ones who come to kill you never bother to be quiet. A village hunter has come up the path with a good bow and a bad reason.",
      objective: { type: "kill", target: "hero_hunter", required: 1, label: "Deal with the Village Hunter at your door" },
      rewards: { gold: 80, xp: 120 }, unlocks: ["The roads out of your lair"],
      prepare: ["You are the monster here — fight like one", "Open with your strongest skill, not a basic attack", "There is no one coming to help you"],
      choices: [
        { label: "Leave the body where the village will find it",
          outcome: "They will send more. They always send more — but they will send them slower, and afraid.",
          effects: { flags: { villain_open: "show" }, rep: { oakhaven: -20 }, xp: 40 } },
        { label: "Drag it into the dark and leave no sign",
          outcome: "For three days nobody comes. For three days you have peace, and time to remember what you were before they named you.",
          effects: { flags: { villain_open: "hide" }, rep: { coven: 10 }, gold: 60 } },
],
},
    {
      id: 2, title: "Chapter II — They Are Gathering",
      text: "Oakhaven has posted a bounty with your name on it, and a name is a thing that draws crowds. Guards are on the roads now, in threes, with shields. They think numbers will be enough.",
      objective: { type: "kill", target: "hero_guard", required: 4, label: "Break four Oakhaven Guards on the roads" },
      rewards: { gold: 260, xp: 340 }, unlocks: ["The Order takes notice"],
      prepare: ["Guards shield each other — kill one before the rest close", "Your best damage is Dark; they resist steel", "Retreat and heal if three are on you at once"],
      choices: [
        { label: "Make an example of the last one",
          outcome: "You let him crawl home. He tells the story badly, and the story does more work than the killing did.",
          effects: { flags: { villain_show: "example" }, rep: { oakhaven: -25, coven: 15 }, xp: 80 } },
        { label: "Take their shields for yourself",
          outcome: "You stack the shields against your wall. Later, someone will find them there and understand exactly what happened.",
          effects: { flags: { villain_show: "trophies" }, gold: 200, xp: 60 } },
],
},
    {
      id: 3, title: "Chapter III — The Order Comes",
      text: "The Order does not send hunters. It sends knights, in plate, with an edict they read aloud before they kill you — as if the words mattered. They have brought a Battle Mage to burn your home.",
      objective: { type: "kill", target: "hero_knight", required: 2, label: "Turn back two Knights of the Order" },
      rewards: { gold: 480, xp: 620, items: { relic: 1 } }, unlocks: ["The Champion is named"],
      prepare: ["Knights resist physical — bring Dark or Fire", "They weaken your blows with their edict: burst them fast", "Your lair is an advantage; fight them in the dark"],
      choices: [
        { label: "Burn their edict in front of them",
          outcome: "The paper curls and the knight flinches. You have learned that their certainty is thinner than their armour.",
          effects: { flags: { villain_order: "defy" }, rep: { oakhaven: -30, coven: 20 }, xp: 120 } },
        { label: "Read it first, then burn it",
          outcome: "It names you. It gives you a history you did not know you had, and a reason you had forgotten. You keep one page.",
          effects: { flags: { villain_order: "know" }, xp: 200, gold: 150 } },
],
},
    {
      id: 4, title: "Chapter IV — The Champion",
      text: "They have found a champion. Someone young, and certain, and beloved — the kind of hero songs are written about. He has already killed three of your kind this season. He is coming for you, and he is not afraid.",
      objective: { type: "kill", target: "hero_swordmaster", required: 1, label: "Kill the Swordmaster training the Champion" },
      rewards: { gold: 700, xp: 900, items: { relic: 2 } }, unlocks: ["The Champion's approach"],
      prepare: ["He ripostes — never attack into his guard", "Bring Dark; he is not warded against it", "You cannot out-fence him. Out-think him"],
      choices: [
        { label: "Send his blade back to the village",
          outcome: "The village understands the message better than any corpse would. Some of them start to leave. Some of them stay, and sharpen things.",
          effects: { flags: { villain_champ: "warn" }, rep: { oakhaven: -35 }, xp: 150 } },
        { label: "Keep the blade and say nothing",
          outcome: "You hang it with the others and wait. Let him wonder what kind of thing collects the swords of men who tried.",
          effects: { flags: { villain_champ: "silent" }, xp: 250, gold: 250 } },
],
},
    {
      id: 5, title: "Chapter V — The Crown's Shadow",
      text: "He comes at dawn, alone, because heroes always come alone. He has your name, your history, and a holy blade that has never once failed him. He believes he is the ending of your story. He is wrong about which of you this story is about.",
      objective: { type: "kill", target: "champion", required: 1, label: "Break the Champion of Aethelgard" },
      rewards: { gold: 1500, xp: 2400, items: { artifact: 2 } },
      unlocks: ["Ending: The Crown's Shadow", "Title: The Thing They Warn Children About"],
      prepare: [
        "The Champion resists Physical AND Holy — Dark is your only way through",
        "He heals himself: out-damage the healing or you will lose slowly",
        "Judgement roots you — keep a Defend turn for it",
        "Full HP, 3 potions, an elixir. This is the only fight that matters",
],
      choices: [
        { label: "Kill him and take his place in the songs",
          outcome: "They will write about him, and then they will write about what killed him. In a hundred years, children will be told to be good, or the thing in the dark will come — and it will be your face they mean.",
          effects: { flags: { villain_end: "crown" }, rep: { oakhaven: -60 }, xp: 600 } },
        { label: "Let him live and walk away",
          outcome: "You leave him broken in the mud with his holy blade and no story. He will have to explain it. You will not.",
          effects: { flags: { villain_end: "mercy" }, rep: { coven: 40 }, gold: 1200, xp: 400 } },
],
},
],

  SPRITES: {
    "class.coven_leader":   "mods/villain-arc/sprites/class_coven_leader.webp",
    "class.iron_warden":    "mods/villain-arc/sprites/class_iron_warden.webp",
    "class.bandit_warlord": "mods/villain-arc/sprites/class_bandit_warlord.webp",
    "class.spider_queen":   "mods/villain-arc/sprites/class_spider_queen.webp",
    "class.bog_horror":     "mods/villain-arc/sprites/class_bog_horror.webp",

    "enemy.hero_hunter":      "mods/villain-arc/sprites/enemy_hero_hunter.webp",
    "enemy.hero_guard":       "mods/villain-arc/sprites/enemy_hero_guard.webp",
    "enemy.hero_knight":      "mods/villain-arc/sprites/enemy_hero_knight.webp",
    "enemy.hero_mage":        "mods/villain-arc/sprites/enemy_hero_mage.webp",
    "enemy.hero_swordmaster": "mods/villain-arc/sprites/enemy_hero_swordmaster.webp",
    "enemy.hero_archer":      "mods/villain-arc/sprites/enemy_hero_archer.webp",
    "enemy.champion":         "mods/villain-arc/sprites/enemy_champion.webp",

    "bg.villain": "mods/villain-arc/sprites/bg_villain.webp",
},

  WIKI: {
    villain_arc: { key: "villain_arc", title: "The Crown's Shadow", cat: "Story",
      short: "Villain campaign (overhaul mod)",
      body: "An overhaul mod that reverses the game: you play as one of the five bosses, the eight hero classes become your enemies, and a five-chapter campaign is told from the other side. Enabling it plays as a separate game." },
    class_coven_leader: { key: "class_coven_leader", title: "Coven Leader", cat: "Classes",
      short: "Playable villain · Dark caster",
      body: "The shadow behind the Crimson Mire, now playable. Drains life with every spell and shrugs off armour, but cannot take a hit." },
    class_iron_warden: { key: "class_iron_warden", title: "Iron Warden", cat: "Classes",
      short: "Playable villain · Guardian",
      body: "Three hundred years at the seal, now playable. The highest defence and HP in the game, and the slowest." },
    class_bandit_warlord: { key: "class_bandit_warlord", title: "Bandit Warlord", cat: "Classes",
      short: "Playable villain · Berserker",
      body: "Master of the badlands, now playable. Fast, brutal, and paid for it — Plunder turns kills into coin." },
    class_spider_queen: { key: "class_spider_queen", title: "Spider Queen", cat: "Classes",
      short: "Playable villain · Poisoner",
      body: "Weaver of the dark, now playable. Poison on every strike and healing from every wound she opens." },
    class_bog_horror: { key: "class_bog_horror", title: "Bog Horror", cat: "Classes",
      short: "Playable villain · Bruiser",
      body: "Older than the mire, now playable. Regenerates every turn — the fight you cannot win by waiting." },
    enemy_champion: { key: "enemy_champion", title: "Champion of Aethelgard", cat: "Bestiary",
      short: "Boss · resists Physical and Holy",
      body: "The hero who comes to end your story. Resists steel and holy light alike, and heals himself mid-fight." },
},
});
