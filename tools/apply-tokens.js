// Application ciblée des jetons d'encre (DESIGN-TOKENS.md §6.1) — passe #2
// Remplace UNIQUEMENT les contextes « texte » (propriété `color:`), jamais les
// bordures / fonds / ombres qui portent la couleur de marque décorative.
'use strict';
const fs = require('fs');
const FILE = 'index.html';
let src = fs.readFileSync(FILE, 'utf8');
const log = [];

function sub(label, re, rep, expected) {
  const before = src;
  src = src.replace(re, rep);
  const n = (before.match(re) || []).length;
  log.push([label, n, expected]);
}

// (?<![-\w]) évite de transformer `border-color:` / `background-color:` / `--x-color:`
const C = String.raw`(?<![-\w])color\s*:\s*`;

/* --- A. Hex -> jeton d'encre ------------------------------------------------ */
sub('A1 #E91E63 en texte -> --magenta-ink', new RegExp(C + '#E91E63\\b', 'gi'), 'color: var(--magenta-ink)', 14);
sub('A2 #FF8C00 en texte -> --orange-ink',  new RegExp(C + '#FF8C00\\b', 'gi'), 'color: var(--orange-ink)', 13);
sub('A3 #E65100 en texte -> --orange-deep-ink', new RegExp(C + '#E65100\\b', 'gi'), 'color: var(--orange-deep-ink)', 2);
sub('A4 #0A66C2 en texte -> --li-ink', new RegExp(C + '#0A66C2\\b', 'gi'), 'color: var(--li-ink)', 1);

/* --- B. Jetons décoratifs -> jetons d'encre (contexte clair) ---------------- */
sub('B1 var(--magenta) en texte -> --magenta-ink', new RegExp(C + 'var\\(--magenta\\)', 'g'), 'color: var(--magenta-ink)', null);
sub('B2 var(--orange) en texte -> --orange-ink',   new RegExp(C + 'var\\(--orange\\)', 'g'),  'color: var(--orange-ink)', null);
sub('B3 var(--gris) en texte -> --gris-ink',       new RegExp(C + 'var\\(--gris\\)', 'g'),    'color: var(--gris-ink)', null);

/* --- C. Étiquettes ---------------------------------------------------------- */
sub('C1 .tag.orange -> --orange-deep-ink',
  /\.tag\.orange \{ background: rgba\(255, 140, 0, 0\.15\); color: var\(--orange-deep\); \}/,
  '.tag.orange { background: rgba(255, 140, 0, 0.15); color: var(--orange-deep-ink); }', 1);

