/* Claims the same scene id as conflict-b. One of them will be refused,
   and the report will say which two and why. */
window.SAGA_MODS = window.SAGA_MODS || [];
window.SAGA_MODS.push({
  id: "conflict-a", name: "Extra Chapter A", version: "1.0.0", author: "example",
  description: "Claims scenes:extra. So does conflict-b.",
  impact: "additive", provides: ["scenes:extra"],
  scenes: [ { id: "mod-extra", title: "Extra Chapter", file: "mods/conflict-a/extra.scene", book: 8 } ],
});
