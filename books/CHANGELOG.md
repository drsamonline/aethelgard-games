# Changelog

## 1.0.2

**Fixed — the game would not start when `index.html` was opened directly.**

Double-clicking the extracted folder's `index.html` (a `file://` page) left the
title screen up but every button dead: clicking *New game*, *Continue*, anything,
did nothing. The engine read its story with `fetch()`, and browsers refuse to run
`fetch()` on `file://` — so no scenes loaded, boot aborted *before* the buttons
were wired, and the page sat there looking fine and ignoring every click.

- **The story is now embedded as plain script.** A generated `scenes/bundle.js`
  carries every scene's text (and the mod's), and `assets/sprites/index.js`
  carries the sprite list. Both load as ordinary `<script>` tags, so the game
  starts from a double-clicked file exactly as it does over http. The engine
  still falls back to `fetch()` when the bundle is absent, so nothing else changes.
- **The History panel could not be closed.** `index.html` had two elements with
  `id="backlog"`, so the panel wrote into its own frame, destroyed its Close
  button and spilled text across the screen. The scroll area is now
  `#backlog-body`; the overlay keeps its own id.

Regenerate the bundle after editing any scene:

```bash
python3 tools/make-bundle.py
```

## 1.0.1

**Fixed — the seven endings never happened.**

Every playthrough ended the same way, on **Dawn**, no matter what the reader
chose. The cause was not the ending resolver — that works — but the last chapter
of Book III. `b3-09` simply ran out of lines, so the engine fell through to the
"chapter complete" panel, and the **Next chapter** button walked straight down the
manifest into `end-dawn`. The four axes and the whole `resolveEnding()` shape
test were never consulted; the ending you got was whichever ending scene sat
first in the list.

`scenes/book-3/b3-09.scene` now ends with `@finish`, which hands the axes to the
ending resolver. A run now lands on the ending its choices actually earned —
verified across runs: *The Long Road*, *The Weight*, *The Crown's Shadow*,
*Hollow* and more, instead of *Dawn* every time.

**Also fixed (engine, shared with the Saga engine 1.0.1)**

- A **Title screen** button on the chapter-complete panel, so a run that reaches
  the end of the chapter list is never a dead end.

## 1.0.0

All 36 chapters and all 7 endings, the four axes, the diary, the mod loader.
