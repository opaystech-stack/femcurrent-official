'use strict';
const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const TAG = '<script nonce="__CSP_NONCE__">';
const js = src.slice(src.indexOf(TAG) + TAG.length, src.lastIndexOf('</script>'));

const noop = () => {};
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

class IO { observe() {} unobserve() {} disconnect() {} }

const runner = new Function('document', 'window', 'matchMedia', 'location', 'history',
  'navigator', 'localStorage', 'sessionStorage', 'fetch', 'IntersectionObserver',
  'requestAnimationFrame', 'addEventListener', 'setTimeout', 'clearTimeout', 'DOMParser',
  js + '\nreturn { vHome, vActualites, vEnquetes, vFemmes, vInitiatives, vObs, vRessources, vAgenda, vMediatheque, vEspaces, vUniv, vAPropos, vContact, vLumiere, vContribuer, vPartenariat, vFaq, vLegal, v404, UNIV };');

const api = runner(documentStub, windowStub, () => ({ matches: false, addEventListener: noop }),
  { pathname: '/', href: 'http://localhost:3000/', hash: '', search: '' },
  { replaceState: noop, pushState: noop },
  { clipboard: null },
  { getItem: () => null, setItem: noop },
  { getItem: () => null, setItem: noop },
  () => Promise.reject(new Error('offline')),
  IO, () => 0, noop, noop, noop,
  class { parseFromString() { return { getElementById: () => null }; } }
);

console.log('--- Testing All Views ---');
const tests = [
  ['vHome', () => api.vHome()],
  ['vActualites', () => api.vActualites()],
  ['vEnquetes', () => api.vEnquetes()],
  ['vFemmes', () => api.vFemmes()],
  ['vInitiatives', () => api.vInitiatives()],
  ['vObs (Droits Numériques)', () => api.vObs()],
  ['vRessources', () => api.vRessources()],
  ['vAgenda', () => api.vAgenda()],
  ['vMediatheque', () => api.vMediatheque()],
  ['vEspaces', () => api.vEspaces()],
  ['vUniv(voices)', () => api.vUniv('voices')],
  ['vUniv(data)', () => api.vUniv('data')],
  ['vUniv(lab)', () => api.vUniv('lab')],
  ['vUniv(community)', () => api.vUniv('community')],
  ['vUniv(impact)', () => api.vUniv('impact')],
  ['vUniv(matendo)', () => api.vUniv('matendo')],
  ['vUniv(academy)', () => api.vUniv('academy')],
  ['vAPropos (Manifeste)', () => api.vAPropos()],
  ['vContact', () => api.vContact()],
  ['vLumiere(femme)', () => api.vLumiere('femme')],
  ['vLumiere(initiative)', () => api.vLumiere('initiative')],
  ['vLumiere(temoignage)', () => api.vLumiere('temoignage')],
  ['vLumiere(cyberviolence)', () => api.vLumiere('cyberviolence')],
  ['vContribuer', () => api.vContribuer()],
  ['vPartenariat', () => api.vPartenariat()],
  ['vFaq', () => api.vFaq()],
  ['vLegal(mentions)', () => api.vLegal('mentions-legales')],
  ['v404', () => api.v404()]
];

let failed = 0;
for (const [name, fn] of tests) {
  try {
    const html = fn();
    if (!html || typeof html !== 'string' || html.length < 100) {
      console.log(`  FAIL: ${name} returned invalid content`);
      failed++;
    } else {
      console.log(`  OK:   ${name} (${html.length} chars)`);
    }
  } catch(e) {
    console.log(`  FAIL: ${name} threw error: ${e.message}`);
    failed++;
  }
}

// Check key Zaïna phrases
const homeHtml = api.vHome();
const aboutHtml = api.vAPropos();
const keyPhrases = [
  'initiative cyberféministe qui utilise les technologies, les médias, les données',
  'Le média devient alors un moyen, pas la finalité',
  'La technologie devient un espace d’activisme',
  'Les femmes deviennent non seulement des bénéficiaires ou des sujets de contenu, mais des actrices',
  '5 fonctions cyberféministes',
  'FemCurrent Voices',
  'FemCurrent Data',
  'FemCurrent Lab',
  'CyberFeminist Community',
  'FemCurrent Impact',
  'Données → Connaissances → Mobilisation → Plaidoyer → Changement'
];

console.log('\n--- Checking Zaïna Directives Coverage ---');
for (const phrase of keyPhrases) {
  const norm = phrase.toLowerCase().replace(/['’]/g, "'");
  const inHome = homeHtml.toLowerCase().replace(/['’]/g, "'").includes(norm);
  const inAbout = aboutHtml.toLowerCase().replace(/['’]/g, "'").includes(norm);
  const inUniv = api.vUniv('impact').toLowerCase().replace(/['’]/g, "'").includes(norm) || api.vUniv('community').toLowerCase().replace(/['’]/g, "'").includes(norm);
  const found = inHome || inAbout || inUniv;
  console.log(`  ${found ? 'OK' : 'MISSING'}: "${phrase}"`);
  if (!found) failed++;
}

if (failed === 0) {
  console.log('\nALL 28 VIEWS & DIRECTIVES PASSED WITH ZERO ERRORS!');
  process.exit(0);
} else {
  console.log(`\n${failed} CHECK(S) FAILED!`);
  process.exit(1);
}
