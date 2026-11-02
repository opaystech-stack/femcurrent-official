// Complément à apply-tokens.js : cas échappés au premier passage
'use strict';
const fs = require('fs');
const F = 'index.html';
let s = fs.readFileSync(F, 'utf8');
const log = [];
function sub(l, re, rep) { const n = (s.match(re) || []).length; s = s.replace(re, rep); log.push([l, n]); }

// A1 bis — forme avec repli var(--magenta, #E91E63) sur fond clair
sub('A1b .site-nav-desktop [data-nav].current',
  /\.site-nav-desktop \[data-nav\]\.current \{ color: var\(--magenta, #E91E63\); \}/,
  '.site-nav-desktop [data-nav].current { color: var(--magenta-ink); }');
sub('A1c .noscript-fallback a',
  /\.noscript-fallback a \{ color: var\(--magenta, #E91E63\);/,
  '.noscript-fallback a { color: var(--magenta-ink);');

// E14/E15 — inline du drawer (espace après les deux-points toléré)
const C = String.raw`style="color:\s*var\(--orange-ink\)`;
sub('E14 chevrons « → » du drawer',
  new RegExp(C + '" aria-hidden="true"', 'g'),
  'style="color:var(--orange-on-dark)" aria-hidden="true"');
sub('E15 lien « Explorer les 5 fonctions »',
  new RegExp(C + ';font-weight:800;"', 'g'),
  'style="color:var(--orange-on-dark);font-weight:800;"');

fs.writeFileSync(F, s, 'utf8');
for (const [l, n] of log) console.log(String(n).padStart(3) + '  ' + l);
