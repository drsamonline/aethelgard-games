#!/usr/bin/env python3
"""Rebuild assets/sprites/index.json.

Run this after adding or removing any image. The engine reads the index so it
can resolve a portrait by name without knowing the filenames ahead of time.
"""
import json, pathlib, sys
d = pathlib.Path(__file__).resolve().parent.parent / "assets" / "sprites"
if not d.exists():
    print("no assets/sprites folder next to this script"); sys.exit(1)
files = sorted(p.name for p in d.iterdir() if p.is_file() and p.name != "index.json")
(d / "index.json").write_text(json.dumps(files))
print(f"indexed {len(files)} files")
