// Inventory item cards (slot + project icon + pixel name + rarity), like the portfolio's inventory.
// Generates assets/items/<id>-{dark,light}.svg from assets/projects/<id>.svg — run: node scripts/items.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { pixelText } from "./pixelfont.mjs";
import { themes } from "./themes.mjs";

export const ITEMS = [
  { id: "gamification-loop", name: "GAMIFICATION LOOP", rarity: "legendary" },
  { id: "gamification-bko", name: "GAMIFICATION BACK OFFICE", rarity: "legendary" },
  { id: "game-lab", name: "AD MONETIZATION ENGINE", rarity: "legendary" },
  { id: "pgx-ui", name: "PGX UI", rarity: "epic" },
  { id: "supernova-bet", name: "SUPERNOVA BET", rarity: "epic" },
  { id: "sweepstakes", name: "SWEEPSTAKES", rarity: "epic" },
  { id: "vortexvolley", name: "VORTEXVOLLEY", rarity: "epic" },
  { id: "bigette", name: "BIGETTE FOTOS E VIDEOS", rarity: "epic" },
  { id: "citybuilder", name: "CITYBUILDER", rarity: "uncommon" },
];

const RARITY = {
  dark: { legendary: "#ff9f43", epic: "#b98cff", uncommon: "#7bd36a" },
  light: { legendary: "#c45f00", epic: "#7a4cc7", uncommon: "#3a8a2c" },
};

const W = 200;
const H = 172;
const S = 1.75; // pixel size of the label font
const MAX_CHARS = Math.floor((W - 28) / (6 * S));

/** Greedy word wrap into at most two lines. */
function wrap(text) {
  const lines = [""];
  for (const word of text.split(" ")) {
    const cur = lines[lines.length - 1];
    if (!cur) lines[lines.length - 1] = word;
    else if ((cur + " " + word).length <= MAX_CHARS) lines[lines.length - 1] = cur + " " + word;
    else lines.push(word);
  }
  return lines.slice(0, 2);
}

function card(item, mode) {
  const t = themes[mode];
  const rc = RARITY[mode][item.rarity];
  const icon = readFileSync(`assets/projects/${item.id}.svg`, "utf8").replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const lines = wrap(item.name);
  const labelY = lines.length === 1 ? 110 : 102;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" role="img" aria-label="${item.name} — ${item.rarity}">
  <defs>
    <linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.panelTop}"/><stop offset="1" stop-color="${t.panelBottom}"/></linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.38" r="0.6"><stop offset="0" stop-color="${rc}" stop-opacity="0.28"/><stop offset="1" stop-color="${rc}" stop-opacity="0"/></radialGradient>
    <pattern id="g" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0V12" fill="none" stroke="${t.frameOut}" stroke-opacity="0.06" stroke-width="1"/></pattern>
  </defs>
  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="10" fill="url(#p)" stroke="${rc}" stroke-width="4"/>
  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="10" fill="url(#g)"/>
  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="10" fill="url(#glow)"/>
  <rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="6" fill="none" stroke="${t.frameIn}" stroke-width="2"/>
  <svg x="${W / 2 - 34}" y="16" width="68" height="68" viewBox="0 0 32 32">${icon}</svg>
  ${lines.map((l, i) => pixelText(l, { x: W / 2, y: labelY + i * 17, s: S, fill: t.ink, align: "middle" })).join("\n  ")}
  ${pixelText(item.rarity.toUpperCase(), { x: W / 2, y: H - 28, s: 1.5, fill: rc, align: "middle" })}
</svg>
`;
}

mkdirSync("assets/items", { recursive: true });
for (const item of ITEMS) for (const mode of ["dark", "light"]) writeFileSync(`assets/items/${item.id}-${mode}.svg`, card(item, mode));
console.log(`${ITEMS.length * 2} item cards`);
