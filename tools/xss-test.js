// Vérification de la remédiation B-01 : on extrait les fonctions réelles du
// fichier servi (pas une copie) et on les soumet à des charges utiles.
'use strict';
const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');

function extract(name) {
  const i = src.indexOf('function ' + name + '(');
  if (i < 0) throw new Error('fonction introuvable : ' + name);
  let d = 0, j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) {
    if (src[k] === '{') d++;
    else if (src[k] === '}') { d--; if (d === 0) return src.slice(i, k + 1); }
  }
  throw new Error('accolade non équilibrée : ' + name);
}

const SAFE_TAGS = JSON.parse(src.match(/const SAFE_TAGS = (\[[\s\S]*?\]);/)[1]);
const SAFE_ATTRS = JSON.parse(src.match(/const SAFE_ATTRS = (\[[\s\S]*?\]);/)[1]);
const SAFE_URL_RE = /^\s*(javascript|data|vbscript|file|blob)\s*:/i;

const sandbox = {};
const code = [
  'const SAFE_TAGS=' + JSON.stringify(SAFE_TAGS) + ';',
  'const SAFE_ATTRS=' + JSON.stringify(SAFE_ATTRS) + ';',
  'const SAFE_URL_RE=/^\\s*(javascript|data|vbscript|file|blob)\\s*:/i;',
  extract('esc'), extract('escAttr'), extract('decodeEntities'), extract('safeUrl'),
  'module.exports={esc,escAttr,decodeEntities,safeUrl};'
].join('\n');
Object.assign(sandbox, require('module')._compile ? {} : {});
const m = { exports: {} };
new Function('module', 'exports', code)(m, m.exports);
const { esc, decodeEntities } = m.exports;

let fails = 0;
function ok(cond, label) { console.log((cond ? '  OK   ' : '  ÉCHEC') + '  ' + label); if (!cond) fails++; }

console.log('1) esc() est idempotente (pas de double échappement visible)');
for (const v of ['A & B', "<script>", 'Café "test"', "l'après-midi", '&#8217;']) {
  ok(esc(esc(v)) === esc(v), JSON.stringify(v) + ' -> ' + JSON.stringify(esc(v)));
}

console.log('\n2) decodeEntities() ne peut pas produire de balisage');
const PAYLOADS = [
  '&lt;script&gt;alert(1)&lt;/script&gt;',
  '&lt;img src=x onerror=alert(1)&gt;',
  '" onerror="alert(1)',
  "&#34; onmouseover=&#34;alert(1)",
  '&lt;svg onload=alert(1)&gt;',
  'Titre &#8217;apostrophe &amp; esperluette',
  'Réunion &agrave; Goma &hellip;',
];
for (const p of PAYLOADS) {
  const out = decodeEntities(p);
  const noTag = !/[<>]/.test(out.replace(/&[a-z]+;|&#\d+;/gi, ''));
  ok(!/<[a-z!/]/i.test(out) && !/"/.test(out), JSON.stringify(p) + ' -> ' + JSON.stringify(out));
}

console.log('\n3) le décodage légitime est préservé');
ok(decodeEntities('L&#8217;initiative').indexOf('’') !== -1, '&#8217; -> ’');
ok(decodeEntities('R&eacute;union').indexOf('é') !== -1, '&eacute; -> é');
ok(decodeEntities('&amp;').indexOf('&') !== -1, '&amp; -> &');

console.log('\n4) injection dans un attribut alt=""');
const evil = '" onerror="alert(1)';
const html = '<img src="x" alt="' + decodeEntities(evil) + '">';
// La valeurs ne doit contenir aucun guillemet brut : l'attribut ne peut pas
// être refermé, donc `onerror=` reste du texte affiché, jamais un gestionnaire.
ok(/^<img src="x" alt="[^"<>]*">$/.test(html), 'l’attribut reste fermé : ' + html);
ok(!/[<>]/.test(html.replace(/^<img src="x" |>$/g, '')), 'aucun chevron dans la valeur');

console.log(fails === 0 ? '\nTOUT PASSE' : '\n' + fails + ' ÉCHEC(S)');
process.exit(fails ? 1 : 0);
