
window.AETHELGARD_MODS = window.AETHELGARD_MODS || [];

window.AETHELGARD_MODS.push({
  id: "class-runeblade",
  name: "Runeblade Class",
  version: "1.0.0",
  author: "Dr. Sohil Momin",
  description: "A new hybrid class: a spellblade who charges their blade with runes.",
  impact: "additive",
  provides: ["class:runeblade"],

  CLASSES: {
    runeblade: {
      name: "Runeblade", emoji: "🗡️", role: "Hybrid", color: "#7ad0ff",
      desc: "A spellblade who carves runes into their weapon and strikes with both steel and sorcery.",
      blurb: "+3 Might, +3 Sorcery, +10 HP — balanced, and every third strike burns.",
      bonus: { might: 3, sorcery: 3, finesse: 1 }, hp: 10, def: 0, critDmg: 0.1,
      startGear: { weapon: "steel_sword", armor: "leather_armor" },
},
},

  ACTIVE_SKILLS: {
    rune_slash: { name: "Rune Slash", emoji: "⚡", cls: "runeblade", lvl: 1, cost: 9, cd: 3,
      kind: "dmg", mult: 1.8, element: "fire", desc: "A rune-lit strike that burns with fire." },
    rune_ward:  { name: "Rune Ward", emoji: "🔷", cls: "runeblade", lvl: 4, cost: 8, cd: 5,
      kind: "buff", status: "shield", desc: "Raise a rune ward: +50% defence for 3 turns." },
    sever:      { name: "Sever Rune", emoji: "🗡️", cls: "runeblade", lvl: 7, cost: 13, cd: 4,
      kind: "dot", status: "bleed", mult: 1.3, desc: "A deep cut that leaves the wound bleeding." },
},

  CLASS_MISSIONS: [
    { id: "cm_run_1", cls: "runeblade", name: "First Inscription",
      desc: "Prove the runes answer you — defeat 4 Cave Bats.",
      objective: { type: "kill", target: "bat", required: 4 },
      rewards: { gold: 160, xp: 190 }, unlocks: ["Runeblade skill: Rune Ward"],
      prepare: ["Bats are weak to Fire — Rune Slash burns them",
                "They dodge often; Finesse helps you land hits",
                "Keep 10+ energy for a Rune Slash each turn"] },
    { id: "cm_run_2", cls: "runeblade", name: "The Severed Rune",
      desc: "Cut down the Iron Warden and claim its core.",
      objective: { type: "kill", target: "warden", required: 1 },
      rewards: { gold: 400, xp: 480, items: { relic: 1 } },
      unlocks: ["Runeblade title: Runesmith"],
      prepare: ["The Warden resists Physical — bring Fire",
                "Rune Ward halves its Sunder",
                "Full HP and 2 potions before you enter"] },
],

  WIKI: {
    class_runeblade: { key: "class_runeblade", title: "Runeblade", cat: "Classes",
      short: "Hybrid melee / magic class (mod)",
      body: "Added by the Runeblade Class mod. A spellblade who inscribes runes onto their blade, mixing physical strikes with fire and bleed effects." },
    skill_rune_slash: { key: "skill_rune_slash", title: "Rune Slash", cat: "Skills",
      short: "Fire strike (Runeblade)",
      body: "A rune-lit strike that deals Fire damage. Strong against anything weak to fire, and it ignites the wound." },
},
});
