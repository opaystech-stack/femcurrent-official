// B-15 · Association programmatique <label for> <-> contrôle (WCAG 1.3.1/3.3.2)
// 30 <label> sans aucun `for=` : les intitulés étaient de simples voisins de
// leurs champs. Les identifiants générés sont stables : <id du formulaire>-<name>.
'use strict';
const fs = require('fs');
const F = 'index.html';
const s0 = fs.readFileSync(F, 'utf8');

const LABEL_RE = /<label(?![^>]*\bfor=)([^>]*)>([\s\S]*?)<\/label>/g;
const CTRL_RE = /<(input|select|textarea)\b/;

function formIdAt(str, idx) {
  const mAll = str.slice(0, idx).match(/<form[^>]*\bid="[^"]+"/g);
  if (mAll && mAll.length) {
    const last = mAll[mAll.length - 1].match(/id="([^"]+)"/);
    if (last) return last[1];
  }
  return 'fc';
}
function nameOf(tag, kind) {
  const nm = tag.match(/\bname="([^"]+)"/);
  const ty = tag.match(/\btype="([^"]+)"/);
  return (nm ? nm[1] : (ty ? ty[1] : kind));
}
function slug(v) { return String(v).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, ''); }

const edits = [];   // {pos, text}
const used = new Set();
const report = [];
let m;

while ((m = LABEL_RE.exec(s0)) !== null) {
  const start = m.index;
  const end = start + m[0].length;
  const inner = m[2];
  const fid = formIdAt(s0, start);
  let ctrlId = null;

  const wrapIdx = inner.search(CTRL_RE);
  if (wrapIdx !== -1) {
    /* Cas 1 : le contrôle est enveloppé dans le label */
    const kind = inner.slice(wrapIdx).match(CTRL_RE)[1];
    const tagStart = start + m[1].length + '<label>'.length - 1 + wrapIdx; // position absolue approx.
    // recalage exact
    const absTag = s0.indexOf('<' + kind, start + ('<label' + m[1] + '>').length - 1);
    const tagEnd = s0.indexOf('>', absTag);
    const tag = s0.slice(absTag, tagEnd + 1);
    const idm = tag.match(/\bid="([^"]+)"/);
    if (idm) ctrlId = idm[1];
    else {
      ctrlId = fid + '-' + slug(nameOf(tag, kind));
      edits.push({ pos: absTag + kind.length + 1, text: ' id="' + ctrlId + '"' });
    }
  } else {
    /* Cas 2 : le contrôle suit le label */
    const cm = s0.slice(end).match(CTRL_RE);
    if (!cm) continue;
    const absTag = end + cm.index;
    const tagEnd = s0.indexOf('>', absTag);
    const tag = s0.slice(absTag, tagEnd + 1);
    const idm = tag.match(/\bid="([^"]+)"/);
    if (idm) ctrlId = idm[1];
    else {
      ctrlId = fid + '-' + slug(nameOf(tag, cm[1]));
      edits.push({ pos: absTag + cm[1].length + 1, text: ' id="' + ctrlId + '"' });
    }
  }

  if (used.has(ctrlId)) { console.error('ID COLLISION : ' + ctrlId); process.exit(1); }
  used.add(ctrlId);

  // injecte for= juste après « <label »
  edits.push({ pos: start + '<label'.length, text: ' for="' + ctrlId + '"' });
  report.push(ctrlId);
}

// application en partant de la fin pour ne pas décaler les positions
edits.sort((a, b) => b.pos - a.pos);
let out = s0;
for (const e of edits) out = out.slice(0, e.pos) + e.text + out.slice(e.pos);

fs.writeFileSync(F, out, 'utf8');

// contrôle
const labelsLeft = (out.match(/<label(?![^>]*\bfor=)/g) || []).length;
const ids = new Set((out.match(/\sid="[^"]+"/g) || []).map(x => x.slice(5, -1)));
const fors = (out.match(/<label[^>]*\bfor="([^"]+)"/g) || []).map(x => x.match(/for="([^"]+)"/)[1]);
const orphans = fors.filter(f => !ids.has(f));
console.log('étiquettes traitées      : ' + report.length);
console.log('étiquettes sans for=     : ' + labelsLeft);
console.log('for= sans id correspondant : ' + orphans.length + (orphans.length ? ' -> ' + orphans.join(', ') : ''));
