// The World on 24 November 2026 in One Image
// A deterministic, dependency-free picture program for Node 22.
// It paints a front-page collage whose hero story is the Shenzhou-24
// launch that carried the first Pakistani astronaut toward Tiangong,
// ringed by the other verified headlines of Tuesday 24 November 2026.
// Running it twice yields exactly the same PNG bytes: no clock, no
// network, no randomness beyond a fixed-seed arithmetic sequence.

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const W = 1024;
const H = 1024;
const px = new Uint8Array(W * H * 4);

type Rgb = [number, number, number];
const INK: Rgb = [16, 20, 34];
const PAPER: Rgb = [244, 238, 222];
const CREAM: Rgb = [232, 222, 196];
const RED: Rgb = [198, 48, 49];
const GOLD: Rgb = [232, 178, 60];
const SKY: Rgb = [24, 52, 96];
const DEEP: Rgb = [8, 12, 26];
const TEAL: Rgb = [38, 138, 133];
const GREEN: Rgb = [46, 139, 87];
const WHITE: Rgb = [250, 250, 246];
const GREY: Rgb = [148, 156, 172];
const ORANGE: Rgb = [238, 118, 44];
const BLUE: Rgb = [62, 118, 196];

function paint(x: number, y: number, c: Rgb, a = 255): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
  px[i + 3] = a;
}

function rect(x: number, y: number, w: number, h: number, c: Rgb): void {
  for (let yy = y; yy < y + h; yy++)
    for (let xx = x; xx < x + w; xx++) paint(xx, yy, c);
}

function frame(x: number, y: number, w: number, h: number, c: Rgb, t: number): void {
  rect(x, y, w, t, c);
  rect(x, y + h - t, w, t, c);
  rect(x, y, t, h, c);
  rect(x + w - t, y, t, h, c);
}

function disc(cx: number, cy: number, r: number, c: Rgb): void {
  for (let yy = cy - r; yy <= cy + r; yy++)
    for (let xx = cx - r; xx <= cx + r; xx++) {
      const dx = xx - cx;
      const dy = yy - cy;
      if (dx * dx + dy * dy <= r * r) paint(xx, yy, c);
    }
}

function ring(cx: number, cy: number, r: number, c: Rgb, t: number): void {
  for (let yy = cy - r - t; yy <= cy + r + t; yy++)
    for (let xx = cx - r - t; xx <= cx + r + t; xx++) {
      const d = Math.sqrt((xx - cx) ** 2 + (yy - cy) ** 2);
      if (d >= r - t && d <= r + t) paint(xx, yy, c);
    }
}

function line(x0: number, y0: number, x1: number, y1: number, c: Rgb, t = 3): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let s = 0; s <= steps; s++) {
    const x = Math.round(x0 + ((x1 - x0) * s) / steps);
    const y = Math.round(y0 + ((y1 - y0) * s) / steps);
    for (let oy = -t; oy <= t; oy++)
      for (let ox = -t; ox <= t; ox++)
        if (ox * ox + oy * oy <= t * t) paint(x + ox, y + oy, c);
  }
}

function tri(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, c: Rgb): void {
  const minX = Math.max(0, Math.min(x0, x1, x2));
  const maxX = Math.min(W - 1, Math.max(x0, x1, x2));
  const minY = Math.max(0, Math.min(y0, y1, y2));
  const maxY = Math.min(H - 1, Math.max(y0, y1, y2));
  const den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2);
  if (den === 0) return;
  for (let y = minY; y <= maxY; y++)
    for (let x = minX; x <= maxX; x++) {
      const a = ((y1 - y2) * (x - x2) + (x2 - x1) * (y - y2)) / den;
      const b = ((y2 - y0) * (x - x2) + (x0 - x2) * (y - y2)) / den;
      const g = 1 - a - b;
      if (a >= 0 && b >= 0 && g >= 0) paint(x, y, c);
    }
}

