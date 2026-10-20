/* ============================================================
   SAGA ENGINE — characters, regions, expressions

   The cast, mapped to the art that actually exists in the pack.
   `sprite` names a file in assets/sprites. A missing portrait
   degrades to the name only — it never breaks a scene.

   Expressions: the pack has one image per character, so the
   expression is carried by the name line and the tint, not by
   a second file. When expression art is generated later, drop
   `bryn_angry.webp` beside `bryn.webp` and it is picked up
   automatically — no code change.
   ============================================================ */
"use strict";
(function () {
const G = window.Game;

G.EXPRESSIONS = ["neutral","warm","angry","grieving","startled","wounded","resolute","afraid","gentle","dry"];

G.CHARS = {
  /* ---- the three leads ---- */
  corin: { name:"Corin", role:"a soldier", sprite: "corin",
    intro:"Youngest in Oakhaven's militia. Not the strongest, not the cleverest — the one who will not stop." },
  bryn:  { name:"Bryn", role:"an old soldier", sprite: "bryn",
    intro:"Discharged twelve years ago and never explained it. Lives on the edge of the Mire. Never says sorry." },
  cael:  { name:"Cael", role:"a healer", sprite: "cael",
    intro:"Was a hedge healer in the Mire. The only one who would treat the ones the Order wrote off." },

  /* ---- Book I ---- */
  marek:  { name:"Marek", role:"militia", sprite: "marek",
    intro:"Three years older, five years in the militia, and funny in a way that only lands a second later." },
  dane:   { name:"Sergeant Dane", role:"militia", sprite: "dane",
    intro:"Corin's sergeant. Shouts early and asks later, which has kept his men alive through three bad winters." },
  maeve:  { name:"Sister Maeve", role:"a healer", sprite: "maeve",
    intro:"Sixty, bad hip, sleeves always rolled up. Tells people the truth at the end of things. Never lies." },
  warden: { name:"The Warden", role:"the Order", sprite: "warden",
    intro:"Fifty, grey, and correct. Has burned thirty-one villages and written down every name." },
  iven:   { name:"Iven", role:"a refugee", sprite: "iven",
    intro:"Walked from Kells with her son and stood in the rain at the eastern line." },
  tam:    { name:"Tam", role:"a child", sprite: "tam",
    intro:"Iven's son. Holds on to his mother's coat when told to." },
  marta:  { name:"Marta Osric", role:"a widow", sprite: "marta",
    intro:"Married to Osric for forty-one years. Waited six days outside the shrine." },
  osric:  { name:"Osric", role:"a roofer", sprite: "osric",
    intro:"Sixty. Built half the roofs in the Hollow." },
  sera:   { name:"Sera", role:"a mother", sprite: "sera",
    intro:"Two children, both recovered." },
  nessa:  { name:"Nessa", role:"eleven years old", sprite: "nessa",
    intro:"Carried water for Maeve until four days ago." },
  petra:  { name:"Petra", role:"a patient", sprite: "petra",
    intro:"Had the Fever three miles north of the Hollow." },

  /* ---- not people ---- */
  ilsa:   { name:"Ilsa", role:"seven years old", sprite: "ilsa",
    intro:"Cael's daughter. Made him a cushion. Could always tell when she was being lied to." },
  faceless: { name:"—", role:"", sprite:"assassin", intro:"" },
  dog:    { name:"the dog", role:"", sprite:"wolf",
    intro:"One ear. Found them first at Sallow's Rest. Does not lie." },
  voice:  { name:"—", role:"", sprite:"", intro:"" },
};

/* The world. `bg` is the file to draw; several places share one painting
   until more are made — add bg_hollow.webp and point this at it. */
G.REGIONS = {
  oakhaven:  { name:"Oakhaven",          bg:"bg_cottage" },
  mire:      { name:"the Mire",          bg:"bg_field" },
  hollow:    { name:"the Hollow",        bg: "bg_hollow" },
  cottage:   { name:"Maeve's cottage",   bg: "bg_cottage" },
  blackhouse:{ name:"the black house",   bg: "bg_blackhouse" },
  shrine:    { name:"the shrine",        bg: "bg_shrine" },
  eastline:  { name:"the eastern line",  bg: "bg_eastline" },
  field:     { name:"the field",         bg: "bg_field" },
  crossing:  { name:"the crossing",      bg: "bg_crossing" },
  ashford:   { name:"Ashford",           bg: "bg_ashford" },
  kestrel:   { name:"Kestrel",           bg: "bg_kestrel" },
  mountains: { name:"the mountains",     bg:"bg_mountains" },
  ruins:     { name:"the ruins",         bg:"bg_ruins" },
  temple:    { name:"the temple",        bg:"bg_temple" },
  banditcamp:{ name:"the bandit camp",   bg:"bg_banditcamp" },
  cave:      { name:"the caves",         bg:"bg_cave" },
  depths:    { name:"the deep places",   bg: "bg_deep" },
  combat:    { name:"—",                 bg:"bg_combat" },
};

/* ==========================================================================
   GAME CONTENT — this is the game's, not the engine's.

   The engine ships with an empty achievement list and a placeholder title.
   Everything specific to Aethelgard lives here, so the engine stays reusable
   and the story stays the author's.
   ========================================================================== */

G.TITLE = "Aethelgard";
G.SLUG  = "aethelgard";

G.ACHIEVEMENTS = {
  the_one_who_got_up:   { name: "The One Who Got Up",  desc: "You got up in the square at Sallow's Rest." },
  read_the_room:        { name: "Read the Room",       desc: "You let a silence do the work." },
  over_the_rope:        { name: "Over the Rope",       desc: "You stepped over the rope at the eastern line." },
  arithmetic:           { name: "Arithmetic",          desc: "You were the youngest in the room, and you chose." },
  finest_cushion:       { name: "The Finest Cushion in the Mire", desc: "You asked what he asked for." },
  the_long_night:       { name: "The Arithmetic",      desc: "You got nine people out of the Hollow." },
  the_pen_and_question: { name: "The Pen and the Question", desc: "You refused the pen and asked why you." },
  eleven_years:         { name: "Eleven Years",        desc: "You let Bryn have the silence." },
  richest_man:          { name: "The Richest Man in the Mire", desc: "You asked for her voice first." },
  the_awakening:        { name: "The Awakening",       desc: "You took the mark, and opened your hand." },
  have_we_met:          { name: "Have We Met",         desc: "You saved Kestrel and lost Bryn." },
  four_axes:            { name: "How It Starts",       desc: "You refused the deal in the field." },
  da:                   { name: "Da",                  desc: "He heard her voice." },
  the_last_dawn:        { name: "The Last Dawn",       desc: "You finished all three books." },
};

G.defaultState = (function (orig) {
  return function (slot) { const s = orig(slot); s.name = "Corin"; return s; };
})(G.defaultState);
})();
