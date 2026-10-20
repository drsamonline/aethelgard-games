# Aethelgard — Mod Authoring Guide

Mods let you change or extend Aethelgard **without touching the core files**. A mod is a single JavaScript file dropped into the `mods/` folder.

*Created by Dr. Sohil Momin.*

---

## 1. Folder structure

```
aethelgard/
├── index.html
├── js/                     ← the game engine (don't edit for a mod)
├── mods/
│   ├── index.js            ← file list used when opening from disk
│   ├── mods.json           ← file list used when served over http
│   ├── README.md           ← this file
│   ├── example-mod.js      ← a content mod
│   └── example-overhaul.js ← a story/overhaul mod
└── tools/
    └── build-mods-index.py ← regenerates the two manifests
```

A mod is **one file** in `mods/`. (If you want to split one mod across several files, make them all push to `window.AETHELGARD_MODS` with the same `id` — the game merges them.)

## 2. How mods are found (auto-discovery)

The game looks for mods automatically, in two ways:

- **Served over `http://` or `https://`** — it fetches `mods/mods.json` and loads every file listed there. This is the fully automatic path.
- **Opened directly from disk (`file://`)** — browsers forbid reading a folder listing, so the game uses `mods/index.js`, which contains the same list in `window.AETHELGARD_MOD_FILES`.

After adding a mod, run:

```bash
python3 tools/build-mods-index.py
```

That rescans `mods/` and rewrites **both** `mods/index.js` and `mods/mods.json` for you. (Or just add the filename to the array in `mods/index.js` by hand.)

## 3. The mod file format

```js
window.AETHELGARD_MODS = window.AETHELGARD_MODS || [];

window.AETHELGARD_MODS.push({
  // ---- required ----
  id:      "my-mod",              // unique, lowercase, no spaces
  name:    "My Mod",              // shown in the UI
  version: "1.0.0",
  author:  "Your Name",
  description: "One line about what this does.",

  // ---- behaviour ----
  impact: "additive",             // "additive" | "story" | "overhaul"  (see §5)
  requires: ["ENEMIES"],          // optional: data tables that must exist

  // ---- content (any you need) ----
  ENEMIES: { ... },
  GEAR: { ... },
  SIDE_QUESTS: [ ... ],
  ACHIEVEMENTS: [ ... ],
  WIKI: { ... },
  I18N: { hi: { "nav.story": "कहानी" } },   // add a language
  LANGUAGES: { hi: "हिन्दी" },

  init(G) { /* optional: runs once after the data is merged */ },
});
```

## 4. What you can add or change

**Key-by-key tables** — add a new entry, or list an existing key to *replace* it:

`ENEMIES`, `GEAR`, `ITEMS`, `ACTIVE_SKILLS`, `CLASSES`, `RACES`, `BUILDINGS`, `COMPANIONS`, `NPCS`, `GEMS`, `GEAR_SETS`, `ENDLESS_MODS`, `LOCATIONS`, `MUSIC_MOODS`, `WIKI`, `I18N`, `LANGUAGES`, `ULTIMATES`, `ELITE_AFFIXES`, `REACTIONS`, `CONSUMABLE_RECIPES`, `ACTIVITIES`, `DIFFICULTY`, `ELEMENTS`, `STATUS`, `RARITIES`, `AFFIXES`, `THEMES`, `GENDERS`.

**Arrays merged by `id`** — a new id appends, an existing id replaces:

`SIDE_QUESTS`, `ACHIEVEMENTS`, `CHAPTERS`, `EVENTS`, `WORLD_EVENTS`, `SPONTANEOUS_EVENTS`, `CLASS_MISSIONS`, `TAVERN_RUMOURS`.

**String pools** that simply gain entries: `BOUNTY_POOL`, `ENDLESS_FLOOR_POOL`.

> **Minor upgrade vs. overhaul** is just how much you touch. Adding one enemy is a minor upgrade; replacing every enemy's stats, rewriting the `CHAPTERS` array, or overriding core behaviour is an overhaul.

## 5. Impact tiers and restart safety

`impact` tells the game how dangerous your mod is:

| impact | Meaning | Applied |
|---|---|---|
| `additive` | New enemies, items, quests, wiki, achievements, languages. Cannot corrupt a save. | **Immediately** — toggling it on/off takes effect at once. |
| `story` | Changes `CHAPTERS`, quest flow, endings, or anything that shapes a playthrough. | **Only on restart.** |
| `overhaul` | Rewrites existing data or core behaviour in a big way. | **Only on restart.** |

