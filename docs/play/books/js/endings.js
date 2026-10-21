"use strict";
(function () {
const G = window.Game;

/* The axes only move a little in any one run, so absolute thresholds cannot tell
   two runs apart — what separates them is the SHAPE: which axis led, and how far
   the four spread. This reads the shape. */
G.axisShape = function () {
  const a = (G.state && G.state.axes) || {};
  const v = {}; G.AXES.forEach(k => v[k] = a[k] || 0);
  const vals = G.AXES.map(k => v[k]);
  const max = Math.max(...vals), min = Math.min(...vals);
  // fixed priority for ties, so a tie always resolves the same way
  const PRI = ["mercy", "truth", "bonds", "conviction"];
  const sorted = [...G.AXES].sort((x, y) => (v[y] - v[x]) || (PRI.indexOf(x) - PRI.indexOf(y)));
  const s = { v, max, min, spread: max - min,
              sum: vals.reduce((x, y) => x + y, 0), top: sorted[0] };
  G.AXES.forEach(k => { s[k] = v[k]; s[k + "_top2"] = sorted.indexOf(k) <= 1; });
  s.countDown = G.AXES.filter(k => v[k] < 0).length;
  return s;
};

/* Best to darkest; first rule that matches wins. */
G.resolveEnding = function () {
  const s = G.axisShape();
  const f = (G.state && G.state.flags) || {};

  if (f.hollow || f.refused_everything || s.sum === 0) return "hollow";  // refused everything
  if (s.min >= 8) return "dawn";                                         // every axis high
  // silence = you never committed to anything. The choices are generous, so the
  // lowest max a real run can reach is 6 — a "max <= 5" test was mathematically
  // impossible and silence could never be reached. Read total engagement instead.
  // silence = you never committed to anything. Keyed on TOTAL engagement: a run
  // that picks the smallest movement at every turn still lands around sum 23, so
  // any per-axis ceiling shut it out. This is the only rule that reads the sum.
  // silence = never committed: BOTH a low total AND no axis ever climbing. The sum
  // alone was wrong — a run that drives conviction to 25 while draining mercy also
  // has a low sum, and that is The Crown's Shadow, not Silence.
  if (s.sum <= 26 && s.max <= 10) return "silence";                      // never committed
  if (s.spread <= 3 && s.max < 8) return "ash";                          // a balanced, ordinary run

  switch (s.top) {
    case "mercy":      return "long_road";                               // mercy carried it
    case "bonds":      return s.mercy >= 6 ? "long_road" : "ash";        // bonds with mercy
    case "truth":      return "weight";                                  // truth, and its cost
    case "conviction": return s.mercy < 4 ? "crown" : "weight";          // conviction alone
  }
  return "ash";
};

G.ENDING_SCENE = { dawn:"end-dawn", long_road:"end-long_road", weight:"end-weight",
                   ash:"end-ash", crown:"end-crown", silence:"end-silence", hollow:"end-hollow" };
G.ENDING_NAMES = { dawn:"Dawn", long_road:"The Long Road", weight:"The Weight", ash:"Ash",
                   crown:"The Crown's Shadow", silence:"Silence", hollow:"Hollow" };
G.ENDING_LADDER = ["dawn","long_road","weight","ash","crown","silence","hollow"];

G.finishBooks = function () {
  const id = G.resolveEnding(), scene = G.ENDING_SCENE[id] || "end-ash";
  if (G.state) { G.state.endingsSeen[id] = Date.now(); G.save(); }
  if (G.SCENES && G.SCENES[scene]) { G.startScene(scene); return id; }
  G.showEnding(id); return id;
};

G.axisSummary = function () {
  const s = G.axisShape();
  return G.AXES.map(k => {
    const l = k === s.top ? "high" : s[k] < 0 ? "low" : "middling";
    return `${G.AXIS_INFO[k].name}: ${l}`; }).join(" · ");
};
})();
