/* Deliberately broken: a scene with no file, and a scene that would overwrite
   a base-game chapter. The validator must refuse this and leave the game fine. */
window.SAGA_MODS = window.SAGA_MODS || [];
window.SAGA_MODS.push({
  id: "broken-mod", name: "Broken Mod", version: "0.0.1", author: "example",
  description: "Missing a scene file, and tries to overwrite Book I chapter 1.",
  impact: "additive",
  scenes: [
    { id: "mod-missing", title: "Nowhere", file: "mods/broken-mod/does-not-exist.scene" },
    { id: "end-dawn", title: "HIJACKED", file: "mods/broken-mod/hijack.scene" }
  ],
});