Mods marked `story` or `overhaul` are **never applied mid-session**. If you enable one while playing, the game records your choice and shows *"restart the game to apply it"*. It loads on the next launch, so an in-progress save is never reshaped underneath you. You can also force this yourself with `requiresRestart: true`.

## 6. Enabling and disabling

- **At the start of a new game** — the character-creation screen lists every discovered mod with its tier badge, so you can pick before you begin.
- **In Settings → Mods** — toggle any mod at any time. Additive mods apply instantly; story/overhaul mods queue for the next restart.
- **Safe mode** — a switch that loads the game with **no mods at all**, and a `?safe=1` (or `?nomods`) URL parameter. Use it if a mod ever misbehaves; your save is untouched.

Disabling a mod restores the vanilla data for everything it changed, so toggling is clean and reversible.

## 7. Not breaking the game

- Every mod is loaded and applied inside a `try/catch`. A mod that throws is skipped and listed under Mods with an error — the game still starts.
- Mods are validated for `id`, `version` and declared `requires`.
- Duplicate ids are rejected.
- A broken mod file that fails to load is reported, not fatal.
- Because disabling restores a snapshot of the original data, toggling mods never leaves the game half-patched.

## 8. Graphics packs (art overhauls)

The whole game draws its art through one function, `Game.sprite(key, fallback)`. If a pack registers an image for a key, the image is used; if not, the original emoji shows. That means **a graphics overhaul is drop-in** — no engine changes, and a *partial* pack still works because anything it misses falls back automatically.

### Sprite keys the game asks for

| key | used for | example |
|---|---|---|
| `enemy.<id>` | every enemy and boss | `enemy.wolf`, `enemy.coven` |
| `class.<id>` | class portraits | `class.mage` |
| `race.<id>` | race portraits | `race.orc` |
| `player.<classId>` | your hero in combat | `player.warrior` |
| `item.<id>` | materials and consumables | `item.potion`, `item.ruby` |
| `gear.<key>` | equipment | `gear.steel_sword` |
| `loc.<id>` | regions on the maps | `loc.oakhaven` |
| `poi.<region>.<id>` | local-map points of interest | `poi.mire.lurker` |
| `companion.<id>` | companions | `companion.bryn` |
| `status.<key>` | status-effect chips | `status.poison` |
| `skill.<key>` | skill buttons | `skill.fireball` |
| `gem.<key>` / `set.<id>` / `bld.<key>` / `ach.<id>` / `ending.<id>` | gems, gear sets, buildings, achievements, endings | `gem.topaz` |

### Pack format

```js
window.AETHELGARD_MODS.push({
  id: "my-art-pack", name: "My Art Pack", version: "1.0.0", impact: "additive",
  GRAPHICS: {
    id: "my-art",                    // the pack id shown in Settings
    name: "My Art",                  // display name
    base: "mods/my-art-pack/art/",   // prefix for every src below
    scale: 1.15,                     // default size, in em
    pixel: true,                     // crisp scaling (pixel art)
    palette: { "--gold": "#f0c060" },// optional CSS variable overrides
    background: "bg.jpg",            // optional page background
    sprites: {
      "enemy.wolf": "wolf.png",                                  // simplest form
      "class.mage": { src:"heroes.png", sheet:{x:0,y:0,w:32,h:32}, scale:2 },  // a cell from a sheet
      "player.mage": { src:"heroes.png", sheet:{x:0,y:0,w:32,h:32}, frames:4, fps:8 }, // animated (sheet laid out horizontally)
    },
  },
});
```

- **Simple** — a string is an image path.
- **Sheet** — `sheet:{x,y,w,h}` crops one cell out of a larger image.
- **Animated** — add `frames` and `fps`; the sheet is read left-to-right from `sheet.x`.
- A missing or broken image **falls back to the emoji** on its own, so a bad path never breaks the UI.

### Choosing a pack

Players pick a pack in **Settings → Graphics pack** (or leave it on *Default (emoji)*). A pack can also switch itself on in its `init(G)` with `G.applyGraphicsPack("my-art")`.

### Worked example

Three packs ship with the game:

- **`mods/ai-art/`** — AI-generated art imported with `tools/import-ai-art.py`: **104 assets** — every creature, class, race, companion, item, gear piece and gem, plus a painted backdrop for all eight regions (the page background changes as you travel), the title screen, the world map and the battlefield. Importing with `--key R,G,B` keys out a second background colour — needed when the subject sits on a coloured panel over a plain page.

