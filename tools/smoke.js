// Test de fumée : exécute le script réel du site dans un DOM minimal et rend
// les principales vues. Objectif : prouver que les modifications de balisage
// (esc(), h2, labels, boutons de pause) n'ont pas cassé le rendu.
'use strict';
const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const TAG = '<script nonce="__CSP_NONCE__">';
const js = src.slice(src.indexOf(TAG) + TAG.length, src.lastIndexOf('</script>'));

const noop = function () { };
const mkClassList = () => ({ add: noop, remove: noop, toggle: () => false, contains: () => false });
const mkEl = () => ({
  style: { setProperty: noop, removeProperty: noop },
  classList: mkClassList(),
  dataset: {},
  setAttribute: noop, removeAttribute: noop, getAttribute: () => null,
  addEventListener: noop, removeEventListener: noop,
  querySelector: () => null, querySelectorAll: () => [],
  appendChild: noop, remove: noop, focus: noop, closest: () => null,
  innerHTML: '', textContent: '', value: '', tabIndex: -1, offsetWidth: 0
});

const documentStub = {
  documentElement: { style: { setProperty: noop }, clientWidth: 1200, scrollHeight: 4000, classList: mkClassList() },
  body: { classList: mkClassList(), appendChild: noop, style: { setProperty: noop } },
  createElement: mkEl,
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  addEventListener: noop,
  title: '',
  activeElement: null
};
const windowStub = {
  innerWidth: 1200, innerHeight: 800, scrollY: 0,
  addEventListener: noop, removeEventListener: noop,
  scrollTo: noop, matchMedia: () => ({ matches: false, addEventListener: noop }),
  WP_STORE: null
};
class IO { constructor() { } observe() { } unobserve() { } disconnect() { } }

const sandbox = {
  document: documentStub,
  window: windowStub,
  matchMedia: () => ({ matches: false, addEventListener: noop }),
  location: { pathname: '/', href: 'http://localhost:3000/', hash: '', search: '' },
  history: { replaceState: noop, pushState: noop },
  navigator: { clipboard: null },
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  sessionStorage: { getItem: () => null, setItem: noop },
  fetch: () => Promise.reject(new Error('hors ligne')),
  IntersectionObserver: IO,
  requestAnimationFrame: () => 0,
  addEventListener: noop,
  setTimeout: (fn) => 0,
  clearTimeout: noop,
  DOMParser: class { parseFromString() { return { getElementById: () => null }; } },
  console
};

const runner = new Function('document', 'window', 'matchMedia', 'location', 'history',
  'navigator', 'localStorage', 'sessionStorage', 'fetch', 'IntersectionObserver',
  'requestAnimationFrame', 'addEventListener', 'setTimeout', 'clearTimeout', 'DOMParser',
  js + '\nreturn { vHome, vContact, vFaq, vEvent, vLumiere, v404, esc, decodeEntities };');

let api;
try {
  api = runner(documentStub, windowStub, sandbox.matchMedia, sandbox.location, sandbox.history,
    sandbox.navigator, sandbox.localStorage, sandbox.sessionStorage, sandbox.fetch, IO,
    sandbox.requestAnimationFrame, noop, sandbox.setTimeout, noop, sandbox.DOMParser);
  console.log('  OK    le script du site s’exécute sans erreur');
} catch (e) {
  console.log('  ÉCHEC exécution du script : ' + e.message);
  process.exit(1);
}

let fails = 0;
function render(name, fn) {
  try {
    const html = fn();
    if (typeof html !== 'string' || html.length < 200) throw new Error('sortie vide ou non textuelle');
    console.log('  OK    ' + name + ' rend ' + html.length + ' caractères');
    return html;
  } catch (e) {
    console.log('  ÉCHEC ' + name + ' : ' + e.message);
    fails++;
    return '';
  }
}

const home = render('vHome()', api.vHome);
render('vContact()', api.vContact);
render('vFaq()', api.vFaq);
render('vLumiere()', () => api.vLumiere(''));
render('v404()', api.v404);

if (home) {
  const checks = [
    ['bouton de pause du bandeau', /class="mq-pause" data-mq-pause aria-pressed="false"/],
    ['bouton de pause du bandeau d’actualités', /class="mq-pause" data-mq-pause/],
    ['titre de la une échappé', /\$\{esc\(lead\.title\)\}|<h1[^>]*>/],
    ['aucun <h3> de pôle (désormais <h2>)', null]
  ];
  for (const [label, re] of checks) {
    if (!re) continue;
    const good = re.test(home);
    console.log((good ? '  OK    ' : '  ÉCHEC ') + label);
    if (!good) fails++;
  }
  const seq = (home.match(/<h([1-6])[\s>]/g) || []).map(x => +x[2]);
  let jump = null, jumpAt = -1;
  const jumps = [];
  for (let i = 1; i < seq.length; i++) if (seq[i] > seq[i - 1] + 1) { jump = seq[i - 1] + '->' + seq[i]; jumpAt = i; jumps.push([seq[i - 1] + '->' + seq[i], i]); }
  if (jump) {
    const all = home.split(/(?=<h[1-6][\s>])/).filter(x => /^<h[1-6][\s>]/.test(x));
    for (const [level, idx] of jumps) console.log('        saut ' + level + ' : ' + all[idx].replace(/\s+/g, ' ').slice(0, 180));
  }
  console.log((jump ? '  ÉCHEC ' : '  OK    ') + 'ordre des titres de la page d’accueil' + (jump ? ' : saut ' + jump : ' (' + seq.join('>') + ')'));
  if (jump) fails++;

  // équilibre des balises de titre dans le HTML rendu
  for (const lvl of [1, 2, 3, 4]) {
    const o = (home.match(new RegExp('<h' + lvl + '[\\s>]', 'g')) || []).length;
    const c = (home.match(new RegExp('</h' + lvl + '>', 'g')) || []).length;
    const good = o === c;
    console.log((good ? '  OK    ' : '  ÉCHEC ') + '<h' + lvl + '> équilibrés (' + o + '/' + c + ')');
    if (!good) fails++;
  }
}

console.log(fails === 0 ? '\nTOUT PASSE' : '\n' + fails + ' ÉCHEC(S)');
process.exit(fails ? 1 : 0);
