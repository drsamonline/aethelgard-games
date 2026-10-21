<div align="center">

# ⚔️ Aethelgard — Two Games

**Two free browser games in one world — a visual novel and a fantasy RPG.**
No install, no account, no build step. Just open and play.

[![Landing page](https://img.shields.io/badge/🏰%20LANDING%20PAGE-drsamonline.github.io-6b1f2a
[![Live demo](https://img.shields.io/badge/▶%20LIVE%20DEMO-play%20both%20games-b8860b
[![The Books](https://img.shields.io/badge/📖%20The%20Books-visual%20novel-2dd4bf
[![Chronicles](https://img.shields.io/badge/⚔️%20Chronicles-RPG-8b5cf6

**Landing page:** <https://drsamonline.github.io/aethelgard-games/> · **Live demo:** <https://drsamonline.github.io/aethelgard-games/play/>

*Created by [Dr. Sohil Momin](https://github.com/drsamonline).*

</div>

---

<div align="center">


**Two free browser games in one world — a visual novel and a fantasy RPG.**
No install, no account, no build step. Just open and play.

[![Play both](https://img.shields.io/badge/▶_PLAY_BOTH-drsamonline.github.io%2Faethelgard--games-8B5CF6

[![The Books](https://img.shields.io/badge/📖_The_Books-visual_novel-2dd4bf
[![Chronicles](https://img.shields.io/badge/⚔️_Chronicles-RPG-8b5cf6

*Created by [Dr. Sohil Momin](https://github.com/drsamonline).*

</div>

---

## ▶️ Play

| | Game | What it is | Play |
|---|---|---|---|
| 📖 | **Aethelgard — The Books** | A visual novel in three books. A soldier who will not stop, a healer who was left to burn, and the Mire between them. **36 chapters · 7 endings.** Every choice moves four hidden counters; the ending is their *shape*, not a score. | **[▶ Read the story](https://drsamonline.github.io/aethelgard-games/play/books/)** |
| ⚔️ | **Aethelgard: Chronicles of Fate** | A deep, single-player fantasy RPG. **8 classes · 8 races · 2 full campaigns** (the hero's *Chronicles* and the villain's *The Crown's Shadow*), crafting, settlement building, an underworld of crime, an endless dungeon, and a wiki you can hover. Installable as an offline app. | **[▶ Enter the world](https://drsamonline.github.io/aethelgard-games/play/chronicles/)** |

Both are plain HTML, CSS and JavaScript — no server, no framework, no dependencies. They work offline once loaded.

## 🗂️ What's in this repo

This is a **deployment repo**: it holds the built, playable copies of both games so GitHub Pages can serve them.

```
index.html        the landing page that links to both games
books/            Aethelgard — The Books      (visual novel)
chronicles/       Aethelgard: Chronicles of Fate (RPG)
.nojekyll         tells GitHub Pages to serve the files as-is
```

Each game folder is a complete, self-contained static site — you can copy `books/` or `chronicles/` anywhere and serve it.

## 🧱 The engines

Both games are built on small, dependency-free engines, released on their own so you can build something else with them:

| Engine | Powers | Repository |
|---|---|---|
| **Saga** — a visual-novel engine | *The Books* | [drsamonline/AethelgardVN](https://github.com/drsamonline/AethelgardVN) |
| **Aethelgard** — a browser RPG engine | *Chronicles of Fate* | [drsamonline/Aethelgard-Engine](https://github.com/drsamonline/Aethelgard-Engine) |

## 🛠️ Run locally

Each game reads its own files over `http`, so serve the folder — opening `index.html` by double-click will not work in most browsers.

```bash
git clone https://github.com/drsamonline/aethelgard-games.git
cd aethelgard-games

# the visual novel
python3 -m http.server 8000 --directory books
#   → http://localhost:8000

# the RPG
python3 -m http.server 8001 --directory chronicles
#   → http://localhost:8001
```

## 📜 Licence

| what | licence |
|---|---|
| Both engines — code and stylesheet | **MIT** |
| The *Aethelgard* story, characters and artwork | © Dr. Sohil Momin, **all rights reserved** — free to play, not for resale |

<div align="center">

*If Aethelgard entertains you, star the repo ⭐ — it helps other adventurers find it.*

</div>
