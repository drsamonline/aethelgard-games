/* The loser of the conflict — refused, and reported. */
window.SAGA_MODS = window.SAGA_MODS || [];
window.SAGA_MODS.push({
  id: "conflict-b", name: "Extra Chapter B", version: "1.0.0", author: "example",
  description: "Claims scenes:extra, which conflict-a already claimed.",
  impact: "additive", provides: ["scenes:extra"],
  scenes: [ { id: "mod-extra", title: "Extra Chapter", file: "mods/conflict-b/extra.scene", book: 8 } ],
});
