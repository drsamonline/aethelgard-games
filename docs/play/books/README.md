# Aethelgard — The Books

A visual novel in three books, in 36 chapters.

> A soldier who will not stop. A healer who was left to burn. The Mire between them.

Free to play. The engine is open source (MIT); the story and artwork are the
author's own. See `LICENSE`.

---

## Play it

The game reads its own scene files over http, so serve the folder — opening
`index.html` by double-click will not work in most browsers.

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works. There is **no build step and nothing to install**. It
runs offline; even the music is synthesised in the browser.

## Controls

| | |
|---|---|
| click / space / enter | advance the text |
| **D** | the Diary |
| **B** | history |
| **S** | save |
| **Esc** | close a panel |

## How it plays

Every choice moves one of four hidden counters — **Mercy**, **Truth**, **Bonds**
and **Conviction**. You never see them while you play; they are shown, as words,
only in the Diary at the end.

The ending is not a score. It is the *shape* of those four: which one led, and
how far the four spread. There are seven, from **Dawn** at the brightest to
**Hollow** at the darkest. All seven are reachable by ordinary play — the rarest,
Dawn, takes a run where nothing is ever sacrificed.

A choice that needs a stat you do not have is shown greyed-out **with the reason
visible**. Nothing is ever hidden from you.

Your progress saves automatically and can be exported to a file and imported on
another device.

## What is here

```
index.html            the page
css/style.css         the look
js/                   the engine
scenes/               the three books, as plain text
assets/sprites/       the art
mods/                 the mod system and example mods
docs/SCENE-FORMAT.md  how to write a chapter
```

## Mods

Drop a folder into `mods/` with a `mod.js`, add a line to `mods/mods.json`, and
the game finds it. A mod can add chapters, characters, regions and achievements,
or replace existing ones.

A mod can never break a game in progress: loads are sandboxed, structural
changes apply only at boot, conflicting mods are refused with the reason shown,
and a broken mod is skipped rather than fatal. See `mods/README.md`.

The mods that ship here are examples — `example-book` is registered and adds a
chapter; the others are deliberately broken and left unregistered so you can see
the safety system refuse them if you turn them on.

## Status

**Complete.** All 36 chapters and all 7 endings are written and playable, end to
end. The prose is finished and editorially passed.

## Licence

Engine: MIT. Story and artwork: © Dr. Sohil Momin, all rights reserved. Free to
play, not free to sell. Full terms in `LICENSE`.

By Dr. Sohil Momin.
