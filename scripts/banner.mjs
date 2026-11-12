// Generates assets/banner-{dark,light}.svg — run: node scripts/banner.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { pixelText, pixelTitle } from "./pixelfont.mjs";
import { themes } from "./themes.mjs";

const W = 1280;
const H = 340;

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function hills(step, base, amp, phase) {
  let pts = `0,${H} `;
  let prev = base;
  for (let x = 0; x <= W; x += step) {
    const y = Math.round(base - amp * (0.5 + 0.5 * Math.sin(x / 90 + phase) * Math.cos(x / 210 + phase * 2)));
    pts += `${x},${prev} ${x},${y} `;
    prev = y;
  }
  return pts + `${W},${prev} ${W},${H}`;
}

function banner(t, mode) {
  seed = 7;
  const stars = Array.from({ length: 46 }, () => {
    const x = Math.round(rnd() * (W - 40)) + 20;
    const y = Math.round(rnd() * 200) + 18;
    const s = rnd() > 0.82 ? 4 : 2;
    const dur = (2 + rnd() * 3).toFixed(1);
    const begin = (-rnd() * 4).toFixed(1);
    return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${t.star}"><animate attributeName="opacity" values="0.15;1;0.15" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></rect>`;
  }).join("");

  const sparkle = (x, y, d) =>
    `<g fill="${t.accent}"><rect x="${x}" y="${y - 8}" width="4" height="20"/><rect x="${x - 8}" y="${y}" width="20" height="4"/><animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="${d}s" repeatCount="indefinite"/></g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" role="img" aria-label="Guilherme Molari — Senior Software Engineer. Full stack: web, mobile and games.">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.bgTop}"/><stop offset="1" stop-color="${t.bgBottom}"/></linearGradient>
    <pattern id="dither" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="${t.dither}" opacity="${t.ditherOp}"/><rect x="2" y="2" width="2" height="2" fill="${t.dither}" opacity="${t.ditherOp}"/></pattern>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="${t.frameOut}" stroke-opacity="0.06" stroke-width="2"/></pattern>
    <clipPath id="frame"><rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="14"/></clipPath>
  </defs>
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    <rect width="${W}" height="${H}" fill="url(#dither)"/>
    ${mode === "dark" ? stars : ""}
    <polygon points="${hills(16, H - 40, 70, 0.4)}" fill="${t.hillFar}"/>
    <polygon points="${hills(12, H - 12, 40, 2.1)}" fill="${t.hillNear}"/>
  </g>
  <rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="14" fill="none" stroke="${t.frameOut}" stroke-width="6"/>
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="9" fill="none" stroke="${t.frameIn}" stroke-width="4"/>

  ${sparkle(96, 70, 0)}${sparkle(1176, 64, 0.8)}${sparkle(1150, 236, 1.6)}${sparkle(118, 232, 1.2)}

  ${pixelTitle("GUILHERME MOLARI", { x: W / 2, y: 62, s: 9, fill: t.accent, shadow1: t.shadow1, shadow2: t.shadow2, align: "middle" })}
  ${pixelText("SENIOR SOFTWARE ENGINEER · FULL STACK", { x: W / 2, y: 166, s: 4, fill: t.ink, align: "middle" })}
  ${pixelText("WEB · MOBILE · GAMES · GAMIFICATION", { x: W / 2, y: 204, s: 3, fill: t.muted, align: "middle" })}
  <g>${pixelText("▶ PRESS START", { x: W / 2, y: 252, s: 4, fill: mode === "dark" ? t.ink : t.frameOut, align: "middle" })}<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/></g>
</svg>
`;
}

mkdirSync("assets", { recursive: true });
for (const mode of ["dark", "light"]) writeFileSync(`assets/banner-${mode}.svg`, banner(themes[mode], mode));
console.log("assets/banner-dark.svg, assets/banner-light.svg");
