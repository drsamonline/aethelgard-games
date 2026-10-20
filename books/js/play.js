/* ============================================================
   SAGA ENGINE — the runner

   Walks a parsed scene node by node, renders it, and waits for the
   reader. Everything a scene can do passes through here.
   ============================================================ */
"use strict";
(function () {
const G = window.Game;

G.playing = false;
G._waiting = null;      // resolve fn for the current beat
G._typeTimer = null;

/* ---------- start / resume a scene ---------- */
G.startScene = async function (id, fromLine) {
  const sc = G.SCENES[id];
  if (!sc) { G.notify("Missing scene", id); return; }
  G.state.scene = id;
  G.state.line = fromLine || 0;
  G.playing = true;
  G.showStage(true);
  document.getElementById("chapter-title").textContent = sc.title || id;
  await G.runFrom(0);
};

G.runFrom = async function (idx) {
  const sc = G.SCENES[G.state.scene];
  if (!sc) return;
  // a scene can be registered without nodes (a manifest entry whose file failed
  // to load, or a mod that declared an id only). Degrade, never throw.
  const nodes = sc.nodes || [];
  let i = idx;

  // labels: build an index once
  const labels = {};
  nodes.forEach((n, k) => { if (n.t === "label") labels[n.name] = k; });

  while (i < nodes.length) {
    const n = nodes[i];
    G.state.line = i;

    switch (n.t) {
      case "label": break;

      case "goto": {
        if (labels[n.name] != null) { i = labels[n.name]; continue; }
        i++; continue;
      }

      case "bg":
        G.setBg(n.name);
        G.diaryPlace(n.name);
        break;

      case "mood":
        G.Music && G.Music.setMood(n.name);
        break;

      case "title":
        document.getElementById("chapter-title").textContent = n.text;
        break;

      case "card":
        G.showCard(n.who);
        break;

      case "ach":
        G.unlockAchievement(n.id);
        break;

      case "diary":
        G.diaryAdd(n.tab, n.text);
        break;

      case "if": {
        if (!G.evalCond(n.cond)) {
          // skip to the matching endif
          let depth = 1, j = i + 1;
          while (j < nodes.length && depth > 0) {
            if (nodes[j].t === "if") depth++;
            if (nodes[j].t === "endif") depth--;
            j++;
          }
          i = j; continue;
        }
        break;
      }
      case "endif": break;

      case "requires":
        if (!G.state.flags[n.flag]) { G.endScene(); return; }
        break;

      case "say": {
        G.showSpeaker(n.who, n.expr);
        G.showCard(n.who);
        G.pushHistory(G.CHARS[n.who] ? G.CHARS[n.who].name : n.who, n.text);
        await G.sayText(n.text);
        break;
      }

      case "narrate": {
        G.showSpeaker(null);
        G.pushHistory("", n.text);
        await G.sayText(n.text, true);
        break;
      }

      case "choice": {
        const picked = await G.askChoice(n.options);
        G.applyEffects(picked.effects, picked.text);
        if (picked.effects.end) { G.endScene(); return; }
        if (picked.effects.goto) {
          const target = labels[picked.effects.goto];
          if (target != null) { i = target; continue; }
        }
        break;
      }

      case "ending":
        G.state.endingsSeen[n.id] = Date.now();
        G.showEnding(n.id);
        G.save();
        return;

      case "finish":
        G.finishBooks();
        return;
    }
    i++;
    G.save();
  }

  G.endScene();
};

/* ---------- end of a scene ---------- */
G.endScene = function () {
  G.playing = false;
  G.save();
  G.showSceneEnd();
};

/* ---------- render one beat and wait ---------- */
G.sayText = function (text, isNarration) {
  return new Promise(resolve => {
    const box = document.getElementById("text-box");
    const body = document.getElementById("text-body");
    box.classList.toggle("narration", !!isNarration);
    body.classList.remove("typing");
    body.textContent = "";

    const speed = [46, 28, 14, 0][G.settings.textSpeed] != null ? [46, 28, 14, 0][G.settings.textSpeed] : 14;

    if (speed === 0) {
      body.textContent = text;
      G._waiting = resolve;
      G.setAdvanceHint(true);
      return;
    }

    body.classList.add("typing");
    let i = 0;
    clearInterval(G._typeTimer);
    G._typeTimer = setInterval(() => {
      body.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearInterval(G._typeTimer);
        G._typeTimer = null;
        body.classList.remove("typing");
        G._waiting = resolve;
        G.setAdvanceHint(true);
      }
    }, speed);

    // clicking mid-type completes the line
    G._skipType = () => {
      if (G._typeTimer) {
        clearInterval(G._typeTimer); G._typeTimer = null;
        body.textContent = text;
        body.classList.remove("typing");
        G._waiting = resolve;
        G.setAdvanceHint(true);
        return true;
      }
      return false;
    };
  });
};

G.setAdvanceHint = function (on) {
  document.getElementById("advance").classList.toggle("show", !!on);
};

/* ---------- the advance click ---------- */
G.advance = function () {
  if (!G.playing) return;
  if (G._skipType && G._skipType()) return;      // first click finishes the typing
  if (G._waiting) {
    const r = G._waiting; G._waiting = null;
    G.setAdvanceHint(false);
    r();
  }
};

/* ---------- speaker + portrait ---------- */
G.showSpeaker = function (who, expr) {
  const nameEl = document.getElementById("speaker-name");
  const port = document.getElementById("portrait");
  if (!who) {
    nameEl.textContent = "";
    port.classList.remove("show");
    return;
  }
  const c = G.CHARS[who] || { name: who };
  nameEl.textContent = c.name || who;
  const src = G.sprite("char." + who, expr) || G.sprite("player." + who, expr);
  if (src) {
    port.style.backgroundImage = `url("${src}")`;
    port.classList.add("show");
    port.dataset.who = who;
  } else {
    port.classList.remove("show");
  }
};

/* ---------- choices ---------- */
G.askChoice = function (options) {
  return new Promise(resolve => {
    const wrap = document.getElementById("choice-wrap");
    wrap.innerHTML = "";
    wrap.classList.add("show");
    document.getElementById("text-box").classList.add("hide-for-choice");
    G.setAdvanceHint(false);

    if (!options || !options.length) {         // a malformed block must never wedge the game
      wrap.classList.remove("show");
      resolve({ text:"", req:null, effects:{ axes:{}, flags:[], lore:[], ach:[], diary:[], goto:null, end:false } });
      return;
    }
    options.forEach((o, idx) => {
      const ok = G.meetsReq(o.req);
      const btn = document.createElement("button");
      btn.className = "choice" + (ok ? "" : " locked");
      btn.innerHTML = `<span class="c-text">${G.esc(o.text)}</span>` +
                      (o.req ? `<span class="c-req">${G.esc(o.req)}${ok ? "" : " — not met"}</span>` : "");
      btn.onclick = () => {
        if (!ok) { G.notify("You can't", "That option needs " + o.req + "."); return; }
        wrap.classList.remove("show");
        document.getElementById("text-box").classList.remove("hide-for-choice");
        wrap.innerHTML = "";
        resolve(o);
      };
      wrap.appendChild(btn);
    });
  });
};

/* ---------- apply a choice's effects ---------- */
G.applyEffects = function (fx, text) {
  if (!fx) return;
  for (const a in fx.axes) G.axis(a, fx.axes[a]);
  fx.flags.forEach(f => { G.state.flags[f] = true; });
  fx.lore.forEach(l => G.diaryAdd("lore", l));
  fx.ach.forEach(a => G.unlockAchievement(a));
  fx.diary.forEach(d => G.diaryAdd(d.tab, d.text));
  if (text) G.state.decisions.push({ at: G.state.scene, text });
  if (G.state.decisions.length > 200) G.state.decisions.shift();
  G.save();
};

/* ---------- diary ---------- */
G.diaryAdd = function (tab, text) {
  if (!G.state || !text) return;
  const key = tab === "people" ? "people" : tab === "places" ? "places" : tab === "decisions" ? "decisions" : "lore";
  const list = G.state[key];
  if (!Array.isArray(list)) return;
  const entry = typeof list[0] === "object" && list[0] !== null ? { text } : text;
  if (key === "decisions") return;                     // decisions are recorded by applyEffects
  if (!list.some(e => (typeof e === "string" ? e : e.text) === text)) list.push(entry);
};
G.diaryPlace = function (name) {
  const label = (G.REGIONS && G.REGIONS[name] && G.REGIONS[name].name) || name;
  G.diaryAdd("places", label);
};
G.diaryPerson = function (who) {
  const c = G.CHARS[who]; if (!c) return;
  G.diaryAdd("people", c.name + (c.role ? " — " + c.role : ""));
};

/* ---------- intro cards ---------- */
G.showCard = function (who) {
  const c = G.CHARS[who];
  if (!c || !G.state || G.state.seenCards[who]) return;
  G.state.seenCards[who] = true;
  G.diaryPerson(who);
  const el = document.getElementById("intro-card");
  const src = G.sprite("char." + who, "neutral") || G.sprite("player." + who, "neutral");
  el.innerHTML = `<div class="ic-port" style="${src ? `background-image:url('${src}')` : ""}"></div>
    <div class="ic-body"><b>${G.esc(c.name)}</b>
    ${c.role ? `<i>${G.esc(c.role)}</i>` : ""}
    <p>${G.esc(c.intro || c.desc || "")}</p></div>
    <button class="ic-close">Got it</button>`;
  el.classList.add("show");
  el.querySelector(".ic-close").onclick = () => el.classList.remove("show");
  setTimeout(() => el.classList.remove("show"), 9000);
};

/* ---------- backlog ---------- */
G.openBacklog = function () {
  const el = document.getElementById("backlog-body");
  el.innerHTML = (G.state.history.slice(-80).map(h =>
    h.who ? `<div class="bl"><b>${G.esc(h.who)}</b> ${G.esc(h.text)}</div>`
          : `<div class="bl narr">${G.esc(h.text)}</div>`).join("")) || "<p>Nothing yet.</p>";
  document.getElementById("backlog").classList.add("show");
};
})();