// A compact 5x7 bitmap alphabet, drawn by hand for this entry.
const GLYPH: Record<string, string[]> = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".####", "#....", "#....", "#.###", "#...#", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: [".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", ".#.#.", "..#..", "..#..", "..#..", ".#.#.", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "0": [".###.", "#..##", "#.#.#", "##..#", "#...#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", "..#..", "..#..", "..#.."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
  "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
  ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
  ",": [".....", ".....", ".....", ".....", ".##..", ".##..", ".#..."],
  ":": [".....", ".##..", ".##..", ".....", ".##..", ".##..", "....."],
  "/": ["....#", "....#", "...#.", "..#..", ".#...", "#....", "#...."],
  "'": ["..#..", "..#..", ".#...", ".....", ".....", ".....", "....."],
  "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
  "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
  "&": [".##..", "#..#.", "#.#..", ".#...", "#.#.#", "#..#.", ".##.#"],
};

function textWidth(s: string, scale: number): number {
  return s.length === 0 ? 0 : s.length * 6 * scale - scale;
}

function drawText(x: number, y: number, s: string, scale: number, c: Rgb): void {
  let cx = x;
  for (const ch of s.toUpperCase()) {
    const g = GLYPH[ch] ?? GLYPH[" "];
    for (let r = 0; r < 7; r++)
      for (let col = 0; col < 5; col++)
        if (g[r][col] === "#") rect(cx + col * scale, y + r * scale, scale, scale, c);
    cx += 6 * scale;
  }
}

function centered(y: number, s: string, scale: number, c: Rgb): void {
  drawText(Math.round((W - textWidth(s, scale)) / 2), y, s, scale, c);
}

// ---- backdrop: a night sky fading downward, fixed-seed stars ----
for (let y = 0; y < H; y++) {
  const t = y / H;
  const c: Rgb = [
    Math.round(DEEP[0] + (INK[0] - DEEP[0]) * t),
    Math.round(DEEP[1] + (INK[1] - DEEP[1]) * t),
    Math.round(DEEP[2] + (INK[2] - DEEP[2]) * t),
  ];
  rect(0, y, W, 1, c);
}
let seed = 987654321;
function nextRand(): number {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}
for (let i = 0; i < 260; i++) {
  const sx = Math.floor(nextRand() * W);
  const sy = Math.floor(nextRand() * 430);
  const sz = nextRand() > 0.85 ? 3 : 2;
  rect(sx, sy, sz, sz, nextRand() > 0.5 ? WHITE : CREAM);
}

// ---- masthead ----
rect(28, 24, 968, 118, PAPER);
frame(28, 24, 968, 118, GOLD, 4);
centered(42, "THE WORLD IN ONE IMAGE", 6, INK);
centered(102, "TUESDAY 24 NOVEMBER 2026", 3, RED);

// ---- hero panel: Shenzhou-24 climbs to Tiangong ----
rect(28, 158, 968, 408, SKY);
frame(28, 158, 968, 408, PAPER, 3);
// Earth curve along the hero floor
for (let x = 28; x < 996; x++) {
  const lift = Math.round(26 * Math.sin(((x - 28) / 968) * Math.PI));
  for (let y = 566 - lift; y < 566; y++) paint(x, y, TEAL);
  paint(x, 566 - lift, WHITE);
}
// orbital station: a beam, two panel wings and a docking hub
rect(648, 196, 268, 14, CREAM);
rect(664, 176, 62, 54, BLUE);
rect(826, 176, 62, 54, BLUE);
disc(782, 203, 24, GOLD);
disc(782, 203, 11, ORANGE);
rect(770, 210, 24, 34, CREAM);
// rocket body on a diagonal climb, flame below it
line(300, 470, 430, 300, WHITE, 13);
line(430, 300, 452, 268, RED, 10);
tri(408, 322, 372, 356, 430, 348, RED);
tri(438, 330, 470, 366, 410, 356, RED);
disc(404, 344, 9, SKY);
tri(286, 486, 316, 452, 338, 492, ORANGE);
tri(292, 500, 310, 470, 326, 502, GOLD);
for (let i = 0; i < 7; i++) line(250 - i * 6, 500 + i * 4, 300, 478, GREY, 2);
// crescent moon
disc(120, 214, 30, CREAM);
disc(138, 204, 26, SKY);
// hero caption block
rect(48, 470, 560, 80, INK);
drawText(64, 482, "SHENZHOU-24 LIFTS OFF", 4, GOLD);
drawText(64, 518, "FIRST PAKISTANI ASTRONAUT TO TIANGONG", 2, WHITE);
drawText(500, 178, "CHINA + PAKISTAN CREW OF 3", 2, CREAM);

// ---- three story panels in the middle row ----
function panel(x: number, y: number, w: number, accent: Rgb, lines: string[], foot: string): void {
  rect(x, y, w, 196, PAPER);
  rect(x, y, w, 14, accent);
  let ly = y + 30;
  for (const s of lines) {
    drawText(x + 18, ly, s, 3, INK);
    ly += 34;
  }
  drawText(x + 18, y + 158, foot, 2, accent);
}
panel(28, 582, 312, RED,
  ["NVIDIA CHIEF", "HUANG BACK IN", "11 DAYS - AND", "AI STOCKS SLIDE"],
  "BOARD UNDER SCRUTINY");
panel(356, 582, 312, BLUE,
  ["UKRAINE DRONES", "HIT A RUSSIAN", "WARSHIP OFF", "BENGHAZI, LIBYA"],
  "WAR REACHES FURTHER");
panel(684, 582, 312, GREEN,
  ["14 NATIONS BACK", "ICJ RULING ON", "ROHINGYA", "GENOCIDE"],
  "MYANMAR - SANCTIONS");

// ---- lower row: three compact briefs ----
function brief(x: number, accent: Rgb, a: string, b: string, c: string): void {
  rect(x, 794, 312, 104, INK);
  frame(x, 794, 312, 104, accent, 3);
  drawText(x + 16, 810, a, 2, GOLD);
  drawText(x + 16, 840, b, 2, WHITE);
  drawText(x + 16, 866, c, 2, GREY);
}
brief(28, GOLD, "US TARIFFS LOOM", "CHINA, EU + 14 MORE", "EXCESS CAPACITY PROBE");
brief(356, TEAL, "HUAWEI CONVICTED", "TRADE-SECRET PLOT", "US JURY VERDICT");
brief(684, ORANGE, "NEPAL QUAKE 5.6", "NEAR CHINA BORDER", "KOSHI PROVINCE");

// ---- footer ticker with the rest of the day ----
rect(28, 914, 968, 82, RED);
centered(930, "25 HELD IN CARTAGENA - UN SEEKS AI LIMITS IN A YEAR", 2, WHITE);
centered(962, "HASINA SETS 16 DEC RETURN TO BANGLADESH", 2, CREAM);

// ---- PNG encoding, standard library only ----
const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let v = n;
  for (let k = 0; k < 8; k++) v = v & 1 ? 0xedb88320 ^ (v >>> 1) : v >>> 1;
  CRC_TABLE[n] = v;
}
function crc32(buf: Uint8Array): number {
  let v = 0xffffffff;
  for (let i = 0; i < buf.length; i++) v = CRC_TABLE[(v ^ buf[i]) & 0xff] ^ (v >>> 8);
  return (v ^ 0xffffffff) >>> 0;
}
function chunk(kind: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = kind.charCodeAt(i);
  out.set(data, 8);
  const signed = out.subarray(4, 8 + data.length);
  view.setUint32(8 + data.length, crc32(signed));
  return out;
}
const raw = new Uint8Array((W * 4 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 4 + 1)] = 0;
  raw.set(px.subarray(y * W * 4, (y + 1) * W * 4), y * (W * 4 + 1) + 1);
}
const ihdr = new Uint8Array(13);
const ihdrView = new DataView(ihdr.buffer);
ihdrView.setUint32(0, W);
ihdrView.setUint32(4, H);
ihdr[8] = 8;
ihdr[9] = 6;
const pngParts = [
  new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", new Uint8Array(0)),
];
const total = pngParts.reduce((n, p) => n + p.length, 0);
const png = new Uint8Array(total);
let offset = 0;
for (const part of pngParts) {
  png.set(part, offset);
  offset += part.length;
}
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.png"), png);
console.log(`wrote ${join(outDir, "entry.png")} (${png.length} bytes)`);
