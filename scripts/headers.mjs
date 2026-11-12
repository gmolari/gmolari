// Section title bars, same as the portfolio windows: gold icon badge + pixel title + checkered rule.
// Generates assets/headers/<id>-{dark,light}.svg — run: node scripts/headers.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { pixelText, textWidth } from "./pixelfont.mjs";
import { themes } from "./themes.mjs";

// 9×9 glyphs copied from the portfolio's <Glyph> set. "#" main, "+" highlight.
const GLYPH = {
  shield: ["#########", "#+#######", "#+###.###", "#+##...##", ".#+##.##.", ".#######.", "..#####..", "...###...", "....#...."],
  bolt: [".....###.", "....###..", "...###...", "..######.", ".....##..", "....##...", "...##....", "..##.....", ".#......."],
  scroll: [".#######.", "#+######.", ".#.....#.", ".#.###.#.", ".#.....#.", ".#.###.#.", ".#.....#.", ".######+#", ".#######."],
  bag: ["...###...", "..#...#..", "..#####..", ".#######.", "#+#######", "#+##.####", "#########", "#########", ".#######."],
  star: ["....#....", "....#....", "...#+#...", "####+####", ".#######.", "..#####..", "..##.##..", ".##...##.", "#.......#"],
  mail: [".........", "#########", "##.....##", "#.#...#.#", "#..#.#..#", "#...#...#", "#.......#", "#########", "........."],
};

const HEADERS = [
  ["character", "shield", "CHARACTER SHEET"],
  ["skills", "bolt", "SKILL TREE"],
  ["quests", "scroll", "QUEST LOG · WORK EXPERIENCE"],
  ["inventory", "bag", "INVENTORY · PROJECTS"],
  ["party", "mail", "JOIN THE PARTY"],
];

const W = 840;
const H = 52;

function header(t, glyph, title) {
  const s = 3;
  let d = "";
  let dh = "";
  GLYPH[glyph].forEach((row, y) =>
    [...row].forEach((c, x) => {
      const r = `M${10 + x * s} ${9 + y * s}h${s}v${s}h${-s}z`;
      if (c === "#") d += r;
      if (c === "+") dh += r;
    }),
  );
  const tx = 56;
  const tw = textWidth(title, 3);
  const ruleX = tx + tw + 18;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a3"/><stop offset="1" stop-color="${t.accent}"/></linearGradient>
    <pattern id="rule" width="8" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="${t.edge}"/><rect x="4" y="2" width="4" height="2" fill="${t.edge}"/></pattern>
  </defs>
  <rect x="3" y="3" width="40" height="40" rx="7" fill="url(#gold)" stroke="#fff3c4" stroke-width="3"/>
  <rect x="1" y="1" width="44" height="44" rx="9" fill="none" stroke="${t.frameIn}" stroke-width="2"/>
  <path d="${d}" fill="#3a2400"/><path d="${dh}" fill="#8a5a08"/>
  ${pixelText(title, { x: tx, y: 13, s: 3, fill: t.accent })}
  <rect x="${ruleX}" y="21" width="${Math.max(0, W - ruleX - 4)}" height="4" fill="url(#rule)"/>
</svg>
`;
}

mkdirSync("assets/headers", { recursive: true });
for (const [id, glyph, title] of HEADERS)
  for (const mode of ["dark", "light"]) writeFileSync(`assets/headers/${id}-${mode}.svg`, header(themes[mode], glyph, title));
console.log(HEADERS.map((h) => h[0]).join(", "));