- **`mods/example-graphics/`** — 59 flat PNG pictograms, generated by `tools/make-example-sprites.py`. A simple template.
- **`mods/overhaul-vector/`** — 102 illustrated **SVG** models (layered shapes, gradients, shading, outlines) covering every enemy, boss, class, race, item, gear piece, gem, status and region. Generated by `tools/make-overhaul-art.py`, which is the reference for building a full art overhaul.

### Vector art (SVG)

SVG works exactly like any other image — just point a sprite at a `.svg`. It stays crisp at every size, which is ideal for a game that renders the same model at 20px and 46px. Set `pixel: false` in the pack so the browser does not try to pixelate it. Both generators in `tools/` are good starting points: run one, look at the output, then replace it with your own art.

## 9. Compatibility — what works together, what clashes

The game checks every enabled mod against every other and reports the result in **Settings → Mods**:

- **✓ All N enabled mods work together** — no problems.
- **⚠ overlaps** — two mods write the same entry. Both still load; the later one wins. Informational.
- **✗ problems** — a mod cannot load, and it is skipped so the game keeps working.

The per-mod card shows its own badge (**✓ works / ⚠ overlap / ✗ incompatible**) with the reason, and the panel lists the resolved **load order**.

### Declaring relationships

```js
window.AETHELGARD_MODS.push({
  id: "my-addon", name: "My Add-on", version: "1.0",

  requiresMods:     ["base-mod"],        // hard dependency — won't load without it
  loadAfter:        ["base-mod"],        // load order
  loadBefore:       ["other-mod"],
  conflicts:        ["rival-mod"],       // neither may be enabled at once
  provides:         ["art:vector"],      // capability tokens this mod offers
  requiresProvides: ["art:vector"],      // …and ones it needs from some other mod
  requires:         ["ENEMIES"],         // core data tables that must exist
  exclusive:        ["ENEMIES.wolf"],    // keys this mod owns outright

  ENEMIES: { … },
});
```

### What each check means

| check | result |
|---|---|
| `requiresMods` not installed, or installed but switched off | **error** — the mod is blocked |
| `conflicts` with an enabled mod | **error** — and it is symmetric, so *both* are blocked |
| `requiresProvides` with no enabled mod offering that token | **error** |
| `requires` a data table that does not exist | **error** |
| Two mods write the same key | **warning** (last wins) |
| …unless one declares it in `exclusive` | **error** |
| Circular `loadAfter` chain | **warning** — falls back to discovery order |

Blocked mods are listed at the bottom of the panel with their reasons, and the rest of the game loads normally. Nothing a mod declares can stop the game starting.

## 10. Adding a language (example)

The game ships in English only. To add another language as a mod:

```js
window.AETHELGARD_MODS.push({
  id: "lang-hi", name: "Hindi translation", version: "1.0", impact: "additive",
  LANGUAGES: { hi: "हिन्दी" },
  I18N: { hi: {
    "nav.story": "कहानी",
    "nav.hero": "नायक",
    // …every key you want to translate; anything missing falls back to English
  } },
});
```

The language picker appears in Settings automatically once more than one language exists.

## 11. Worked examples

Six mods ship in `mods/` to show the different shapes a mod can take:

| mod | impact | shows |
|---|---|---|
| `example-mod.js` | additive | a new enemy, item and side quest |
| `example-addon.js` | additive | `requiresMods` + `loadAfter` — a mod that depends on another |
| `example-class.js` | additive | **a whole new playable class** — `CLASSES`, `ACTIVE_SKILLS`, `CLASS_MISSIONS`, `WIKI` |
| `story-expansion.js` | story | **a campaign expansion** — three chapters, two regions, new foes; auto-resumes from your save |
| `villain-arc.js` | overhaul | **a whole second game** — the five bosses become playable classes, the heroes become enemies |
| `example-graphics/` | additive | a flat PNG art pack |
| `overhaul-vector/` | additive | an illustrated SVG art pack |

### Writing an expansion that picks up from an existing save

`advanceChapter` walks the chapter list by position, and `storyResume` runs when a save is loaded. If the player has already finished the base story and your mod added chapters after it, they are dropped straight into the next new chapter **with their level, gear, gold and quests intact** — you do not need to do anything beyond declaring the chapters. Regions open with `unlock:{ chapter: N }`, `level: N` or `flag: "…"`.

### Declaring a game mode

A mod can register a whole **separate game** rather than an addition to this one:

