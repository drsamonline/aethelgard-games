/* ============================================================
   SAGA ENGINE — the scene script parser

   Turns a plain-text .scene file into a list of instructions.
   See docs/SCENE-FORMAT.md. Nothing here needs a build step.
   ============================================================ */
"use strict";
(function () {
const G = window.Game;

/* A parsed scene is an array of nodes:
   { t:"say", who, expr, text }        spoken line
   { t:"narrate", text }
   { t:"bg", name } | { t:"mood", name } | { t:"title", text }
   { t:"card", who } | { t:"diary", tab, text } | { t:"ach", id }
   { t:"label", name } | { t:"goto", name }
   { t:"if", cond } | { t:"endif" }
   { t:"choice", options:[ { text, req, effects } ] }
   { t:"ending", id }
*/

G.SCENES = {};          // id -> { id, title, nodes, source }
G.SCENE_ORDER = [];

/* ---- effect parsing: "mercy+1, flag:x, goto:y" ---- */
G.parseEffects = function (raw) {
  const out = { axes: {}, flags: [], lore: [], ach: [], goto: null, end: false, diary: [] };
  if (!raw) return out;
  raw.split(",").forEach(part => {
    const s = part.trim(); if (!s) return;
    let m;
    if ((m = s.match(/^(mercy|truth|bonds|conviction)\s*([+-])\s*(\d+)$/))) {
      out.axes[m[1]] = (m[2] === "-" ? -1 : 1) * Number(m[3]);
    }
    else if ((m = s.match(/^flag:\s*(.+)$/)))  out.flags.push(m[1].trim());
    else if ((m = s.match(/^lore:\s*(.+)$/)))  out.lore.push(m[1].trim());
    else if ((m = s.match(/^ach:\s*(.+)$/)))   out.ach.push(m[1].trim());
    else if ((m = s.match(/^diary:\s*(\w+)\s+(.+)$/))) out.diary.push({ tab: m[1], text: m[2] });
    else if ((m = s.match(/^goto:\s*(.+)$/)))  out.goto = m[1].trim();
    else if (s === "end") out.end = true;
    else if ((m = s.match(/^(\w+):\s*(.+)$/))) out.flags.push(m[2].trim());   // bare "lore: x" style
  });
  return out;
};

/* ---- a choice option:  * [Finesse 2] "text" => effects ---- */
G.parseOption = function (line) {
  let s = line.replace(/^\s*\*\s*/, "").trim();
  let req = null;
  const rm = s.match(/^\[([^\]]+)\]\s*/);
  if (rm) {
    req = rm[1].trim();
    s = s.slice(rm[0].length);
  }
  let text = s, effectsRaw = "";
  const arrow = s.lastIndexOf("=>");
  if (arrow >= 0) { text = s.slice(0, arrow).trim(); effectsRaw = s.slice(arrow + 2).trim(); }
  text = text.replace(/^["'“]|["'”]$/g, "");
  return { text, req, effects: G.parseEffects(effectsRaw) };
};

/* ---- parse a whole file ---- */
G.parseScene = function (src, id) {
  const nodes = [];
  const lines = src.split("\n");
  let i = 0;
  let title = null;

  while (i < lines.length) {
    let raw = lines[i++];
    const line = raw.replace(/\s+$/, "");
    const trim = line.trim();
    if (!trim) continue;
    if (trim.startsWith("#")) continue;

    // ---- choice block ----
    if (trim === "choice" || trim.startsWith("choice")) {
      const options = [];
      while (i < lines.length) {
        const l = lines[i++];
        const t = l.trim();
        if (!t) continue;
        if (t === "end" || t === "endchoice") break;
        if (t.startsWith("*")) options.push(G.parseOption(l));
      }
      nodes.push({ t: "choice", options });
      continue;
    }

    // ---- @-instructions ----
    if (trim.startsWith("@")) {
      const sp = trim.indexOf(" ");
      const cmd = (sp < 0 ? trim.slice(1) : trim.slice(1, sp)).toLowerCase();
      const rest = sp < 0 ? "" : trim.slice(sp + 1).trim();
      switch (cmd) {
        case "scene":   break;                                   // id comes from the filename
        case "title":   title = rest; break;
        case "bg":      nodes.push({ t: "bg", name: rest }); break;
        case "mood":    nodes.push({ t: "mood", name: rest }); break;
        case "card":    nodes.push({ t: "card", who: rest }); break;
        case "ach":     nodes.push({ t: "ach", id: rest }); break;
        case "label":   nodes.push({ t: "label", name: rest }); break;
        case "goto":    nodes.push({ t: "goto", name: rest }); break;
        case "if":      nodes.push({ t: "if", cond: rest }); break;
        case "endif":   nodes.push({ t: "endif" }); break;
        case "ending":  nodes.push({ t: "ending", id: rest }); break;
        case "finish":  nodes.push({ t: "finish" }); break;
        case "requires":nodes.push({ t: "requires", flag: rest }); break;
        case "diary": {
          const m = rest.match(/^(\w+)\s+([\s\S]+)$/);
          if (m) nodes.push({ t: "diary", tab: m[1], text: m[2] });
          break;
        }
        default: break;                                          // unknown @-cmd is ignored, never fatal
      }
      continue;
    }

    // ---- narration ----
    if (trim.toLowerCase().startsWith("narrate ")) {
      nodes.push({ t: "narrate", text: trim.slice(8).trim() });
      continue;
    }
    if (trim.startsWith(">")) {                                  // shorthand narration
      nodes.push({ t: "narrate", text: trim.slice(1).trim() });
      continue;
    }

    // ---- spoken line:  who expr text ----  (expr optional)
    // A spoken line is  who [expr] text.  Recognise it when the first word is a
    // known character OR the second word is a known expression — so a typo'd
    // character name still becomes a line of dialogue rather than being dumped
    // into the story as raw text. (The old test was a mangled boolean that only
    // matched lines containing a colon, which is how typos leaked through.)
    const m = trim.match(/^([a-z_][\w]*)\s+([a-z_][\w]*)?\s*([\s\S]+)$/i);
    const _who = m && m[1].toLowerCase();
    const _expr = m && (m[2] || "").toLowerCase();
    const _isSay = m && ((G.CHARS && G.CHARS[_who]) ||
                         (G.EXPRESSIONS && G.EXPRESSIONS.includes(_expr)));
    if (_isSay) {
      const who = m[1].toLowerCase();
      const maybeExpr = (m[2] || "").toLowerCase();
      const hasExpr = G.EXPRESSIONS && G.EXPRESSIONS.includes(maybeExpr);
      const expr = hasExpr ? maybeExpr : "neutral";
      const text = hasExpr ? (m[3] || "") : ((m[2] || "") + " " + (m[3] || "")).trim();
      if (G.CHARS && !G.CHARS[who]) (G.diag.unknownSpeakers = G.diag.unknownSpeakers || []).push(who);
      nodes.push({ t: "say", who, expr, text: text.replace(/^["'“]|["'”]$/g, "") });
      continue;
    }
    // ---- anything else is narration (forgiving) ----
    nodes.push({ t: "narrate", text: trim });
  }

  return { id, title, nodes };
};

/* ---- load every scene file the manifest lists ---- */
G.loadScenes = async function () {
  const man = G.SCENE_MANIFEST || [];
  for (const entry of man) {
    try {
      const res = await fetch(entry.file);
      if (!res.ok) throw new Error(res.status);
      const src = await res.text();
      const s = G.parseScene(src, entry.id);
      s.title = s.title || entry.title || entry.id;
      s.book = entry.book || 1;
      G.SCENES[entry.id] = s;
      G.SCENE_ORDER.push(entry.id);
    } catch (e) {
      G.diag.errors.push("scene failed: " + entry.file + " (" + e.message + ")");
    }
  }
  return Object.keys(G.SCENES).length;
};

/* ---- condition evaluation for @if ---- */
G.evalCond = function (cond) {
  const s = G.state; if (!s) return false;
  cond = cond.trim();
  let m;
  if ((m = cond.match(/^flag:\s*(.+)$/))) return !!s.flags[m[1].trim()];
  if ((m = cond.match(/^!(.+)$/))) return !G.evalCond(m[1]);
  if ((m = cond.match(/^(\w+)\s*(>=|<=|>|<|==)\s*(-?\d+)$/))) {
    const v = s.axes[m[1]] || 0, n = Number(m[3]);
    return m[2] === ">=" ? v >= n : m[2] === "<=" ? v <= n : m[2] === ">" ? v > n : m[2] === "<" ? v < n : v === n;
  }
  if ((m = cond.match(/^(\w+)\s*(>=|<=|>|<)\s*(\w+)$/))) {
    const a = s.axes[m[1]] || 0, b = s.axes[m[3]] || 0;
    return m[2] === ">=" ? a >= b : m[2] === "<=" ? a <= b : m[2] === ">" ? a > b : a < b;
  }
  if ((m = cond.match(/^book\s*(>=|<=|>|<|==)\s*(\d+)$/))) {
    const v = s.book, n = Number(m[2]);
    return m[1] === ">=" ? v >= n : m[1] === "<=" ? v <= n : m[1] === ">" ? v > n : m[1] === "<" ? v < n : v === n;
  }
  return false;
};

/* ---- a requirement like "Finesse 2" — this game has no stats to grind, so a
        requirement is a flag or an axis; anything else is treated as flavour
        and always passes (the Magium rule: never hide what you missed) ---- */
G.meetsReq = function (req) {
  if (!req) return true;
  const s = G.state; if (!s) return false;
  const m = req.match(/^(\w+)\s+(\d+)$/);
  if (m) {
    const key = m[1].toLowerCase(), n = Number(m[2]);
    if (G.AXES.includes(key)) return (s.axes[key] || 0) >= n;
    return !!s.flags[req.replace(/\s+/g, "_").toLowerCase()];
  }
  return !!s.flags[req.trim().toLowerCase()];
};
})();
