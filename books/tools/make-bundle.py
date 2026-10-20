#!/usr/bin/env python3
"""SAGA ENGINE — bundle the story into plain JS so the game runs anywhere.

The engine reads its scenes with fetch(), which the browser blocks when
index.html is opened straight from the filesystem (file://). This writes:

    scenes/bundle.js            every scene's source, as JS strings
    assets/sprites/index.js     the sprite list, as a JS array

Both are plain <script> files, so the game boots from a double-clicked file
just as it does over http. The engine still falls back to fetch() if these
are absent, so nothing else changes.

Run from the game folder:

    python3 tools/make-bundle.py
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".")

# ---------- the manifest ----------
manifest = (ROOT / "scenes" / "manifest.js").read_text(encoding="utf-8")
entries = []
for block in re.finditer(r"\{[^{}]*\}", manifest):
    b = block.group(0)
    m_id = re.search(r'id\s*:\s*"([^"]+)"', b)
    m_file = re.search(r'file\s*:\s*"([^"]+)"', b)
    if m_id and m_file:
        entries.append((m_id.group(1), m_file.group(1)))

# ---------- the scenes ----------
sources, missing = {}, []
for sid, rel in entries:
    p = ROOT / rel
    if p.exists():
        sources[sid] = p.read_text(encoding="utf-8")
    else:
        missing.append(rel)

# ---------- mods: the list, each mod's source, and the scenes they add ----------
mod_sources, mod_list, mod_sources_js = {}, [], {}
mj = ROOT / "mods" / "mods.json"
if mj.exists():
    try:
        for item in json.loads(mj.read_text(encoding="utf-8")):
            js_rel = item["file"] if isinstance(item, dict) else item
            if isinstance(item, dict):
                mod_list.append(item)
            else:
                mod_list.append({"id": js_rel, "file": "mods/" + js_rel})
            jp = ROOT / js_rel
            if not jp.exists():
                continue
            mod_sources_js[js_rel] = jp.read_text(encoding="utf-8")
            for rel in set(re.findall(r'"([^"]+\.scene)"', jp.read_text(encoding="utf-8"))):
                sp = ROOT / rel
                if sp.exists():
                    mod_sources[rel] = sp.read_text(encoding="utf-8")
    except Exception as e:
        print("  ! could not read mods.json:", e)

# ---------- the sprites ----------
sprite_dir = ROOT / "assets" / "sprites"
sprites = []
if sprite_dir.exists():
    sprites = sorted(p.name for p in sprite_dir.iterdir()
                     if p.is_file() and p.suffix.lower() in (".webp", ".png", ".jpg", ".jpeg", ".gif", ".svg"))

def js_string(s):
    # JSON strings are valid JS; escape </ so it can never close the <script>
    return json.dumps(s, ensure_ascii=False).replace("</", "<\\/")

HEADER = ("/* SAGA ENGINE — {what} (generated).\n"
          "   Regenerate with:  python3 tools/make-bundle.py\n"
          "   Plain <script> data, so the game also runs from file:// where fetch() is blocked. */\n"
          'window.Game = window.Game || {{}};\n')

# ---------- write scenes/bundle.js ----------
out = [HEADER.format(what="embedded scene data"), "window.Game.SCENE_SOURCES = {\n"]
for sid, _ in entries:
    if sid in sources:
        out.append("  %s: %s,\n" % (js_string(sid), js_string(sources[sid])))
out.append("};\n\nwindow.Game.MOD_SCENE_SOURCES = {\n")
for rel, src in sorted(mod_sources.items()):
    out.append("  %s: %s,\n" % (js_string(rel), js_string(src)))
out.append("};\n\nwindow.Game.MOD_LIST = [\n")
for m in mod_list:
    out.append("  %s,\n" % js_string(m))
out.append("];\n\nwindow.Game.MOD_SOURCES = {\n")
for rel, src in sorted(mod_sources_js.items()):
    out.append("  %s: %s,\n" % (js_string(rel), js_string(src)))
out.append("};\n")
(ROOT / "scenes" / "bundle.js").write_text("".join(out), encoding="utf-8")

# ---------- write assets/sprites/index.js ----------
sp = [HEADER.format(what="embedded sprite list"), "window.Game.SPRITE_LIST = [\n"]
for name in sprites:
    sp.append("  %s,\n" % js_string(name))
sp.append("];\n")
(sprite_dir / "index.js").write_text("".join(sp), encoding="utf-8")

print("scenes bundled:  %d  (%d mod scene(s), %d mod file(s))" % (len(sources), len(mod_sources), len(mod_sources_js)))
print("sprites bundled: %d" % len(sprites))
print("wrote scenes/bundle.js and assets/sprites/index.js")
if missing:
    print("  !! scene files listed but not found:", missing)
