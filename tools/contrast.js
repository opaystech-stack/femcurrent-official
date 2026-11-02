// Outil de calcul des ratios de contraste WCAG — passe de remédiation (audit #2)
// Usage : node tools/contrast.js
'use strict';

function hex2rgb(h) {
  h = String(h).trim().replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function lum(rgb) {
  const a = rgb.map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function ratio(f, b) {
  const l1 = lum(hex2rgb(f)), l2 = lum(hex2rgb(b));
  const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}
// Composition d'une couleur semi-transparente sur un fond opaque
function over(fgHex, alpha, bgHex) {
  const f = hex2rgb(fgHex), b = hex2rgb(bgHex);
  return '#' + f.map((v, i) => Math.round(v * alpha + b[i] * (1 - alpha)).toString(16).padStart(2, '0')).join('').toUpperCase();
}

const CASES = [
  ['#FF8C00', '#FFFFFF', '#A35500', '#FFFFFF', 'Orange en texte sur blanc'],
  ['#E65100', '#FFFFFF', '#B33E00', '#FFFFFF', 'Orange profond en texte sur blanc'],
  ['#E65100', '#FFEED9', '#B33E00', '#FFEED9', 'Orange profond sur .tag.orange clair'],
  ['#E91E63', '#FFFFFF', '#C2185B', '#FFFFFF', 'Magenta en texte sur blanc'],
  ['#E91E63', '#1B0B2E', '#FF5C94', '#1B0B2E', 'Magenta en texte sur fond nuit'],
  ['#E91E63', '#2E1143', '#FF5C94', '#2E1143', 'Magenta en texte sur violet profond'],
  ['#6B6B6B', '#FFFFFF', '#595959', '#FFFFFF', 'Gris en texte sur blanc'],
  ['#6B6B6B', '#FAF7FC', '#595959', '#FAF7FC', 'Gris en texte sur lavande-soft'],
  ['#D81B60', '#FFFFFF', '#B3114B', '#FFFFFF', 'Bouton lumière (blanc dessus)'],
  ['#0A66C2', '#FFFFFF', '#0B5CAE', '#FFFFFF', 'Bleu LinkedIn en texte sur blanc'],
  ['#FFFFFF', '#25D366', '#FFFFFF', '#107C41', 'Blanc sur vert WhatsApp (fond bouton)'],
  ['#25D366', over('#25D366', 0.15, '#1A072A'), '#4FE08A', over('#4FE08A', 0.15, '#1A072A'), 'Vert WhatsApp en texte dans le drawer (fond nuit teinté)'],
  ['#25D366', '#FFFFFF', '#0B6B33', '#FFFFFF', 'Vert WhatsApp en texte sur blanc'],
  ['#25D366', '#DEF8E8', '#0B6B33', '#DEF8E8', 'Vert WhatsApp en texte sur vert très clair'],
  ['#4FE08A', '#1A072A', '#4FE08A', '#1A072A', 'Vert WhatsApp clair sur nuit (vérif)'],
  ['#A35500', '#FFFFFF', '#A35500', '#FFFFFF', 'Contrôle --orange-ink'],
];

function verdict(r, large) {
  if (r >= 7) return 'AAA';
  if (r >= (large ? 3 : 4.5)) return 'AA';
  return 'ÉCHEC';
}

console.log('| Couple | Avant | Verdict | Après | Verdict |');
console.log('|---|---|---|---|---|');
for (const [f, b, f2, b2, label] of CASES) {
  const r1 = ratio(f, b), r2 = ratio(f2, b2);
  console.log(`| ${label}  \`${f}\`/\`${b}\` → \`${f2}\`/\`${b2}\` | ${r1.toFixed(2)}:1 | ${verdict(r1)} | **${r2.toFixed(2)}:1** | ${verdict(r2)} |`);
}
console.log('\n--- Fonds composités ---');
console.log('rgba(37,211,102,.15) sur #1A072A =', over('#25D366', 0.15, '#1A072A'));
console.log('rgba(79,224,138,.15) sur #1A072A =', over('#4FE08A', 0.15, '#1A072A'));