```js
MODE: {
  id: "villain",
  name: "The Crown's Shadow",
  desc: "Shown under the picker on the title screen.",
  startDesc: "Replaces the headline on the title screen.",
  classes: ["coven_leader", "iron_warden"],   // only these are offered
  heroesHidden: true,
  titleBg: "bg.villain",                      // optional title backdrop
}
```

The mode appears on the title screen as soon as the mod is discovered. While a
**different** mode is active the mod contributes **nothing at all** — its
chapters, classes and enemies are not applied, so two games cannot bleed into
each other. Save slots are namespaced by mode automatically, so the same slot
number can hold a different character in each game.

Switching mode reloads the page, because different content has to be loaded.

### Writing an overhaul

Set `impact: "overhaul"` for a mod that changes the game itself rather than adding to it. `villain-arc.js` is the worked example: it replaces chapters 1–5 outright (a chapter with the same `id` replaces the original), adds five classes built from boss art, and turns the eight hero classes into enemies. Give it `exclusive: ["mode:villain"]` so two overhaul mods cannot fight over the same ground.

### Giving your content art

Two options. `GRAPHICS` registers a **selectable art pack** (the player picks it in Settings). `SPRITES` adds art that **rides along with whichever pack is selected** — use this when your mod adds creatures and you want them drawn no matter what the player chose. Either way a `class.*` sprite automatically answers `player.*`, so a class built from boss art shows up correctly on the hero sheet.

Each of the two story mods keeps its own art in its own folder:

```
mods/story-expansion/sprites/    The Hollow Crown  — foes, regions, POIs
mods/villain-arc/sprites/        The Crown's Shadow — villains, heroes
```

so a mod stays self-contained and can be removed cleanly. `tools/import-mod-art.py`
does the cut-out and routes each file to the right folder automatically.

### Writing a story mod

`advanceChapter` walks the chapter list **by position**, and skips chapters that have no `objective` (the "Open World" sentinel). So you can append a real chapter after the sentinel and it will still be played before the open world opens up. Give it any `id` you like — progression does not depend on the id.

## 12. Testing your mod

1. Add the file to `mods/`.
2. Run `python3 tools/build-mods-index.py`.
3. Reload the game. Your mod appears in **Settings → Mods** and on the new-game screen.
4. Watch the browser console — load and apply errors are logged with the mod's id.
5. If something breaks, turn on **Safe mode** and reload; then fix and try again.

## Restricting a mod to one game

If your mod belongs to one campaign only, say so — otherwise its chapters and
quests are loaded into **both** games and the two stories run into each other.

```js
window.AETHELGARD_MODS.push({
  id: "my-expansion",
  name: "My Expansion",
  mode: "chronicles",        // only load in Chronicles
  // ... rest of the mod
});
```

| value | meaning |
|---|---|
| `"chronicles"` | the hero campaign only |
| `"villain"` | The Crown's Shadow only |
| omitted | loads in every game — correct for generic content like new enemies, items or art |

Declaring a whole `MODE` is different: that *creates* a new game, and the mod's
content is then only applied while that game is active. Use `mode` when you are
adding to an existing game, and `MODE` when you are creating one.

## Checking your mod

Open **Settings → Diagnostics → Run content check**. It verifies that every
chapter, quest, enemy, spawn, drop, status and element your mod refers to
actually exists and can be reached — the errors that otherwise show up as a
chapter you cannot finish. The same check is available as
`tools/validate-content.js` and `Game.validateContent()`.

## Restricting a mod to one game

If your mod belongs to one campaign only, say so — otherwise its chapters and
quests are loaded into **both** games and the two stories run into each other.

```js
window.AETHELGARD_MODS.push({
  id: "my-expansion",
  name: "My Expansion",
  mode: "chronicles",        // only load in Chronicles
  // ... rest of the mod
});
```

| value | meaning |
|---|---|
| `"chronicles"` | the hero campaign only |
| `"villain"` | The Crown's Shadow only |
| omitted | loads in every game — correct for generic content like new enemies, items or art |

Declaring a whole `MODE` is different: that *creates* a new game, and the mod's
content is then only applied while that game is active. Use `mode` when you are
adding to an existing game, and `MODE` when you are creating one.

## Checking your mod

Open **Settings → Diagnostics → Run content check**. It verifies that every
chapter, quest, enemy, spawn, drop, status and element your mod refers to
actually exists and can be reached — the errors that otherwise show up as a
chapter you cannot finish. The same check is available as
`tools/validate-content.js` and `Game.validateContent()`.
