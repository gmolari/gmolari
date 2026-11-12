// Generates <out>/stats-{dark,light}.svg from the GitHub GraphQL API.
// Runs daily in .github/workflows/profile.yml with the workflow's GITHUB_TOKEN.
// Local test: GITHUB_TOKEN=$(gh auth token) node scripts/stats.mjs dist
import { writeFileSync, mkdirSync } from "node:fs";
import { pixelText, textWidth } from "./pixelfont.mjs";
import { themes } from "./themes.mjs";

const OUT = process.argv[2] ?? "dist";
const LOGIN = process.env.PROFILE_LOGIN ?? "gmolari";
const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) throw new Error("GITHUB_TOKEN is required");

const query = `query($login: String!) {
  user(login: $login) {
    createdAt
    followers { totalCount }
    repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false, first: 100) {
      totalCount
      nodes { stargazerCount languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name color } } } }
    }
    contributionsCollection { contributionCalendar { totalContributions } }
  }
}`;

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json", "User-Agent": "profile-stats" },
  body: JSON.stringify({ query, variables: { login: LOGIN } }),
});
const json = await res.json();
if (!json.data?.user) throw new Error(JSON.stringify(json.errors ?? json));
const u = json.data.user;

const stars = u.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0);
const langs = new Map();
for (const r of u.repositories.nodes)
  for (const e of r.languages.edges) {
    const cur = langs.get(e.node.name) ?? { size: 0, color: e.node.color ?? "#8fb3ab" };
    cur.size += e.size;
    langs.set(e.node.name, cur);
  }
const total = [...langs.values()].reduce((a, l) => a + l.size, 0) || 1;
const top = [...langs.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 5);
const years = Math.max(1, new Date().getFullYear() - new Date(u.createdAt).getFullYear());

/* tiny 7×7 icons, "#" = colour */
const ICON = {
  heart: [".##.##.", "#######", "#######", ".#####.", "..###..", "...#...", "......."],
  star: ["...#...", "..###..", "#######", ".#####.", ".##.##.", "#.....#", "......."],
  chest: [".#####.", "#######", "#..#..#", "#######", "#.....#", "#######", "......."],
  people: [".#...#.", "###.###", ".#...#.", "###.###", "###.###", "###.###", "......."],
  clock: [".#####.", "#..#..#", "#..#..#", "#..##.#", "#.....#", ".#####.", "......."],
};
const icon = (name, x, y, s, fill) => {
  let d = "";
  ICON[name].forEach((row, ry) => [...row].forEach((c, rx) => c === "#" && (d += `M${x + rx * s} ${y + ry * s}h${s}v${s}h${-s}z`)));
  return `<path d="${d}" fill="${fill}"/>`;
};

const W = 840;
const H = 300;

function card(t, mode) {
  const rows = [
    ["heart", t.hp, `CONTRIBUTIONS ${new Date().getFullYear()}`, u.contributionsCollection.contributionCalendar.totalContributions],
    ["chest", t.accent, "PUBLIC REPOS", u.repositories.totalCount],
    ["star", t.accent, "STARS EARNED", stars],
    ["people", t.mp, "FOLLOWERS", u.followers.totalCount],
    ["clock", t.xp, "YEARS ON GITHUB", years],
  ];
  const rowSvg = rows
    .map(([ic, col, label, val], i) => {
      const y = 82 + i * 38;
      return `<g>${icon(ic, 44, y, 3, col)}${pixelText(label, { x: 76, y: y + 3, s: 2, fill: t.muted })}${pixelText(String(val), { x: 392, y: y - 1, s: 3, fill: t.ink, align: "end" })}<rect x="76" y="${y + 24}" width="316" height="2" fill="${t.edge}" opacity="0.6"/></g>`;
    })
    .join("");

  const langSvg = top
    .map(([name, l], i) => {
      const pct = (l.size / total) * 100;
      const y = 82 + i * 38;
      const pips = 20;
      const on = Math.max(1, Math.round((pct / 100) * pips));
      let bar = "";
      for (let p = 0; p < pips; p++) bar += `<rect x="${456 + p * 17}" y="${y + 16}" width="14" height="8" rx="1" fill="${p < on ? l.color : t.slot}" stroke="${t.frameIn}" stroke-width="1"/>`;
      return `<g>${pixelText(name, { x: 456, y: y, s: 2, fill: t.ink })}${pixelText(`${pct.toFixed(1)}%`, { x: 794, y: y, s: 2, fill: t.muted, align: "end" })}${bar}</g>`;
    })
    .join("");

  const title = (text, x) =>
    `<rect x="${x}" y="28" width="26" height="26" rx="5" fill="${t.accent}" stroke="#fff3c4" stroke-width="2"/>${pixelText("★", { x: x + 6, y: 34, s: 2, fill: "#3a2400" })}${pixelText(text, { x: x + 38, y: 34, s: 2.5, fill: t.accent })}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" role="img" aria-label="GitHub stats for ${LOGIN}">
  <defs>
    <linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.panelTop}"/><stop offset="1" stop-color="${t.panelBottom}"/></linearGradient>
    <pattern id="g" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="${t.frameOut}" stroke-opacity="0.05" stroke-width="1"/></pattern>
  </defs>
  <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="12" fill="url(#p)" stroke="${t.frameOut}" stroke-width="5"/>
  <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="12" fill="url(#g)"/>
  <rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="8" fill="none" stroke="${t.frameIn}" stroke-width="3"/>
  ${title("PLAYER STATS", 40)}
  ${title("TOP LANGUAGES", 452)}
  <rect x="424" y="34" width="2" height="230" fill="${t.edge}"/>
  ${rowSvg}
  ${langSvg}
  ${pixelText(`UPDATED ${new Date().toISOString().slice(0, 10)}`, { x: W - 40, y: H - 30, s: 1.5, fill: t.muted, align: "end", extra: 'opacity="0.8"' })}
</svg>
`;
}

mkdirSync(OUT, { recursive: true });
for (const mode of ["dark", "light"]) writeFileSync(`${OUT}/stats-${mode}.svg`, card(themes[mode], mode));
console.log(`${OUT}/stats-dark.svg, ${OUT}/stats-light.svg`, { contributions: u.contributionsCollection.contributionCalendar.totalContributions, repos: u.repositories.totalCount, stars, top: top.map(([n]) => n), textWidth: textWidth("X", 2) });