/* --- D. Vert WhatsApp (hors spec : traité ici) ------------------------------ */
// Le bouton garde l'aplat de marque #25D366 ; c'est l'encre qui devient nuit.
sub('D1 .m-action-wa : encre nuit sur vert de marque (9.34:1)',
  /\.m-action-wa \{\s*background: #25D366;\s*color: #ffffff;/,
  '.m-action-wa {\n    background: var(--wa-bright);\n    color: var(--nuit);', 1);
sub('D2 .m-action-wa:active',
  /\.m-action-wa:active \{\s*background: #1EBE5D;/,
  '.m-action-wa:active {\n    background: #1EBE5D;', 1);
sub('D3 .d-action-wa (drawer, fond nuit teinté) -> --wa-on-dark',
  /\.d-action-wa \{\s*background: rgba\(37, 211, 102, 0\.15\);\s*color: #25D366;\s*border: 1\.5px solid #25D366;/,
  '.d-action-wa {\n  background: rgba(79, 224, 138, 0.15);\n  color: var(--wa-on-dark);\n  border: 1.5px solid var(--wa-on-dark);', 1);
sub('D4 .d-action-wa:active',
  /\.d-action-wa:active \{\s*background: rgba\(37, 211, 102, 0\.25\);/,
  '.d-action-wa:active {\n  background: rgba(79, 224, 138, 0.25);', 1);
sub('D5 .wa-ic svg (icône sur pastille blanche) -> --wa',
  /\.wa-ic svg \{ width: 22px; height: 22px; fill: #25D366; \}/,
  '.wa-ic svg { width: 22px; height: 22px; fill: var(--wa); }', 1);

/* --- E. Contextes SOMBRES : on repasse aux variantes « -on-dark » ----------- */
// Remplacements réglés sur les règles exactes : pas de portée globale, afin de
// ne pas casser les blocs clairs imbriqués (ex. .search-box blanc dans .overlay).
const DARK = [
  ['E1  .d-nav-link:hover/:active (drawer)',
    /\.d-nav-link:hover, \.d-nav-link:active \{\s*color: var\(--orange-ink\);/,
    '.d-nav-link:hover, .d-nav-link:active {\n  color: var(--orange-on-dark);'],
  ['E2  .d-nav-num (drawer)',
    /\.d-nav-num \{\s*font-family: var\(--mono\);\s*font-size: 0\.68rem;\s*color: var\(--orange-ink\);/,
    '.d-nav-num {\n  font-family: var(--mono);\n  font-size: 0.68rem;\n  color: var(--orange-on-dark);'],
  ['E3  .d-nav-item.open .d-nav-arrow (drawer)',
    /\.d-nav-item\.open \.d-nav-arrow \{\s*transform: rotate\(180deg\);\s*color: var\(--orange-ink\);/,
    '.d-nav-item.open .d-nav-arrow {\n  transform: rotate(180deg);\n  color: var(--orange-on-dark);'],
  ['E4  .d-espaces-toggle span.plus-ic (drawer)',
    /\.d-espaces-toggle span\.plus-ic \{\s*font-size: 1\.2rem;\s*color: var\(--orange-ink\);/,
    '.d-espaces-toggle span.plus-ic {\n  font-size: 1.2rem;\n  color: var(--orange-on-dark);'],
  ['E5  .drawer-lang-bar a.active',
    /\.drawer-lang-bar a\.active \{\s*color: var\(--orange-ink\);/,
    '.drawer-lang-bar a.active {\n  color: var(--orange-on-dark);'],
  ['E6  .foot-tag (footer nuit)',
    /\.foot-tag \{\s*font-family: var\(--mono\);\s*font-size: 0\.68rem;\s*letter-spacing: 0\.3em;\s*text-transform: uppercase;\s*color: var\(--orange-ink\);/,
    '.foot-tag {\n  font-family: var(--mono);\n  font-size: 0.68rem;\n  letter-spacing: 0.3em;\n  text-transform: uppercase;\n  color: var(--orange-on-dark);'],
  ['E7  .foot-mantra span::before (footer nuit)',
    /\.foot-mantra span::before \{\s*content: '✦ ';\s*color: var\(--magenta-ink\);/,
    ".foot-mantra span::before {\n  content: '✦ ';\n  color: var(--magenta-on-dark);"],
  ['E8  .foot-cols a:hover (footer nuit)',
    /\.foot-cols a:hover \{\s*color: var\(--orange-ink\);/,
    '.foot-cols a:hover {\n  color: var(--orange-on-dark);'],
  ['E9  .side-ad-badge (carte fond nuit)',
    /\.side-ad-badge \{\s*display: inline-block;\s*font-family: var\(--mono\);\s*font-size: 0\.62rem;\s*font-weight: 800;\s*letter-spacing: 0\.16em;\s*text-transform: uppercase;\s*background: rgba\(255, 140, 0, 0\.2\);\s*color: var\(--orange-ink\);/,
    '.side-ad-badge {\n  display: inline-block;\n  font-family: var(--mono);\n  font-size: 0.62rem;\n  font-weight: 800;\n  letter-spacing: 0.16em;\n  text-transform: uppercase;\n  background: rgba(255, 140, 0, 0.2);\n  color: var(--orange-on-dark);'],
  ['E10 .toast b (fond violet-deep)',
    /\.toast b \{ color: var\(--orange-ink\); \}/,
    '.toast b { color: var(--orange-on-dark); }'],
  ['E11 .ticker-track a:hover (fond violet-deep)',
    /\.ticker-track a:hover \{ color: var\(--orange-ink\); \}/,
    '.ticker-track a:hover { color: var(--orange-on-dark); }'],
  ['E12 .ticker-track b (fond violet-deep)',
    /\.ticker-track b \{ color: var\(--orange-ink\); font-family: var\(--mono\);/,
    '.ticker-track b { color: var(--orange-on-dark); font-family: var(--mono);'],
  ['E13 .ticker-track i (fond violet-deep)',
    /\.ticker-track i \{ font-style: normal; color: var\(--magenta-ink\); \}/,
    '.ticker-track i { font-style: normal; color: var(--magenta-on-dark); }'],
  ['E14 chevrons « → » du drawer (inline)',
    /style="color:var\(--orange-ink\)" aria-hidden="true"/g,
    'style="color:var(--orange-on-dark)" aria-hidden="true"'],
  ['E15 lien « Explorer les 5 fonctions » du drawer (inline)',
    /style="color:var\(--orange-ink\);font-weight:800;"/g,
    'style="color:var(--orange-on-dark);font-weight:800;"'],
];
for (const [l, re, rep] of DARK) sub(l, re, rep, 1);

fs.writeFileSync(FILE, src, 'utf8');
console.log('Remplacement'.padEnd(52) + 'appliqués  attendu');
for (const [l, n, e] of log) {
  const ok = (e === null || e === undefined || e === n) ? 'ok  ' : 'ÉCART';
  console.log(String(l).padEnd(52) + String(n).padStart(6) + String(e === null || e === undefined ? '—' : e).padStart(9) + '   ' + ok);
}
