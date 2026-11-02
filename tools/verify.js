// Vérification de la définition de « terminé » (passe de remédiation #2)
'use strict';
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');
let fails = 0;
const ok = (c, l) => { console.log((c ? '  OK   ' : '  ÉCHEC') + '  ' + l); if (!c) fails++; };

console.log('— Jetons de couleur —');
const root = s.match(/:root \{[\s\S]*?\n\}/)[0];
for (const t of ['--gris-ink', '--magenta-ink', '--orange-ink', '--orange-deep-ink',
  '--magenta-on-dark', '--orange-on-dark', '--wa', '--wa-ink', '--wa-on-dark', '--wa-bright', '--sbw']) {
  ok(root.indexOf(t + ':') !== -1, 'token ' + t + ' déclaré dans :root');
}
ok(/--gris-ink:\s*#595959/.test(root), '--gris-ink = #595959');
ok(/--magenta-ink:\s*#C2185B/.test(root), '--magenta-ink = #C2185B');
ok(/--orange-ink:\s*#A35500/.test(root), '--orange-ink = #A35500');
ok(/--orange-deep-ink:\s*#B33E00/.test(root), '--orange-deep-ink = #B33E00');
ok(/--wa-ink:\s*#0B6B33/.test(root), '--wa-ink = #0B6B33');

console.log('\n— Couleurs d’accent encore utilisées comme TEXTE (hors :root) —');
for (const h of ['#E91E63', '#FF8C00', '#E65100', '#25D366', '#6B6B6B', '#0A66C2']) {
  const n = (s.match(new RegExp('(?<![-\\w])color\\s*:\\s*' + h + '\\b', 'gi')) || []).length;
  ok(n === 0, h + ' en `color:` : ' + n + ' occurrence(s) restante(s)');
}

console.log('\n— Formulaires (WCAG 1.3.1 / 3.3.2) —');
const labels = s.match(/<label[^>]*>/g) || [];
const withFor = labels.filter(l => /\bfor="/.test(l));
ok(labels.length === withFor.length, labels.length + ' <label>, ' + withFor.length + ' avec for=');
const ids = new Set((s.match(/\sid="[^"]+"/g) || []).map(x => x.slice(5, -1)));
const orphans = withFor.map(l => l.match(/for="([^"]+)"/)[1]).filter(f => !ids.has(f));
ok(orphans.length === 0, 'for= sans id cible : ' + (orphans.length ? orphans.join(', ') : 'aucun'));

console.log('\n— B-14 · pause des bandeaux (WCAG 2.2.2) —');
const pauseBtns = (s.match(/class="mq-pause" data-mq-pause/g) || []).length;
ok(pauseBtns === 1, pauseBtns + ' bouton de pause sur le bandeau défilant (attendu 1)');
ok(/\.mq-pause \{/.test(s), 'règle CSS .mq-pause existante');
ok(/data-mq-pause[\s\S]{0,400}aria-pressed/.test(s), 'aria-presse mis à jour par le gestionnaire');

console.log('\n— M-07 · corps éditorial —');
ok(/\.article-body-content \{/.test(s), 'règle CSS .article-body-content');
ok((s.match(/\.article-body-content/g) || []).length > 7, 'règles dérivées présentes');
ok((s.match(/<div class="article-body-content"/g) || []).length === 7, '7 usages en balisage');

console.log('\n— M-10 · aria-expanded des accordéons du drawer —');
ok(/btn\.setAttribute\("aria-expanded", String\(open\)\)/.test(s), 'synchronisation après toggle');

console.log('\n— M-19 · compensation de la barre de défilement —');
ok(/--sbw/.test(s) && /setProperty\("--sbw"/.test(s), '--sbw alimenté en JS');

console.log('\n— CSS morte —');
ok(/<span class="acc-chev"/.test(s), '.acc-chev présent dans le balisage (FAQ)');

console.log('\n— S4 · CSP —');
ok(s.indexOf('unsafe-inline') === -1, 'aucun unsafe-inline dans index.html');
ok((s.match(/nonce="__CSP_NONCE__"/g) || []).length === 2, '2 marqueurs de nonce (<style> + <script>)');
const srv = fs.readFileSync('server.js', 'utf8');
ok(/Content-Security-Policy/.test(srv), 'en-tête CSP dans server.js');
const cspFn = srv.match(/function cspHeader[\s\S]*?\n\}/)[0];
ok(!/script-src[^\n]*unsafe-inline/.test(cspFn), 'script-src reste sans unsafe-inline');
ok(/style-src-attr 'unsafe-inline'/.test(cspFn), 'styles inline autorisés uniquement via style-src-attr');
ok(/'nonce-\$\{nonce\}'/.test(cspFn), 'cspHeader() porte le nonce sur script-src et style-src');
ok(/crypto\.randomBytes/.test(srv), 'nonce cryptographique');

console.log('\n— B-01 · assainissement —');
ok(/content: sanitizeHtml\(rawContent \|\| plainText\)/.test(s), 'formatWpEvent.content assaini');
ok(/body: \[sanitizeHtml\(rawContent \|\| plainText\)\]/.test(s), 'formatWpEvent.body assaini');
ok(/sanitizeHtml\(p\.content\.rendered\)/.test(s), 'formatWpPage.content assaini');
ok(/function esc\(s\)/.test(s) && (s.match(/function esc\(s\)/g) || []).length === 1, 'esc() défini une seule fois');
ok(/alt="\$\{esc\(e\.title\)\}"/.test(s), 'alt="${esc(e.title)}" (injection d’attribut)');
ok(/alt="\$\{esc\(lead\.title\)\}"/.test(s), 'alt de la une assaini');

console.log('\n— Structure —');
const openH2 = (s.match(/<h2[\s>]/g) || []).length, closeH2 = (s.match(/<\/h2>/g) || []).length;
ok(openH2 === closeH2, '<h2> équilibrés : ' + openH2 + ' / ' + closeH2);
const openH3 = (s.match(/<h3[\s>]/g) || []).length, closeH3 = (s.match(/<\/h3>/g) || []).length;
ok(openH3 === closeH3, '<h3> équilibrés : ' + openH3 + ' / ' + closeH3);
const openH4 = (s.match(/<h4[\s>]/g) || []).length, closeH4 = (s.match(/<\/h4>/g) || []).length;
ok(openH4 === closeH4, '<h4> équilibrés : ' + openH4 + ' / ' + closeH4);
const cssBlocks = s.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [];
for (const b of cssBlocks) {
  const body = b.replace(/^<style[^>]*>/, '').replace(/<\/style>$/, '');
  const o = (body.match(/\{/g) || []).length, c = (body.match(/\}/g) || []).length;
  ok(o === c, 'accolades CSS équilibrées (' + o + '/' + c + ')');
}

console.log(fails === 0 ? '\nTOUT PASSE' : '\n' + fails + ' ÉCHEC(S)');
process.exit(fails ? 1 : 0);
