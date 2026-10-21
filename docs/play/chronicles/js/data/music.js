
"use strict";
window.Game = window.Game || {};

const MUSIC_MOODS = {
  calm:       { name:"Calm",        root:196.00, scale:[0,2,4,7,9],  bpm:58,  wave:"sine",     bass:"sine",     pad:true,  perc:false, density:0.35, brightness:0.55, swing:0.15 },
  town:       { name:"Town",        root:261.63, scale:[0,2,4,5,7,9], bpm:84,  wave:"triangle", bass:"triangle", pad:true,  perc:false, density:0.5,  brightness:0.7,  swing:0.25 },
  mysterious: { name:"Mysterious",  root:174.61, scale:[0,1,3,5,7,8], bpm:66,  wave:"sine",     bass:"sine",     pad:true,  perc:false, density:0.3,  brightness:0.35, swing:0.1 },
  tense:      { name:"Tense",       root:220.00, scale:[0,1,3,5,6,8], bpm:126, wave:"square",   bass:"sawtooth", pad:false, perc:true,  density:0.75, brightness:0.6,  swing:0 },
  boss:       { name:"Boss",        root:146.83, scale:[0,1,3,4,6,8], bpm:148, wave:"sawtooth", bass:"sawtooth", pad:false, perc:true,  density:0.9,  brightness:0.5,  swing:0 },
  epic:       { name:"Epic",        root:164.81, scale:[0,2,3,5,7,8], bpm:104, wave:"triangle", bass:"triangle", pad:true,  perc:true,  density:0.65, brightness:0.75, swing:0.1 },
  somber:     { name:"Somber",      root:130.81, scale:[0,2,3,5,7,10],bpm:52,  wave:"sine",     bass:"sine",     pad:true,  perc:false, density:0.28, brightness:0.3,  swing:0.2 },
  danger:     { name:"Danger",      root:207.65, scale:[0,1,4,6,8],   bpm:118, wave:"square",   bass:"sawtooth", pad:false, perc:true,  density:0.7,  brightness:0.45, swing:0 },
  victory:    { name:"Victory",     root:293.66, scale:[0,4,7,9,11],  bpm:112, wave:"triangle", bass:"triangle", pad:true,  perc:false, density:0.6,  brightness:0.85, swing:0.2 },
};

const MUSIC_BY_LOCATION = {
  oakhaven:"town", temple:"calm", mire:"mysterious", cave:"mysterious",
  mountains:"epic", banditcamp:"danger", ruins:"somber",
};
const MUSIC_COMBAT = "tense";
const MUSIC_BOSS = "boss";
const MUSIC_START = "calm";

Object.assign(window.Game, { MUSIC_MOODS, MUSIC_BY_LOCATION, MUSIC_COMBAT, MUSIC_BOSS, MUSIC_START });
