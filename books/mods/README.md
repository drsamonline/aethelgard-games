# Mods

Drop a folder in here, add one line to `mods.json`, and the engine finds it.

```json
[
  { "id": "example-book", "file": "mods/example-book/mod.js" }
]
```

The engine loads mods **before the first scene**, and reports every one it found,
loaded, refused or failed — in Settings → Mods.

## What a mod can do

```js
window.AETHELGARD_MODS = window.AETHELGARD_MODS || [];
window.AETHELGARD_MODS.push({
  id: "my-mod",
  name: "My Mod",
  version: "1.0.0",
  author: "you",
  description: "one line about it",
  impact: "additive",           // or "overhaul" — overhauls apply at boot only
  provides: ["scenes:my-chapter"],
  requiresMods: [],             // refuse to load unless these are on
  loadAfter: [],                // deterministic ordering
  scenes:       [ { id:"mod-x", title:"X", file:"mods/my-mod/x.scene", book:1 } ],
  after:        "b1-10",        // place the chapter after this scene id; if the
                                // anchor is not in this game, it simply goes last
  chars:        { "newguy": { name:"New Guy", role:"", sprite:"wanderer" } },
  regions:      { "newplace": { name:"the new place", bg:"bg_hall" } },
  achievements: { "mod_ach": { name:"Did It", desc:"You did it." } },
  init(G) { /* optional; runs last, wrapped in try/catch */ }
});
```

A mod can **add** to the game or **replace** an existing entry — assign over
`G.CHARS`, `G.REGIONS`, `G.ACHIEVEMENTS` or push onto `G.SCENE_ORDER`.

## The five safety rules

A mod must never be able to break a game that is already running.

1. **Every load is wrapped in try/catch.** A mod that throws is refused with a
   reason; the game carries on.
2. **Structural mods apply at boot only.** Scenes, cast and regions are read
   once, before play. A mod that changes structure is marked *applies on
   restart* and never mutates a session in progress.
3. **`requiresMods` is honoured.** A mod that needs another will not load
   without it, and says so.
4. **Conflicts are detected and visible.** Two mods claiming the same
   `provides` are a conflict: the first wins, the second is refused, and the
   report names both.
5. **`loadAfter` orders deterministically**, so the same set of mods always
   loads the same way.

## The example mods

| folder | what it shows |
|---|---|
| `example-book` | **registered by default.** Adds a chapter, a character, a region and an achievement |
| `conflict-a`, `conflict-b` | both claim `scenes:extra` — the second is refused. Register both to see it |
| `broken-mod` | declares a scene that would overwrite an existing one — refused |

The last three are deliberately broken and are **not** registered, so the demo
runs clean. To see the safety system work, add them to `mods.json`:

```json
[
  { "id": "example-book", "file": "mods/example-book/mod.js" },
  { "id": "conflict-a",   "file": "mods/conflict-a/mod.js" },
  { "id": "conflict-b",   "file": "mods/conflict-b/mod.js" },
  { "id": "broken-mod",   "file": "mods/broken-mod/mod.js" }
]
```

Then open Settings → Mods. The report will show one conflict and one refusal,
with the reason for each.
