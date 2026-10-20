/* A working mod: adds one chapter between Book I ch10 and Book II ch1.
   Demonstrates every additive capability — a scene, a character, a region,
   an achievement, and an init() hook. */
window.SAGA_MODS = window.SAGA_MODS || [];
window.SAGA_MODS.push({
  id: "example-book",
  name: "The Wintering",
  version: "1.0.0",
  author: "example",
  description: "A short added chapter: the winter Corin spends in the Mire after Book I.",
  impact: "additive",
  provides: ["scenes:the-wintering"],
  loadAfter: [],
  after: "b1-10",        // a Book I chapter sits after Book I ch10 (ignored if absent)
  scenes: [ { id: "mod-wintering", title: "The Wintering", file: "mods/example-book/wintering.scene", book: 1 } ],
  chars: {
    "halla": { name: "Halla", role: "a trapper", sprite: "sylva",
               intro: "Keeps to the north edge of the Mire. Trades in pelts and information." }
  },
  regions: { "northmire": { name: "the north Mire", bg: "bg_mountains" } },
  achievements: { "mod_wintering": { name: "The Wintering", desc: "You stayed through the cold." } },
  // placement is declarative now (`after`), so no init() is needed here.
  // Kept as a working example of the hook for mods that need one.
  init(G) { /* nothing to do */ },
});
