# AUDIT UI / UX / DESIGN — FemCurrent

**Cible** : `C:\LAPOSTE\Projets\Site Zaina\index.html` (6 915 lignes, 308 026 octets, SPA mono-fichier)
**Référentiel** : WCAG 2.2 AA · Core Web Vitals · responsive 360→1920 · design system · qualité de code
**Méthode** : lecture par tranches + grep ciblés + **exécution du serveur** (`node server.js` + curl) + **calcul des ratios de contraste** + **analyse statique des classes CSS utilisées vs définies**
**Auditeur** : 严过审 (critique-reviewer) — lecture seule, aucune modification de `index.html`

---

## A. NOTATION

### Note globale : **41 / 100**

| Sous-domaine | Note | Justification synthétique |
|---|---|---|
| Accessibilité (WCAG 2.2 AA) | 30/100 | ~12 échecs AA avérés (contrastes mesurés, focus, labels, pièges clavier) |
| Performance (Core Web Vitals) | 35/100 | 308 Ko HTML non compressé, logo 508 Ko ×5, hero 1,13 Mo, favicon 703 Ko, 0 `width/height`, calque grain plein écran |
| Hiérarchie éditoriale | 45/100 | 253 px de chrome avant le 1ᵉʳ contenu sur desktop, saut h1→h3, corps d'article **non stylé** |
| Cohérence du design system | 40/100 | **47 classes utilisées sans CSS**, 447 styles inline, jetons morts |
| Qualité du code | 30/100 | XSS avéré, path traversal avéré, 6 composants fonctionnellement morts, code mort |
| Spécificité / identité | 60/100 | Positionnement cyberféministe RDC réel et différenciant — mais habillage visuel générique |
| Sécurité | 15/100 | XSS + traversée de répertoire + zéro en-tête de sécurité |

### 5 dimensions (barème skill quality-review)

| Dimension | Note | Justification |
|---|---|---|
| **Philosophie** | **3/5** | L'intention est réelle et documentée (5 fonctions cyberféministes, Observatoire, Matendo, TFGBV) et les tokens existent (lignes 15–68). Mais le système est **à moitié construit** : 47 classes sans CSS, 447 styles inline, et la couche visuelle retombe sur des dégradés violet→magenta→orange interchangeables. La direction est claire, l'exécution la contredit. |
| **Hiérarchie** | **2/5** | Empilement de chrome (strip 38 px + header ≈167 px + nav 56 px = **≈253 px** avant le premier contenu) ; h1 de la home = titre du premier article (4384) puis saut direct vers h3 (4414, 4434, 4452) ; corps d'article **sans aucun style** (`article-body-content` non défini) ; compteurs de l'Observatoire **invisibles** (contraste 1,53:1) ; 8 entrées de nav à poids égal sans état actif. |
| **Exécution** | **2/5** | Six composants sont fonctionnellement morts : accordéon FAQ, filtres, signalement TFGBV, partage social, état actif de navigation, état visuel des onglets. S'y ajoutent XSS, path traversal, succès de formulaire mensonger, absence de gestion du focus. |
| **Spécificité** | **3/5** | Le fond est spécifique (provinces RDC réelles : Kasaï, Lualaba, Ituri ; TFGBV ; Observatoire). La forme ne l'est pas : `picsum.photos` sert des **photos aléatoires** à un média d'information, ✦ ×53, 🟣 ×16, dégradés interchangeables. Une marque forte habillée par un template. |
| **Réserve** | **2/5** | Tout est animé et souligné : reveal, count-up, marquee ×2, dot pulsant, grain plein écran, `backdrop-filter` ×5, `translateY(-8px)` sur toutes les cartes, bordures `border-top: 4px` de 4 couleurs, 53 glyphes ✦ décoratifs. Aucun point de repos visuel. |

**Total : 12/25 — Conclusion : REFUSÉ (P0 > 0).** Chaque dimension ≥ 3 sauf Hiérarchie (2) et Réserve (2) ; 14 défauts bloquants.

---

## B. REGISTRE DE DÉFAUTS

Légende : **B** = Bloquant (P0) · **M** = Majeur (P1) · **m** = Mineur (P2)

---

### 🔴 BLOQUANTS (14)

#### B-01 · XSS — contenu WordPress injecté sans assainissement
**Lignes** : `3132`, `3160`, `3188` (construction de `body`/`bio`) → injection en `4941`, `6121`, `6360`
**Catégorie** : Sécurité / Code
**Fait** : `body: [rawContent || plainText]` où `rawContent = p.content.rendered` (HTML brut de l'API WP). Injection : `${a.body.map(p => p.startsWith('<') ? p : \`<p>${p}</p>\`).join('')}` dans `APP.innerHTML` (6384). Un contributeur WP peut injecter `<script>` / `onerror=` → exécution sur tous les lecteurs.
**Norme** : OWASP A03:2021 · CSP absent
**Correctif** :
```js
// 1) Assainir AVANT insertion (DOMPurify = 1 dépendance, 20 Ko)
// <script src="https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js" defer></script>
const clean = s => (window.DOMPurify ? DOMPurify.sanitize(s, {
  ALLOWED_TAGS: ['p','h2','h3','h4','ul','ol','li','strong','em','a','blockquote','figure','img','iframe','br'],
  ALLOWED_ATTR: ['href','src','alt','title','target','rel','width','height','loading']
}) : "");
// 3132 : body: [clean(rawContent) || escapeHtml(plainText)]
// 4941 : ${a.body.map(p => p.startsWith('<') ? clean(p) : `<p>${esc(p)}</p>`).join('')}
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// 2) Ajouter une CSP dans server.js (voir M-17)
```

#### B-02 · Path traversal — lecture de fichiers hors racine (vérifié par exécution)
**Ligne** : `server.js:26` — `let filePath = path.join(__dirname, reqUrl === '/' ? 'index.html' : reqUrl);`
**Catégorie** : Sécurité
**Fait** : **Testé** : `GET /../package.json` → résolu `C:\LAPOSTE\Projets\package.json` (`insideRoot: false`) ; `GET /../../Windows/win.ini` → `C:\LAPOSTE\Windows\win.ini`. Aucune vérification que le chemin résolu reste sous `__dirname`.
**Norme** : OWASP A01:2021 (Broken Access Control) — CWE-22
**Correctif** :
```js
const ROOT = path.resolve(__dirname);
let filePath = path.resolve(ROOT, '.' + (reqUrl === '/' ? '/index.html' : reqUrl));
if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
  res.writeHead(403, { 'Content-Type': 'text/plain' }); return res.end('403 Forbidden');
}
```

#### B-03 · Accordéon FAQ totalement inerte
**Lignes** : `6332-6341` (markup), `6512` (binding), **aucune CSS `.acc` / `.acc-body`**
**Catégorie** : Fonctionnel / Accessibilité
**Fait** : `grep "acc-body"` ne retourne que le markup et le binding : **0 règle CSS**. Les réponses sont donc **toujours visibles**, le bouton ne produit aucun changement, et il n'a ni `aria-expanded` ni `aria-controls`.
**Norme** : WCAG 2.2 – 4.1.2 Nom, rôle, valeur (A) · 1.3.1
**Correctif** :
```css
.faq-list { display: grid; gap: 1rem; }
.acc { border: 1px solid #E8DFEE; border-radius: 10px; background: #fff; overflow: hidden; }
.acc > button { width: 100%; text-align: left; padding: 1.2rem 1.5rem; font-weight: 700; font-size: 1.05rem;
  background: none; border: none; cursor: pointer; display: flex; justify-content: space-between;
  align-items: center; gap: 1rem; min-height: 48px; }
.acc > button:focus-visible { outline: 3px solid var(--magenta); outline-offset: -3px; }
.acc > button .chev { transition: transform .25s var(--ease); }
.acc.open > button .chev { transform: rotate(180deg); }
.acc-body { display: none; padding: 0 1.5rem 1.2rem; color: #5A4E66; line-height: 1.6; }
.acc.open .acc-body { display: block; animation: fadeUp .3s var(--ease); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
```
```js
// 6512 — remplacer par :
$$(".acc > button", root).forEach(b => {
  const box = document.createElement('div'); // ou ajouter id côté markup
  b.setAttribute("aria-expanded", "false");
  b.addEventListener("click", () => {
    const open = b.parentElement.classList.toggle("open");
    b.setAttribute("aria-expanded", String(open));
  });
});
```

#### B-04 · Filtres de catégories sans effet (`.hide` non défini)
**Lignes** : `6520-6526` (binding), `5530-5534`, `5544-5549` (markup), **0 occurrence de `.hide` dans la CSS**
**Catégorie** : Fonctionnel
**Fait** : `item.classList.toggle("hide", !show)` — la classe `hide` **n'existe dans aucune règle CSS**. Les chips « Tous / Étude / Rapport / Guide / Kit / Note de plaidoyer / Cartographie » changent d'état visuel mais ne filtrent rien.
**Correctif** :
```css
.filterable > .hide { display: none !important; }
@media (prefers-reduced-motion: no-preference) { .filterable > * { transition: opacity .2s; } }
```
```js
// 6514 — ajouter le rôle et l'état aux chips
$$(".f-chip", bar).forEach(ch => ch.setAttribute("aria-pressed", String(ch.classList.contains("on"))));
// dans le handler : ch.setAttribute("aria-pressed","true") / autres "false"
```

#### B-05 · Le signalement TFGBV / cyberviolence est impossible à envoyer
**Lignes** : `6210-6222` (panneau `#lum-cyber`) vs `6688-6693` (branche `else` du submit)
**Catégorie** : Fonctionnel / UX critique
**Fait** : le `switch` sur `activePanel` ne gère que `"femme"` et `"init"` ; tout le reste tombe dans `else` qui lit `#lum-tem input[name='tem_title']`. Pour le panneau cyber, `name` est donc **toujours `""`** → `if (!name) { toast("✕ Merci de renseigner les informations obligatoires."); return; }` (6703). Le formulaire le plus sensible du site (violences numériques) ne peut jamais être soumis.
**Correctif** :
```js
} else if (activePanel === "cyber") {
  const plat = (lum.querySelector("#lum-cyber input[name='cyber_platform']") || {}).value || "";
  const desc = (lum.querySelector("#lum-cyber textarea[name='cyber_desc']") || {}).value || "";
  const sup  = (lum.querySelector("#lum-cyber select[name='cyber_support']") || {}).value || "";
  if (!desc) { toast("✕ Merci de décrire la situation."); if (submitBtn){submitBtn.disabled=false;} return; }
  name = "Signalement TFGBV"; province = "Non communiquée";
  role = "Plateforme : " + plat + " | Accompagnement : " + sup; story = desc; type = "Signalement TFGBV";
} else { /* branche tem inchangée */ }
```
Ajouter aussi `required`/`aria-required="true"` sur `cyber_platform` et `cyber_desc` (6214-6215).

#### B-06 · Boutons de partage cassés et fonction `sharePop` inexistante
**Lignes** : `4054-4057`
**Catégorie** : Fonctionnel
**Fait** : `href="${fb}"+encodeURIComponent(location.href)` — l'expression JS est **hors** de l'interpolation, donc rendue littéralement : l'URL devient `https://www.facebook.com/sharer/sharer.php?u=+encodeURIComponent(location.href)`. LinkedIn idem (4057). `grep "sharePop"` → 1 seule occurrence (l'appel), fonction jamais définie → `ReferenceError` au clic.
**Correctif** :
```js
const shareBar = () => {
  const url = encodeURIComponent(typeof location !== "undefined" ? location.href : "");
  const fb = "https://www.facebook.com/sharer/sharer.php?u=" + url;
  const li = "https://www.linkedin.com/sharing/share-offsite/?url=" + url;
  return `<div class="share-bar"><span class="lbl">Partager</span>
  <a href="${fb}" target="_blank" rel="noopener noreferrer" aria-label="Partager sur Facebook (nouvelle fenêtre)">…</a>
  <a href="${li}" target="_blank" rel="noopener noreferrer" aria-label="Partager sur LinkedIn (nouvelle fenêtre)">…</a>
  <button type="button" id="copyLinkBtn" aria-label="Copier le lien">…</button></div>`;
};
// dans bindCommon : $("#copyLinkBtn", root)?.addEventListener("click", copyLink);
```

#### B-07 · Confirmation de succès mensongère sur échec réseau (5 formulaires)
**Lignes** : `6573-6577` (contact), `6614-6619` (contributrice), `6653-6658` (partenariat), `6719-6724` (lumière), `6756-6759` (newsletter)
**Catégorie** : UX / Éthique
**Fait** : chaque `catch(err) {}` est suivi de l'affichage du bloc de succès + toast « Message transmis avec succès ». Un utilisateur dont le message **n'a jamais été envoyé** reçoit une confirmation. Sur un média qui traite de signalements sensibles (TFGBV), c'est un défaut éthique majeur.
**Norme** : WCAG 2.2 – 3.3.1 Identification des erreurs (A)
**Correctif** :
```js
} catch(err) {
  console.error("[FemCurrent] submit failed", err);
  toast("✕ <b>Échec de l'envoi.</b> Vérifiez votre connexion ou écrivez à contact@femcurrent.com.");
  if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Réessayer"; }
  return; // ne PAS afficher le bloc de succès
}
// Et ne masquer le formulaire que si data.success === true
```

#### B-08 · Site intégralement vide sans JavaScript
**Lignes** : `2897` (`<main id="app"></main>`), `6384`, `6894`, **0 occurrence de `<noscript>`**
**Catégorie** : Robustesse / SEO
**Fait** : tout le contenu est généré côté client. Sans JS (ou sur erreur JS), la page n'affiche que le header et le footer. Aucun rendu serveur, aucun `<noscript>`.
**Norme** : WCAG 2.2 – 1.1.1 / bonnes pratiques SEO ; Google indexe le HTML initial = page vide
**Correctif** :
```html
<main id="app">
  <noscript>
    <section class="section"><div class="container">
      <h1>FemCurrent — Initiative cyberféministe en RDC</h1>
      <p class="lead">Ce site nécessite JavaScript… En attendant : <a href="https://admin.femcurrent.com">accéder au flux éditorial</a> · <a href="mailto:contact@femcurrent.com">contact@femcurrent.com</a></p>
    </div></section>
  </noscript>
</main>
```
+ prérendre `vHome()` côté Node dans `server.js` (ou passer à une génération statique par route).

#### B-09 · Chiffres de l'Observatoire invisibles (texte en dégradé sur fond sombre)
**Lignes** : `1185` (`.counter b`), `1434` (`.foot-word em`), fond `var(--violet-night)` `#1A072A` (1178, 1393)
**Catégorie** : Accessibilité / Hiérarchie
**Fait** : `background: var(--degrade)` = `linear-gradient(135deg,#4B1D6D,#E91E63,#FF8C00)` + `color: transparent`. Contrastes **mesurés** : départ `#4B1D6D` sur `#1A072A` = **1,53:1**, milieu ≈ `#A61C53` = **2,63:1**, fin `#FF8C00` = 8,13:1. Les deux tiers de chaque chiffre (2,0–3,8 rem) sont illisibles — sur l'élément le plus important de la page Observatoire.
**Norme** : WCAG 2.2 – 1.4.3 Contraste minimum (AA, 4,5:1) — échec
**Correctif** :
```css
.counter b { color: #FFB3D1; background: none; -webkit-text-fill-color: #FFB3D1; } /* 8,6:1 sur #1A072A */
.foot-word em { color: #F3CEEA; background: none; -webkit-text-fill-color: #F3CEEA; font-style: italic; }
```
Règle générale : **jamais** de `background-clip:text` sur fond sombre. Réserver le dégradé aux surfaces claires, et y utiliser `--degrade-dark` (`#1A072A→#2E1143`).

#### B-10 · Icônes-only sans nom accessible
**Lignes** : `2651-2659` (email / Facebook / LinkedIn, 28 px, `title` seul), `2695` (recherche, 36 px, `title` seul), `2695`, `2738` (`✕`), `3001` (`✕`)
**Catégorie** : Accessibilité
**Fait** : `title` n'est pas un nom accessible fiable (ignoré par plusieurs lecteurs d'écran et absent au tactile). Aucun `aria-label`, aucun texte visuellement caché. Le bouton recherche desktop (2695) n'a que `title="Rechercher"`.
**Norme** : WCAG 2.2 – 4.1.2 (A) · 1.1.1 (A)
**Correctif** :
```html
<a href="mailto:contact@femcurrent.com" class="hd-social" aria-label="Nous écrire à contact@femcurrent.com"><svg aria-hidden="true" focusable="false">…</svg></a>
<button data-open-search class="hd-search" aria-label="Ouvrir la recherche"><svg aria-hidden="true" focusable="false">…</svg></button>
```
Ajouter `aria-hidden="true" focusable="false"` sur **tous** les `<svg>` (≈60 occurrences).

#### B-11 · Drawer mobile : pas de piège de focus, pas de retour de focus
**Lignes** : `2734` (`role="dialog" aria-modal="true"`), `6793-6800` (`toggleDrawer`), `6887` (Échap)
**Catégorie** : Accessibilité
**Fait** : à l'ouverture, le focus **reste sur le burger** (dans le contenu masqué) ; aucun `focus()` dans le drawer ; à la fermeture aucun retour de focus ; le contenu d'arrière-plan n'est ni `inert` ni `aria-hidden`, donc navigable au clavier derrière le modal.
**Norme** : WCAG 2.2 – 2.4.3 Ordre de focus (A) · 2.1.2 Pas de piège au clavier (A) · 4.1.2
**Correctif** :
```js
let lastFocus = null;
function toggleDrawer(o) {
  if (!drawer) return;
  lastFocus = o ? document.activeElement : lastFocus;
  drawer.classList.toggle("open", o);
  drawer.setAttribute("aria-hidden", String(!o));
  document.body.classList.toggle("lock", o);
  document.body.style.paddingRight = o ? (window.innerWidth - document.documentElement.clientWidth) + "px" : "";
  burger.setAttribute("aria-expanded", String(o));
  if (o) {
    const f = drawer.querySelector('a,button'); if (f) f.focus();
    drawer.addEventListener("keydown", trapTab);
  } else {
    drawer.removeEventListener("keydown", trapTab);
    if (lastFocus) lastFocus.focus();
  }
}
function trapTab(e){ if(e.key!=="Tab") return; const f=drawer.querySelectorAll('a[href],button:not([disabled])');
  if(!f.length) return; const first=f[0], last=f[f.length-1];
  if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();} }
```
Idem pour `#searchOverlay` (2996) : mémoriser/restaurer le focus + piège.

#### B-12 · Perte du focus après navigation SPA
**Lignes** : `6384-6393` (`render()`), `6441-6448`
**Catégorie** : Accessibilité
**Fait** : `window.scrollTo(0,0)` sans déplacer le focus : après un clic sur un lien de nav, le focus clavier reste sur l'élément de la page **précédente** (détruit), et repart en haut du document. Aucune annonce du changement de vue.
**Norme** : WCAG 2.2 – 2.4.3 (A) · 4.1.3 Messages d'état (AA)
**Correctif** :
```js
APP.innerHTML = html;
APP.setAttribute("tabindex", "-1");
APP.focus({ preventScroll: true });
window.scrollTo({ top: 0, behavior: reduced ? "auto" : "auto" }); // jamais "smooth" en SPA
// + region live
if (!document.getElementById("routeStatus")) {
  const s = document.createElement("div");
  s.id = "routeStatus"; s.setAttribute("role","status");
  s.setAttribute("aria-live","polite"); s.className = "sr-only"; document.body.appendChild(s);
}
document.getElementById("routeStatus").textContent = title + " — page chargée";
```
```css
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
```

#### B-13 · Aucun lien d'évitement « Aller au contenu »
**Lignes** : `grep "skip" = 0` ; `<main id="app">` en 2897
**Catégorie** : Accessibilité
**Fait** : première tabulation = le bandeau « ✦ LE BAROMÈTRE 2026… ✦ » puis 3 liens sociaux puis 2 CTA puis 8 liens de nav, soit **~15 tabulations** avant d'atteindre le contenu sur desktop.
**Norme** : WCAG 2.2 – 2.4.1 Contourner les blocs (A)
**Correctif** :
```html
<a class="skip-link" href="#app">Aller au contenu principal</a>
```
```css
.skip-link{position:absolute;left:-9999px;top:0;z-index:3000;background:var(--violet-deep);color:#fff;
  padding:.85rem 1.4rem;border-radius:0 0 var(--r) 0;font-weight:700}
.skip-link:focus{left:0;outline:3px solid var(--orange);outline-offset:2px}
```

#### B-14 · Animations en boucle sans contrôle de pause
**Lignes** : `861` (`.ticker-track` `marquee 38s linear infinite`), `1339` (`.partners-track` `marquee 34s infinite`), `850` (`pulse 1.4s infinite`)
**Catégorie** : Accessibilité
**Fait** : seules les règles `:hover` mettent en pause (864, 1340) — inaccessibles au clavier et inexistantes au tactile. Aucun bouton pause, aucun `prefers-reduced-motion`.
**Norme** : WCAG 2.2 – 2.2.2 Pause, arrêt, masquage (A) — contenu en mouvement > 5 s
**Correctif** :
```html
<div class="ticker" role="region" aria-label="Fil d'actualités en direct">
  <button class="ticker-pause" aria-label="Mettre en pause le défilement" aria-pressed="false">⏸</button> …
```
```css
.ticker-track, .partners-track { animation-play-state: var(--play, running); }
.ticker.paused .ticker-track { --play: paused; }
@media (prefers-reduced-motion: reduce) {
  .ticker-track, .partners-track, .ticker-label .dot { animation: none !important; }
  html { scroll-behavior: auto; }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
```

---

### 🟠 MAJEURS (23)

#### M-01 · État actif de navigation jamais appliqué (triple défaillance)
**Lignes** : `6396-6399` ; nav desktop `2676-2701`
**Catégorie** : Accessibilité / Hiérarchie / Code mort
**Fait** : `$$("nav.main [data-nav]")` — **0** élément `nav.main` et **0** attribut `data-nav` dans tout le fichier (grep : 1 seule occurrence, celle du sélecteur). De plus `grep "\.current"` → **0 règle CSS** : même si le sélecteur fonctionnait, aucun style. Enfin aucun `aria-current="page"`.
**Norme** : WCAG 2.2 – 1.3.1 · 2.4.8 (AA)
**Correctif** :
```html
<nav class="site-nav-desktop main" aria-label="Navigation principale">
  <a href="/" data-nav="" aria-label="Accueil">…</a>
  <a href="/actualites" data-nav="actualites" class="nav-link">Actualités</a>
  … <!-- data-nav = 1er segment de route pour chaque lien -->
```
```css
.nav-link { position: relative; padding: .55rem .2rem; }
.nav-link.current { color: var(--magenta); }
.nav-link.current::after { content:''; position:absolute; left:0; right:0; bottom:-2px;
  height:3px; background: var(--degrade); border-radius:2px; }
```
```js
function setActiveNav() {
  const p = getRouteSegments()[0] || "";
  $$("[data-nav]").forEach(a => {
    const on = a.dataset.nav === p;
    a.classList.toggle("current", on);
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
}
```

#### M-02 · Titre de page dupliqué
**Lignes** : `6386` + `6448`
**Catégorie** : SEO
**Fait** : `document.title = title + " — FemCurrent"` avec `render(vHome(), "FemCurrent — Initiative Cyberféministe")` → **`FemCurrent — Initiative Cyberféministe — FemCurrent`** (46 caractères, nom répété). Idem 6456 → `Nos espaces — 5 Fonctions Cyberféministes — FemCurrent`.
**Correctif** :
```js
const SUFFIX = "FemCurrent";
document.title = title ? (title.includes("FemCurrent") ? title : title + " · " + SUFFIX)
                       : "FemCurrent — Les voix et les actions des femmes";
// 6448 : render(vHome(), "FemCurrent — Initiative Cyberféministe · RDC")
```

#### M-03 · Hauteur de chrome excessive + jeton mort `--header-h`
**Lignes** : `66` (`--header-h: 76px`), `67` (`--topbar-h: 38px`), `395-400`, `2632-2673`, `2633-2670`
**Catégorie** : Design system / UX / Hiérarchie
**Fait** : `--header-h` et `--topbar-h` sont déclarés et **jamais utilisés** (grep : 2 occurrences = les déclarations). Hauteur réelle desktop : strip `0.55rem×2 + ~20px` ≈ **38 px** + header `2.4rem+2rem` (70,4 px) + logo 54 px (2646) + marge 0,9 rem (14,4) + pastilles sociales 28 px = **≈167 px** + nav 56 px (2677) = **≈253 px** de chrome avant le premier contenu. Sur un portable 1366×768, c'est **33 % de la hauteur utile**.
**Correctif** :
```css
:root { --header-h: 64px; --topbar-h: 34px; --nav-h: 56px; }
@media (min-width: 992px) {
  .site-header-desktop { padding: .85rem 1.5rem; }
  .site-header-desktop img { height: 40px !important; }
  .site-header-desktop .hd-social { width: 32px; height: 32px; }
  .site-header-desktop .hd-cta { padding: .5rem 1rem; font-size: .74rem; }
}
main#app { scroll-margin-top: calc(var(--nav-h) + 12px); }
```
Objectif : chrome total ≤ **120 px** sur desktop (strip 34 + header ~64 nav collante 56 restant seule au scroll). Rendre le header **non collant** et seule la nav collante.

#### M-04 · 447 styles inline au lieu du design system
**Lignes** : 447 occurrences de `style="` (dont `2633-2700`, `2905-2990`, `4371-4463`, `4555-4590`)
**Catégorie** : Design system / Code
**Fait** : le header, le footer, les 3 piliers de la home, les 5 étapes du cycle d'activisme sont stylés en inline avec des valeurs **hors tokens** : `#1F162B`, `#4A3E56`, `#5A4E66`, `#6E5E7A`, `#8C7E98`, `#E8DFEE`, `#FAF7FC`, `border-radius: 14px/16px` (alors que `--r: 14px`, `--r-md: 18px`, `--r-lg: 26px`), `box-shadow: 0 4px 15px rgba(75,29,109,0.04)` hors échelle.
**Correctif** : créer les classes manquantes et purger l'inline, par ex.
```css
.pillar-card{background:#fff;border:1px solid var(--gris-light);border-radius:var(--r-md);padding:1.5rem;
  display:flex;flex-direction:column;justify-content:space-between;box-shadow:var(--shadow-sm);
  transition:transform .2s var(--ease),box-shadow .2s var(--ease)}
.pillar-card{border-top:4px solid var(--pillar-c,var(--violet))}
.pillar-card h3{font-size:1.22rem;line-height:1.3;color:var(--encre);margin:0 0 .6rem}
.pillar-card .pillar-label{font-family:var(--mono);font-size:.72rem;font-weight:800;letter-spacing:.12em;
  text-transform:uppercase;color:var(--pillar-c,var(--violet))}
.pillar-card .pillar-foot{display:flex;justify-content:space-between;margin-top:1.2rem;padding-top:.8rem;
  border-top:1px solid var(--lavande);font-size:.78rem;color:var(--gris-dark)}
```
Ajouter les tokens manquants : `--encre-2:#4A3E56; --encre-3:#5A4E66; --gris-soft:#8C7E98; --bord:#E8DFEE; --surface-2:#FAF7FC;`

#### M-05 · Nav desktop : conteneur défilant centré
**Ligne** : `2680`
**Catégorie** : Responsive
**Fait** : `display:flex; justify-content:center; gap:2rem; flex-wrap:nowrap; overflow-x:auto`. À 992–1100 px, les 8 entrées (~870 px) débordent : en `justify-content:center`, le débordement **coupe le premier item à gauche** et aucune barre de défilement n'est visible. Aucun `aria-label` sur le `<nav>` (2676).
**Correctif** :
```css
.nav-links{display:flex;gap:clamp(.9rem,2vw,2rem);justify-content:flex-start;overflow-x:auto;
  scrollbar-width:thin;scroll-snap-type:x proximity}
@media (min-width:1200px){.nav-links{justify-content:center;overflow:visible}}
```
+ `<nav class="site-nav-desktop" aria-label="Navigation principale">`

#### M-06 · Contrastes insuffisants (6 valeurs mesurées, échec AA)
**Lignes** : tokens `25-33` + usages `4381, 4449, 4461, 4572, 4575, 4421, 4440, 4459, 4068, 4077, 4508, 474-476`
**Catégorie** : Accessibilité
**Fait** — ratios **calculés** (fond réel) :

| Couple | Usage | Ratio | Seuil AA | Verdict |
|---|---|---|---|---|
| `#FF8C00` sur `#FFFFFF` | labels « ÉTAPE 03 », « OBSERVATOIRE & DONNÉES », `.kicker` orange | **2,33** | 4,5 | ❌ |
| `#FF8C00` sur `#FAF7FC` | home (4449, 4461) | **2,20** | 4,5 | ❌ |
| `#E65100` sur `#FFFFFF` | `--orange-deep` | **3,79** | 4,5 | ❌ |
| `#E65100` sur `#ffeed9` | `.tag.orange` (257) | **3,34** | 4,5 | ❌ |
| `#8C7E98` sur `#FFFFFF` | méta des piliers (4421, 4440, 4459) | **3,78** | 4,5 | ❌ |
| `#FFFFFF` sur `#25D366` | `.m-action-wa` (473-476) | **1,98** | 4,5 | ❌ |
| `#E91E63` sur `#FFFFFF` | « Lire → » `.meta` .72rem (4068, 4077) | **4,35** | 4,5 | ❌ (limite) |
| `#E91E63` sur `#1B0B2E` | hover lien drawer (643) | **4,26** | 4,5 | ❌ (limite) |

**Correctif** (palette assombrie, contraste ≥ 4,5 garanti) :
```css
:root{
  --orange:#C25E00;        /* 5,02:1 sur blanc — remplace #FF8C00 pour le TEXTE */
  --orange-brand:#FF8C00;  /* conservé pour les SURFACES / dégradés uniquement */
  --orange-deep:#A33B00;   /* 6,31:1 sur blanc — remplace #E65100 */
  --gris:#5E5E5E;          /* 6,28:1 sur blanc — remplace #6B6B6B */
  --gris-soft:#6F6478;     /* 5,9:1  — remplace #8C7E98 */
  --magenta:#C2185B;       /* 5,74:1 sur blanc — remplace #E91E63 pour le TEXTE */
  --magenta-brand:#E91E63; /* surfaces / dégradés */
  --wa:#0F7A3D;            /* 5,4:1 avec #fff — remplace #25D366 en fond de bouton */
}
.tag.orange{background:rgba(255,140,0,.22);color:var(--orange-deep)}
.m-action-wa{background:var(--wa);color:#fff}
```

#### M-07 · Composants entiers rendus **sans aucun style**
**Lignes** : classes utilisées sans règle CSS — `article-body-content` (4941, 6120, 6360), `doc-card` (4080), `contact-form-box` (6140, 6192, 6260, 6301), `article-keypoints-box` (4932), `article-tags-wrap`/`article-tag-chip` (4945-4949), `author-bio-card` (4958), `article-hero-img-wrap` (4923), `article-share-section` (4953), `related-articles-section` (4973), `alert-success` (6164, 6231), `faq-list` (6330), `events-list` (4611), `table-card` (5457)
**Catégorie** : Hiérarchie / Design system
**Fait** : **47 classes** présentes dans le markup n'ont **aucune** règle CSS (vérifié par analyse croisée markup↔CSS). Conséquence la plus grave : le **corps de l'article** (`article-body-content`) n'hérite d'aucune typographie → paragraphes en 1,08 rem `Archivo` sans `max-width` ni `line-height` maîtrisée, sur toute la largeur du conteneur (≈1200 px → lignes > 120 caractères). Pour un média, c'est l'élément central.
**Norme** : WCAG 2.2 – 1.4.8 Présentation visuelle (AA) ; lisibilité
**Correctif** :
```css
.article-body-content{max-width:68ch;margin-inline:auto}
.article-body-content p{font-size:1.075rem;line-height:1.75;margin:1.35rem 0;color:#33263F}
.article-body-content h2{font-size:1.6rem;margin:2.4rem 0 .9rem}
.article-body-content h3{font-size:1.28rem;margin:2rem 0 .7rem}
.article-body-content blockquote{font-family:var(--display);font-style:italic;font-size:1.28rem;
  border-left:4px solid var(--orange);padding:.4rem 0 .4rem 1.5rem;margin:2rem 0;color:var(--violet)}
.article-body-content img{border-radius:var(--r);width:100%;height:auto}
.article-body-content a{color:var(--violet);text-decoration:underline;text-underline-offset:3px}
.doc-card{display:flex;flex-direction:column;gap:.7rem;background:#fff;border:1px solid #E8DFEE;
  border-radius:var(--r-lg);padding:1.5rem;box-shadow:var(--shadow-sm);transition:all .3s var(--ease)}
.contact-form-box{display:flex;flex-direction:column;gap:1.25rem;background:#fff;
  border:1px solid #E8DFEE;border-radius:var(--r-lg);padding:clamp(1.4rem,3vw,2.2rem)}
.article-keypoints-box{background:var(--lavande-soft);border:1px solid #E8DFEE;border-left:4px solid var(--magenta);
  border-radius:var(--r);padding:1.4rem 1.6rem;margin:1.8rem 0}
.article-keypoints-box ul{margin:.7rem 0 0;padding-left:1.2rem;display:grid;gap:.5rem}
.article-keypoints-box li{font-size:.95rem;line-height:1.6;color:#33263F}
.alert-success h3{font-size:1.25rem}
```

#### M-08 · 22 `<label>` sans `for`, inputs sans `id`
**Lignes** : `6142, 6146, 6150, 6159` (contact), `6194, 6195, 6196, 6200, 6201, 6202, 6206, 6207, 6214, 6215, 6216` (lumière), `6261, 6262, 6264, 6276, 6277` (contribuer), `6302, 6303, 6304, 6305` (partenariat), `5802, 5806, 5813, 5817, 5823` (inscription événement)
**Catégorie** : Accessibilité
**Fait** : `<label>Votre nom complet *</label><input type="text" name="name" required>` — aucune association programmatique. Le lecteur d'écran annonce « champ de texte, vide » ; le clic sur le label ne focalise pas. Les champs marqués `*` n'ont pas tous `required` (6200, 6201, 6202, 6206, 6207, 6214, 6215).
**Norme** : WCAG 2.2 – 1.3.1 (A) · 4.1.2 (A) · 3.3.2
**Correctif** : `id` + `for` systématiques + `aria-required` + `autocomplete` :
```html
<div class="field">
  <label for="c-name">Votre nom complet <span aria-hidden="true">*</span></label>
  <input id="c-name" name="name" type="text" required aria-required="true" autocomplete="name" placeholder="Ex : Marie Mwamba">
</div>
```
Remplacer le `*` visible par `<span class="req" aria-hidden="true">*</span>` + légende « * champ obligatoire » en haut de formulaire.

#### M-09 · Onglets « Mettre en lumière » : aucun état visuel, aucune sémantique
**Lignes** : `6186-6189` (markup), `1229-1230` (CSS `[aria-selected="true"]`), `6529-6533` (JS met `.active`), `1231-1232` (`.lum-panel`)
**Catégorie** : Accessibilité / UX
**Fait** : la CSS cible `[aria-selected="true"]` ; le JS pose la classe `.active` → **aucun onglet n'apparaît sélectionné** (sauf le 4ᵉ qui a un style inline rose). Aucun `role="tablist"` / `role="tab"` / `aria-controls`. Le 4ᵉ onglet (cyberviolence) est donc le seul identifiable, et son panneau est injoignable (cf. B-05).
**Correctif** :
```html
<div class="lum-tabs-nav" role="tablist" aria-label="Type de proposition">
  <button role="tab" id="tab-femme" class="lum-tab active" aria-selected="true" aria-controls="lum-femme" data-panel="femme">…</button>
```
```css
.lum-tab.active{background:var(--violet-deep);border-color:var(--violet-deep);color:#fff;
  box-shadow:0 6px 18px rgba(30,10,48,.2)}
.lum-tab.active small{color:#E4D2F2}
```
```js
$$(".lum-tab", root).forEach(t => t.addEventListener("click", () => {
  $$(".lum-tab", root).forEach(x => { const on = x === t; x.classList.toggle("active", on); x.setAttribute("aria-selected", String(on)); });
  $$(".lum-panel", root).forEach(p => p.classList.toggle("on", p.id === "lum-" + t.dataset.panel));
  // gestion flèches clavier ↑↓←→ sur le tablist
}));
```

#### M-10 · Accordéons du drawer : `role="button"` sans gestion clavier
**Lignes** : `2762`, `2778`, `2808`
**Catégorie** : Accessibilité
**Fait** : `<div class="d-nav-link d-accordion-toggle" role="button" tabindex="0">` avec un seul écouteur `click` (6806-6812). Au clavier, Entrée/Espace ne déclenchent rien. Pas d'`aria-expanded`.
**Norme** : WCAG 2.2 – 2.1.1 Clavier (A) · 4.1.2 (A)
**Correctif** : remplacer par `<button type="button" class="d-nav-link d-accordion-toggle" aria-expanded="false" aria-controls="sub-02">` (bouton natif = clavier gratuit) + `background:none;border:none;width:100%;text-align:left;font:inherit;color:inherit` et `tBtn.setAttribute("aria-expanded", isO)` dans le handler.

#### M-11 · `alt=""` sur 9 images porteuses de sens
**Lignes** : `4066, 4075, 4136, 4482, 4497, 4506, 4813, 5063, 5935`
**Catégorie** : Accessibilité
**Fait** : vignettes d'articles, de portraits et d'initiatives avec `alt=""` alors que le titre est dans un `<h3>` **frère**. Le lecteur d'écran annonce un lien sans contexte d'image. À l'inverse `4071` fait `alt="Portrait de ${f.name}"` → « Portrait de Aminata Aminata » (redondance avec le h3).
**Norme** : WCAG 2.2 – 1.1.1 (A)
**Correctif** : si l'image est décorative (titre déjà dans la carte), garder `alt=""` **mais** ajouter `aria-hidden="true"` et s'assurer que le `<h3>` est dans le lien ; si elle apporte l'information, `alt="${titre} — illustration"`. Standardiser : `alt="" aria-hidden="true"` pour toutes les vignettes de carte.

#### M-12 · Performance : aucun dimensionnement d'image, aucun format moderne
**Lignes** : toutes les `<img>` (25 occurrences) ; `3027` `IMG()`
**Catégorie** : Performance
**Fait** : **0** attribut `width`/`height`, **0** `srcset`/`sizes`, **0** `fetchpriority="high"` sur l'image LCP (`4370` `${leadImg}`), **0** WebP/AVIF. Conséquence : **CLS** garanti et poids utile démultiplié. Poids réels : `logo/logo zaina.png` **508 Ko** (chargé 5× : 2646, 2712, 2740, 2907, 2948 — rendu à 38–54 px), `logo/Favicon zaina.png` **703 Ko** déclaré en `rel="icon"` (2620), `public/images/hero-cinematic-leaders.jpg` **1 126 Ko**, `hero-bg.jpg` **935 Ko**.
**Norme** : Core Web Vitals — LCP, CLS
**Correctif** :
```html
<img src="logo/logo-fc-64.webp" srcset="logo/logo-fc-64.webp 1x, logo/logo-fc-128.webp 2x"
     width="160" height="54" alt="FemCurrent" fetchpriority="high" decoding="async">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<!-- hero LCP -->
<img src="…1200.webp" width="1200" height="675" alt="…" fetchpriority="high" decoding="sync">
<!-- vignettes -->
<img src="…600.webp" width="600" height="380" alt="" aria-hidden="true" loading="lazy" decoding="async">
```
Exporter le logo en **SVG** (< 10 Ko) et le favicon en SVG/32 px. Convertir les hero en WebP q=72 (~120 Ko).

#### M-13 · `picsum.photos` : dépendance externe + photos aléatoires
**Ligne** : `3027` — `const IMG = (s,w,h) => "https://picsum.photos/seed/"+s+"/"+w+"/"+h;` (≈180 appels)
**Catégorie** : Performance / Crédibilité / Dette
**Fait** : toutes les images par défaut viennent d'un service tiers de **photos aléatoires** (landscapes, objets). Sur un média d'information, « Reportage exclusif · RDC » (4926) légende une photo de montagne suisse aléatoire. De plus : requête DNS+TLS vers un 3ᵉ domaine, pas de `preconnect`, indisponibilité = images cassées.
**Correctif** :
```js
const IMG = (seed, w, h) => `/public/images/placeholder-${w}x${h}.svg`; // motif généré, brandé
// + dérivation déterministe d'une teinte de marque
const PLACEHOLDER = (seed, w, h) => {
  let n = 0; for (const c of String(seed)) n = (n * 31 + c.charCodeAt(0)) % 360;
  return `data:image/svg+xml,` + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
     <stop offset="0" stop-color="hsl(${n},45%,25%)"/><stop offset="1" stop-color="hsl(${(n+40)%360},60%,45%)"/>
     </linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/>
     <text x="50%" y="50%" fill="rgba(255,255,255,.55)" font-family="monospace" font-size="${Math.round(w/14)}"
     text-anchor="middle" dominant-baseline="middle">FemCurrent</text></svg>`);
};
```
Et exiger une image à la publication côté WP.

#### M-14 · Calque `.grain` plein écran avec `mix-blend-mode`
**Lignes** : `136-146`
**Catégorie** : Performance
**Fait** : `position:fixed; inset:-50%; width:200%; height:200%; z-index:1500; mix-blend-mode:multiply` + SVG `feTurbulence` en `background-image`. Une couche fixe de **4× la surface du viewport**, recomposée à chaque frame de scroll avec un blend-mode → coût GPU/peinture important sur les terminaux Android d'entrée de gamme (cible principale en RDC). Impact direct sur **INP**.
**Correctif** :
```css
.grain{position:fixed;inset:0;width:100%;height:100%;opacity:.03;pointer-events:none;z-index:1500;
  background-image:url("data:image/svg+xml,…");background-size:180px 180px;mix-blend-mode:normal}
@media (hover:none){.grain{display:none}}        /* désactivé sur mobile */
@media (prefers-reduced-motion:reduce){.grain{display:none}}
```
Mieux : supprimer sur `< 992px` (le gain esthétique est nul sur mobile, le coût est maximal).

#### M-15 · Polices : 3 familles Google bloquantes, non optimisées
**Lignes** : `8-10`
**Catégorie** : Performance
**Fait** : `Archivo` (5 graisses) + `Fraunces` (variable, **axe italique** 300–900) + `Space Mono` (2 graisses) → 3 requêtes cross-origin, feuille de style **bloquant le rendu**, aucun `preload`, aucun fallback métrique. Le `Fraunces` italique est le plus lourd et n'est utilisé que par `.accent` (173) et quelques titres.
**Correctif** :
```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="…css2?family=Archivo:wght@400;700;800&family=Fraunces:opsz,wght@9..144,600..800&family=Space+Mono:wght@400;700&display=swap">
<link rel="stylesheet" href="…" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="…"></noscript>
```
Réduire à 3 graisses Archivo (400/700/800) et Fraunces **sans** italique. Alternativement : auto-héberger en `woff2` sous `/fonts/` (supprime 2 RTT cross-origin).

#### M-16 · `server.js` : pas de compression, pas d'en-têtes de sécurité
**Lignes** : `24-55`
**Catégorie** : Performance / Sécurité
**Fait** : **mesuré** : `curl -sI http://127.0.0.1:3000/` → `Content-Length` absent, **308 026 octets** envoyés en clair, aucun `Content-Encoding`. Ratio gzip attendu sur ce fichier : **~72 %** (≈ 86 Ko). Aucun `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
**Correctif** :
```js
const zlib = require('zlib');
const SEC = {
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https://admin.femcurrent.com; "+
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; "+
    "script-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};
const accept = (req.headers['accept-encoding'] || '');
const enc = accept.includes('br') ? 'br' : accept.includes('gzip') ? 'gzip' : null;
const body = enc === 'br' ? zlib.brotliCompressSync(buf, {params:{[zlib.constants.BROTLI_PARAM_QUALITY]:11}})
           : enc === 'gzip' ? zlib.gzipSync(buf, {level:9}) : buf;
res.writeHead(200, { 'Content-Type': contentType, 'Content-Encoding': enc || undefined,
                     'Vary': 'Accept-Encoding', 'Cache-Control': cc, ...SEC });
```

#### M-17 · Fallback SPA : 200 + HTML pour toute 404 (vérifié)
**Lignes** : `33-37`
**Catégorie** : SEO / Sécurité
**Fait** : **mesuré** : `curl -sI http://127.0.0.1:3000/logo/inexistant.png` → **`HTTP/1.1 200 OK` + `Content-Type: text/html`**. Toutes les 404 (assets, favicon, robots.txt) renvoient le HTML de la home : soft-404 massives, gaspillage de bande passante, images cassées silencieuses, `robots.txt` invalide.
**Correctif** :
```js
if (err || !stats.isFile()) {
  if (path.extname(reqUrl)) { // c'est un asset → vraie 404, pas de fallback
    res.writeHead(404, { 'Content-Type': 'text/plain', ...SEC }); return res.end('404 Not Found');
  }
  filePath = path.join(ROOT, 'index.html'); // route SPA : fallback légitime
}
```

#### M-18 · `Cache-Control: max-age=31536000` sans immutable ni empreinte
**Ligne** : `50`
**Catégorie** : Cache
**Fait** : `logo/logo zaina.png` est mis en cache 1 an **sans** `immutable` et **sans** hash dans le nom : toute modification du logo reste invisible pendant 1 an. Pas d'`ETag` ni de `Last-Modified` pour revalidation.
**Correctif** :
```js
const cc = ext === '.html' ? 'no-cache'
         : /^\.(png|jpe?g|webp|avif|svg|woff2?|ico)$/.test(ext) ? 'public, max-age=31536000, immutable'
         : 'public, max-age=3600, must-revalidate';
// + ETag : res.setHeader('ETag', require('crypto').createHash('md5').update(buf).digest('hex'))
// + gérer If-None-Match → 304
```
Et renommer les assets statiques avec empreinte (`logo-fc.a1b2c3.svg`).

#### M-19 · `body.lock` sans compensation de barre de défilement
**Ligne** : `1389` — `body.lock { overflow: hidden; }`
**Catégorie** : UX
**Fait** : à l'ouverture du drawer (6797) ou de la recherche (6866), la disparition de la barre de défilement (≈15 px) décale tout le layout horizontalement (saut visible). Le header mobile étant `position:sticky`, le saut est très perceptible.
**Correctif** : voir le correctif B-11 (`padding-right` calculé) — ou, plus robuste :
```css
body.lock{overflow:hidden;padding-right:var(--sbw,0px)}
body.lock .site-header-mobile{padding-right:calc(1rem + var(--sbw,0px))}
```
```js
document.documentElement.style.setProperty('--sbw', (window.innerWidth - document.documentElement.clientWidth) + 'px');
```

#### M-20 · Hiérarchie des titres cassée sur la home
**Lignes** : `4384` (`<h1>` = titre du 1ᵉʳ article) → `4414, 4434, 4452` (`<h3>` des 3 piliers) → `4479` (`<h2>`)
**Catégorie** : Hiérarchie / SEO
**Fait** : (1) le `h1` de la page d'accueil est le titre d'un article, pas l'identité du site ; (2) les piliers utilisent `h3` **avant tout h2** → saut de niveau ; (3) le `h1` est imbriqué dans un `<a>` (4403) englobant aussi l'image et le chapô.
**Norme** : WCAG 2.2 – 1.3.1 · 2.4.6 (AA) · bonnes pratiques SEO
**Correctif** :
```html
<h1 class="sr-only">FemCurrent — média et initiative cyberféministe en RDC</h1>
<!-- le lead story passe en h2 -->
<h2 class="home-lead-title"><a href="…">${lead.title}</a></h2>
<!-- les 3 piliers passent en h3 sous un h2 de section -->
<h2 class="sr-only">Les trois pôles éditoriaux</h2> … <h3>${enq.title}</h3>
```
Règle : un seul `h1` par vue = le titre de la vue (déjà le cas sur les 24 autres vues) ; la home doit suivre.

#### M-21 · Partenaires / institutions inventés
**Lignes** : `4640-4644`
**Catégorie** : Éthique / Anti-Slop / Juridique
**Fait** : « **Ils nous font confiance** » suivi de *Ministère du Genre & Famille, ONU Femmes RDC, Université de Kinshasa, Radio Okapi, Internews, Fondation Panzi, Collectif Elongo*. Aucune source, aucun lien, aucun logo, aucune page partenaire ne corrobore ces noms. Affirmer le soutien d'institutions publiques et d'agences ONU sans preuve est un risque juridique et déontologique direct pour un média.
**Vérifié côté backend** (confirmation decouverte, re-vérifiée) : `femcurrent-headless-bridge.php` enregistre 7 CPT (`144-184`) — `enquete`, `femme_leader`, `initiative`, `ressource`, `evenement`, `podcast`, `soumission` — **aucun CPT `partenaire`**. Il n'existe donc aucune source de données possible : ce n'est pas un câblage défaillant, c'est une fabrication de bout en bout.
**Correctif** : tant que les partenariats ne sont pas confirmés par écrit, remplacer par :
```html
<section class="partners"><p>Espaces de collaboration et de concertation</p>
  <div class="partners-track"><span>Réseau des organisations de femmes <i>·</i></span>
  <span>Actrices de terrain des 26 provinces <i>·</i></span>
  <span>Communauté cyberféministe RDC <i>·</i></span></div>
  <p class="partners-legal">FemCurrent est ouvert au partenariat institutionnel — <a href="/partenariat">proposer une collaboration</a>.</p>
</section>
```
Quand ils existent : afficher les **logos** + lien vers la page partenaire.

#### M-22 · Données et mentions vérifiées fabriquées
**Lignes** : `4601-4604` & `5443-5446` (128 / 76 / 23 / 14, dupliqués en dur), `5470-5477` (tableau Kinshasa 22→36 %, etc.), `4150` (« 31 % … +14 pts »), `3157` (`src: "Protocole de vérification : 5/5"`), `4918` (« Sources : 5/5 »), `4905` (« ✦ Vérifié par FemCurrent » sur **tout** article), `4926-4927` (« Reportage exclusif · RDC », « © Rédaction FemCurrent / Documentation de terrain » codés en dur), `4620` (« Inscriptions ouvertes » sur **tout** événement), `4851` (auteur par défaut **« Patricia Zamwana »** + avatar picsum)
**Catégorie** : Éthique / Anti-Slop / Hiérarchie
**Fait** : des chiffres au pourcentage près sont présentés comme « Données Vérifiées » (5452) sans source, sans méthodologie, sans date de collecte, alors que le site revendique une charte éditoriale. Incohérence interne : « 14 provinces couvertes » (4604) vs « Cartographie des 26 provinces » (2815) vs « Moyenne 14 provinces » (5476). Un auteur par défaut est attribué à tout article sans auteur. Les badges « vérifié » sont systématiques donc non informatifs.
**Vérifié côté backend** (decouverte, re-vérifié) : `WP_STORE` démarre **vide** (`3371-3381`) et se remplit via REST ; le bridge n'enregistre **que** 2 routes custom (`/submit-light` l.198, `/contact` l.204) et **un seul** champ REST (`featured_image_url`, l.191). **Aucun endpoint d'indicateurs, aucun champ `source`, aucune méta `verified`.** Aucune des valeurs ci-dessus n'est donc dérivable aujourd'hui.
**Public affecté** (remonté par decouverte) : les **bailleurs et partenaires institutionnels** ciblés par `/partenariat`, `/ressources` et le « Baromètre 2026 en accès libre » sont précisément le segment qui vérifie sources et références. Ces défauts ne sont pas périphériques : ils sapent la proposition de financement. Cela confirme le classement de M-21/M-22 en Majeur *haut* — à traiter avant les défauts purement visuels.
**Réserve d'honnêteté** (decouverte) : cet argument repose sur des **indices artifacts** (présence des pages `/partenariat`, `/ressources`, baromètre en accès libre), **pas sur un échange avec l'utilisateur**. Si FemCurrent est une jeune initiative dont la priorité est de *constituer la communauté* plutôt que de convaincre des financeurs, l'ordre s'inverse en partie. **Question à poser à l'utilisateur avant de trancher définitivement.** La recommandation C > B (§E) tient par défaut mais ne doit pas être présentée comme plus solide qu'elle ne l'est.
**Correctif** :
```js
// 1) Rendre les compteurs pilotés par la donnée WP, jamais littéraux
const Stats = () => ({ femmes: WP_STORE.femmes.length, init: WP_STORE.initiatives.length,
                       etudes: WP_STORE.ressources.length, provinces: new Set([...].map(x=>x.prov)).size });
// 2) Tolérance zéro sur les badges : n'afficher que si la donnée existe
${a.src ? `<span class="fact-check-badge">✦ ${a.src}</span>` : ''}
${a.keyPoints?.length ? `<div class="article-keypoints-box">…</div>` : ''}
// 3) Légende image réelle, jamais en dur
<span class="article-img-caption">${a.imgCaption || ''}${a.imgCredit ? ' · © ' + a.imgCredit : ''}</span>
// 4) Tableau Observatoire : ajouter source + méthodo
<p class="chart-src">Source : ${OBS.source} · Collecte ${OBS.period} · Méthodologie : <a href="/ressources/…">rapport complet</a></p>
// 5) Événement : statut réel
<span class="tag ${e.open ? 'open' : 'closed'}">${e.open ? 'Inscriptions ouvertes' : 'Inscriptions closes'}</span>
// 6) Auteur : jamais de valeur par défaut inventée
const authorName = a.author || "La Rédaction";   // pas "Patricia Zamwana"
const authorAvatar = a.authorAvatar || PLACEHOLDER("author",120,120); // pas picsum
```

#### M-23 · Lectures de métas jamais exposées par l'API (provinces, rôles, organisations)
**Lignes** : `3125`, `3150`, `3183`, `3219`, `3220` (frontend) vs `femcurrent-headless-bridge.php:191` (backend)
**Catégorie** : Code / Données — **découvert pendant la contre-vérification backend**
**Fait** : le frontend lit `p.meta.province`, `p.meta.role`, `p.meta.org`. Or le plugin n'enregistre **aucune** `register_meta`/`register_post_meta` avec `show_in_rest` : il n'ajoute qu'un `register_rest_field('featured_image_url')` (l.191). L'objet `meta` n'est donc **jamais** présent dans les réponses REST → `p.meta` est toujours `undefined`. Conséquences :
- `prov` retombe toujours sur `"National"` (3125) ou `"6 provinces"` (3150) — les pastilles de province des cartes affichent « National » en permanence ;
- `role` retombe toujours sur `prov + " · Leadership & Impact"` (3183) ;
- `org` retombe sur la valeur reparseée depuis l'extrait (3219).
Seules `femmes` et `initiatives` récupèrent une province réelle, via un **hack de parsing d'extrait** — `/\(([^)]+)\)$/` sur l'excerpt (3171-3177 et 3201-3213) — ce qui impose aux rédactrices de suffixer l'extrait par `(Sud-Kivu)` pour que la donnée existe.
**Conséquence pour le correctif des compteurs** : `new Set(WP_STORE.posts.map(x => x.prov)).size` renverrait **1**, pas 14. Le compteur « Provinces couvertes » ne peut donc pas être dérivé des articles — cf. §F, Niveau A bis.
**Correctif** :
```php
// femcurrent-headless-bridge.php — après l.191
register_post_meta('post', 'fc_province', ['type'=>'string','single'=>true,'show_in_rest'=>true,'sanitize_callback'=>'sanitize_text_field']);
register_post_meta('enquete', 'fc_province', ['type'=>'string','single'=>true,'show_in_rest'=>true,'sanitize_callback'=>'sanitize_text_field']);
register_post_meta('femme_leader', 'fc_province', ['type'=>'string','single'=>true,'show_in_rest'=>true,'sanitize_callback'=>'sanitize_text_field']);
register_post_meta('femme_leader', 'fc_role',     ['type'=>'string','single'=>true,'show_in_rest'=>true,'sanitize_callback'=>'sanitize_text_field']);
register_post_meta('initiative', 'fc_org',        ['type'=>'string','single'=>true,'show_in_rest'=>true,'sanitize_callback'=>'sanitize_text_field']);
// + vérification / source, cf. §F Niveau C
register_post_meta('post', 'fc_verified_by',     ['type'=>'string','single'=>true,'show_in_rest'=>true]);
register_post_meta('post', 'fc_verified_at',     ['type'=>'string','single'=>true,'show_in_rest'=>true]);
register_post_meta('post', 'fc_sources_count',   ['type'=>'integer','single'=>true,'show_in_rest'=>true]);
```
```js
// frontend — aligner les lectures
prov: p.meta?.fc_province || "National",
```

---

### 🟡 MINEURS (9)

#### m-01 · Code mort : sélecteurs et classes sans CSS
**Lignes** : `6771` (`$("#header") || document.querySelector("header")`), `6780-6781` (`.scrolled`, `.hidden`), `6388-6390` (`page-in`), `6769` (`#todayDate` — **aucun élément cet id**), `4041`+`6499` (`reduced` utilisé une seule fois)
**Fait** : `grep "\.scrolled\|\.hidden\b\|\.page-in\|#header\|todayDate"` → **0 règle CSS**. Le « hide on scroll down » du header ne fonctionne pas ; `#progress` et `#todayDate` sont orphelins.
**Correctif** : soit implémenter (CSS `header.hidden{transform:translateY(-100%)}` + `position:sticky` sur le header desktop), soit **supprimer** le code mort. Recommandation : supprimer (le header desktop ne doit pas être collant, cf. M-03).

#### m-02 · Keyframes manquantes / orphelines
**Lignes** : `1231`, `1245` (`animation: fadeUp`) → `@keyframes fadeUp` **absent** ; `4174` (`animation: spin`) → `@keyframes spin` **absent** (le loader de chargement d'article **ne tourne pas**) ; `1279` (`@keyframes gradShift`) défini mais **jamais utilisé**
**Correctif** :
```css
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes spin{to{transform:rotate(360deg)}}
/* supprimer @keyframes gradShift (1279) ou l'appliquer à .commu */
```

#### m-03 · Cibles tactiles < 44 px
**Lignes** : `2651-2659` (28 px), `2695` (36 px), `789` (38 px, drawer social), `1369` (40 px, fermeture recherche), `1330` (`.sc-head a` ~26 px de haut)
**Fait** : WCAG 2.2 – **2.5.8 Taille des cibles (minimum, AA) = 24×24 px → ces cibles sont conformes**. En revanche **2.5.5 Taille des cibles (amélioré, AAA) = 44×44 px → non conformes**. Le site vise un public majoritairement mobile en RDC : viser 44 px est un choix produit, pas une obligation AA.
**Correctif** (recommandé) :
```css
.hd-social,.hd-search{width:44px;height:44px}         /* 2651-2659, 2695 */
.drawer-social-row a{width:44px;height:44px}          /* 789 */
.s-close{width:44px;height:44px}                       /* 1369 */
.sc-head a{min-height:32px;display:inline-flex;align-items:center} /* 1330 */
```

#### m-04 · Iconographie par emoji / glyphes typographiques
**Lignes** : **53** × `✦` (dont 2628, 4051, 4473, 4913, 4933, 5470…), **16** × `🟣` (2861-2865, 6189), `⏰ 📍` (4623), `📅 👥 🎟 🎓`, `▾` (6337), `＋` (2858), `✕` ×8 (2738, 3001), `→` ×59
**Catégorie** : Anti-Slop
**Fait** : les glyphes sont lus à voix haute par les lecteurs d'écran (« étoile à quatre branches », « gros cercle violet ») et polluent le flux. `✦` est utilisé comme séparateur **dans le fil d'Ariane** (4051) : chaque étape est annoncée avec « étoile ».
**Correctif** : remplacer par des SVG `aria-hidden="true"` (le fichier possède déjà une bibliothèque `ICONS`, 3016-3025) ; pour le fil d'Ariane, utiliser un séparateur CSS :
```css
.crumb > * + *::before{content:"/";margin-right:.65rem;color:var(--orange);opacity:.6}
```
Supprimer tous les `✦` décoratifs ; conserver la marque dans le logo, pas dans la ponctuation.

#### m-05 · CTA génériques répétés
**Lignes** : `4068` « Lire → » ×3, `4082` « Consulter → », `4077` « Découvrir → » ×2, `4085` « Explorer la fonction → », `4096` « Découvrir l'appel → », `4111`/`4131` « Tout voir → », `4151`, `4461` « Consulter → »
**Correctif** : formuler des CTA porteurs de valeur éditoriale et spécifiques au positionnement :
| Actuel | Proposition |
|---|---|
| « Lire → » | « Lire l'analyse » / « Lire le décryptage » |
| « Découvrir → » | « Voir l'initiative » / « Lire son parcours » |
| « Consulter → » | « Télécharger le baromètre » / « Ouvrir les données » |
| « Explorer la fonction → » | « Entrer dans Voix / Connaissance / Technologie » |
| « Tout voir → » | « Tout le fil » / « Les 26 provinces » |

#### m-06 · Dégradés interchangeables (soupe violet-magenta-orange)
**Lignes** : `40-45` (6 dégradés globaux) + `3877, 3897, 3917, 3937, 3957, 3977, 3987` (5 dégradés par univers) + `2637, 2666` (2 CTA) + `174-178` (`.accent-grad`) + `1185` + `1434`
**Fait** : 11 variations d'un même trio de couleurs, indiscernables les unes des autres → ils ne **codent aucune information** (les 5 fonctions cyberféministes sont censées être distinguables) tout en empêchant toute économie de moyens.
**Correctif** : assigner **une seule couleur sémantique** par fonction et l'utiliser en aplat, le dégradé étant réservé à un seul usage signature (la barre de progression `#progress` et le CTA primaire) :
```css
:root{ --fn-voix:#4B1D6D; --fn-connaissance:#1F6FEB; --fn-technologie:#FF8C00;
       --fn-organisation:#E91E63; --fn-impact:#0F7A3D; }
.uni-card{border-top:5px solid var(--uc,#4B1D6D)}  /* remplace le ::before dégradé */
```

#### m-07 · Rails horizontaux sans affordance
**Lignes** : `1048-1057` (`.rail` portraits), `2608-2618` (`.category-filter-nav`), `1787-1795` (`.hero-tabs-header`)
**Fait** : `scrollbar-width:none` + `::-webkit-scrollbar{display:none}` → aucune indication visuelle de défilement, aucun bouton. Sur desktop sans trackpad horizontal, le contenu hors écran est invisible.
**Correctif** : conserver la barre (`scrollbar-width:thin`) ou ajouter des boutons `<button aria-label="Faire défiler">` + `scroll-behavior:smooth`, et `tabindex="0"` + `role="group" aria-label="…"` sur le conteneur pour permettre le défilement clavier (WCAG 2.1.1).

#### m-08 · `backdrop-filter` multiplié
**Lignes** : `259` (`.tag.ghost`), `1088` (`.portrait-card .prov`), `1183` (`.counter`), `1313` (`.wa-card`), `1362` (`.overlay`)
**Fait** : 5 usages de `backdrop-filter: blur()` — chacun force la création d'un layer de composition et un ré-échantillonnage du fond à chaque frame. Sur mobile bas de gamme, cumulé au `.grain` (M-14), c'est le principal risque INP.
**Correctif** : conserver uniquement `.overlay` (1362) ; remplacer les autres par des fondssemi-transparents opaques (`rgba(27,11,46,.92)` au lieu de `blur`).

#### m-09 · Balisage `<head>` minimal pour un média
**Lignes** : `3-10` + `2620`
**Fait** : **0** `canonical`, **0** Open Graph, **0** Twitter Card, **0** JSON-LD, **0** `theme-color`, **0** `robots.txt`, **0** `sitemap.xml`, **0** `og:image`. Partage d'un article sur Facebook/WhatsApp = aucun aperçu. Aucune donnée structurée `NewsArticle`.
**Correctif** :
```html
<link rel="canonical" href="https://femcurrent.com/">
<meta name="theme-color" content="#1B0B2E">
<meta property="og:type" content="website">
<meta property="og:site_name" content="FemCurrent">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="…"><meta property="og:description" content="…">
<meta property="og:image" content="https://femcurrent.com/public/images/og-default.jpg"><!-- 1200×630 -->
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"NewsMediaOrganization",
 "name":"FemCurrent","url":"https://femcurrent.com","logo":"…","sameAs":["https://www.linkedin.com/company/femcurrent/"]}</script>
```
Et mettre à jour `og:title`/`og:description`/`og:image`/`canonical` **dans `render()`** (6386) à chaque changement de route.

---

## C. CHECKLIST ANTI-SLOP

| # | Cliché détecté | Lignes | Verdict | Alternative spécifique cyberféministe RDC |
|---|---|---|---|---|
| A1 | Dégradés violets interchangeables ×11 | 40-45, 3877-3987 | ⚠️ Présent | Voir m-06 : **une couleur sémantique par fonction**, dégradé réservé au CTA primaire + `#progress` |
| A2 | Statistiques fabriquées | 4601-4604, 5443-5446, 5470-5477, 4150 | 🔴 P0 | Voir M-22 : données pilotées par WP + source + méthodologie affichées |
| A3 | Témoignages / partenaires inventés | 4640-4644 | 🔴 P0 | Voir M-21 : logos réels + page partenaire, sinon reformulation neutre |
| A4 | Emoji décoratifs (✦×53, 🟣×16, ⏰📍📅🎟🎓👥) | multiples | ⚠️ Majeur | Utiliser la bibliothèque `ICONS` (3016-3025) déjà présente ; étendre-la avec 5 icônes « fonction » |
| A5 | Cartes « Lire → » / « Découvrir → » répétitives | 4068, 4077, 4082, 4085 | ⚠️ Majeur | Voir m-05 : CTA porteurs de valeur |
| A6 | Grain / texture « premium » plein écran | 136-146 | ⚠️ Majeur | Supprimer sur mobile ; ou remplacer par un filet 1 px et un vrai travail de rythme typographique |
| A7 | Compteurs animés (count-up) sans source | 4601-4604, 5443-5446, 6497-6506 | ⚠️ Majeur | Conserver l'animation mais **uniquement** sur des données réelles ; ajouter `aria-live="off"` + texte final accessible |
| A8 | Bandeau défilant (marquee) | 821-878, 1337-1342 | ⚠️ Majeur | Conserver (c'est un vrai « fil »), mais avec bouton pause (B-14) et `role="region"` |
| A9 | Photos aléatoires `picsum.photos` | 3027 | 🔴 P0 | Voir M-13 : placeholder SVG brandé + image obligatoire côté WP |
| A10 | Auteur par défaut inventé « Patricia Zamwana » | 4851, 3095-3098 | 🔴 P0 | « La Rédaction » + avatar neutre |
| A11 | Badges de crédibilité systématiques (« Vérifié par FemCurrent », « Sources 5/5 ») | 3157, 4905, 4918 | 🔴 P0 | Conditionnels, pilotés par des métadonnées réelles |
| A12 | `border-top: 4px` coloré sur carte (×7 nuances) | 4409, 4428, 4447, 4557, 4564, 4571, 4578, 4585 | ⚠️ Mineur | Un seul accent par famille de composants : soit `border-top`, soit pastille d'angle, pas les deux |
| A13 | Hover `translateY(-8px)` + ombre sur **toutes** les cartes | 906, 976, 1146, 1207, 1257, 1264, 1314, 1326 | ⚠️ Mineur | Réserver le soulèvement aux cartes **cliquables primaires** ; les autres : changement de bordure + `background` |
| A14 | `!important` ×9 sur `.uni-emo` | 1152-1168 | ⚠️ Mineur | Supprimer : le composant n'a pas de conflit de spécificité légitime ; créer `.uni-icon` propre |
| A15 | Sélecteur de langue factice | 2879-2884 | ⚠️ Majeur | Soit implémenter (`/en`, `/sw`, `/ln` + `hreflang`), soit retirer. Ne jamais afficher des liens morts |

**Bilan Anti-Slop** : 5 clichés au niveau P0 (statistiques, partenaires, auteur, badges, photos aléatoires), 6 au niveau Majeur, 4 au niveau Mineur. Aucun des P0 n'est purement esthétique : **ce sont des problèmes de vérité éditoriale**, autrement dit les plus graves pour un média.

---

## D. TOP 10 DES CORRECTIFS À FORT IMPACT

| # | Défaut | Lignes | Impact attendu | Effort |
|---|---|---|---|---|
| **1** | **Assainir le contenu WP + CSP** | 3132/3160/3188 → 4941 ; server.js | Supprime le vecteur XSS n°1 ; débloque la CSP | 2 h |
| **2** | **Colmater le path traversal** | server.js:26 | Supprime la lecture arbitraire de fichiers (vérifiée exploitable) | 15 min |
| **3** | **Réanimer les 6 composants morts** : FAQ (6332), filtres (6520), TFGBV (6688), partage (4056), nav active (6398), onglets (6529) | voir B-03/B-04/B-05/B-06/M-01/M-09 | 6 fonctionnalités visibles restaurées, dont la plus sensible du site | 4 h |
| **4** | **Vérité des succès de formulaire** | 6573, 6614, 6653, 6719, 6756 | Finit les fausses confirmations ; WCAG 3.3.1 | 1 h |
| **5** | **Corriger les 6 contrastes + les chiffres en dégradé** | tokens 25-33 ; 1185, 1434 | ~10 échecs WCAG 1.4.3 résolus d'un coup ; l'Observatoire redevient lisible | 2 h |
| **6** | **Accessibilité clavier/modal** : skip-link, focus SPA, drawer (trap + retour), accordéons, `aria-current` | 2734, 6387, 6396, 2762 | 6 échecs AA (2.4.1, 2.4.3, 2.1.2, 4.1.2, 2.4.8) résolus | 4 h |
| **7** | **Styler les 47 classes orphelines** (dont `article-body-content`, `doc-card`, `contact-form-box`) | voir M-07 | Le corps d'article devient lisible ; +de 12 composants gagnent une vraie hiérarchie | 6 h |
| **8** | **Performance** : compression (server.js), logo SVG + favicon SVG, WebP + `width/height`, suppression `.grain` sur mobile, réduction des polices | M-12 à M-16 | 308 Ko → ~86 Ko transférés ; LCP probablement divisé par 3 ; CLS → ~0 | 6 h |
| **9** | **Vérité éditoriale** : partenaires (4640), compteurs (4601/5443), auteur par défaut (4851), badges (3157/4905/4918), légende image (4926) | M-21, M-22, **§E** | Supprime 5 affirmations non vérifiables sur un site qui revendique une charte. **Tout est faisable sans backend :** A = 2 h (3 compteurs + repli auteur + badges conditionnels + sélecteur) · C1 = 30 min (retrait du tableau) · B = 15 min (gate du bandeau). **Seuls C2 (schéma `indicateur`) et B (CPT `partenaire`) relèvent d'un arbitrage produit — et ne bloquent aucun de ces correctifs.** | 2 h 45 |
| **10** | **Réduire le chrome et unifier le système** : header ≤ 120 px, purge de 447 styles inline vers ~30 classes, 5 couleurs de fonction | M-03, M-04, m-06 | +33 % de hauteur utile sur portable ; dette de maintenance divisée | 8 h |

**Ordre d'exécution recommandé** : 2 → 1 → 4 → 3 → 5 → 6 (sécurité + fonctionnel + AA, ~1,5 journée) puis 7 → 8 → 9 → 10 (qualité et fond, ~3 journées).

**Exception à traiter en parallèle, dès maintenant — 2 h 45, aucun backend, aucune dépendance** (§E) :
- **Niveau A** : 3 compteurs dérivés de `WP_STORE` + repli auteur `"La Rédaction"` + badges de vérification conditionnels + retrait du sélecteur de langue ;
- **Niveau C1** : **retrait** du tableau « Données Vérifiées » (ne pas le *conditionner* — le retirer) ;
- **Niveau B** : gate du bandeau partenaires sur `partenaires.length > 0`.

**À ne pas faire** : ne pas rendre le tableau « conditionnel » sans métadonnées (aggraverait le problème), et **ne pas implémenter le compteur « Provinces couvertes »** avant `fc_province` en `register_post_meta` (Niveau A bis / M-23) — il afficherait « 1 / 26 provinces ».

**Ne bloque rien** : les arbitrages C2 (schéma `indicateur`) et B (CPT `partenaire`) concernent ce qu'on *construit ensuite*, pas les correctifs ci-dessus.

---

## E. ARBITRAGE DE FAISABILITÉ DES CORRECTIFS DE VÉRITÉ ÉDITORIALE

Section ajoutée après contre-analyse backend par **decouverte** (vérifiée et amendée par mes soins ; réserve de terrain et arbitrage intégrés sur sa proposition). Ma recommandation initiale — « rendre conditionnel » — ne s'applique pas uniformément : les 5 affirmations relèvent de **niveaux de faisabilité distincts**.

**Rappel du socle backend** (vérifié) : 7 CPT (`bridge.php:144-184`), 2 routes custom seulement (`submit-light` 198, `contact` 204), 1 champ REST (`featured_image_url` 191), `WP_STORE` vide au démarrage (`3371-3381`). Routes frontend consommées : `wp/v2/posts|enquetes|femmes|initiatives|ressources|evenements|podcasts` (`3029`).

> ### ⚠️ À l'attention de `correcteur` — rien de tout cela ne bloque les correctifs
>
> **Les 5 affirmations fabriquées peuvent disparaître aujourd'hui, sans aucun backend et sans attendre le moindre arbitrage produit.** Masquer le bandeau partenaires, retirer le tableau de l'Observatoire, dériver les compteurs 1-3, replier sur `"La Rédaction"`, conditionner les badges, retirer le sélecteur de langue : **aucune de ces opérations ne dépend d'un CPT ou d'un schéma.**
>
> Les niveaux B et C ci-dessous ne concernent que ce qu'on **construit ensuite**. Ce sont des décisions produit, pas des préalables aux correctifs. **Ne pas attendre.**

### Niveau A — dérivable immédiatement, zéro dépendance à créer

| Compteur | Source de vérité | Lignes à modifier |
|---|---|---|
| « Femmes leaders documentées » | `WP_STORE.femmes.length` | 4601, 5443 |
| « Initiatives recensées » | `WP_STORE.initiatives.length` | 4602, 5444 |
| « Études & rapports publiés » | `WP_STORE.ressources.length` | 4603, 5445 |

C'est le **meilleur rapport impact/effort de tout l'audit** : trois chiffres décoratifs deviennent trois indicateurs vrais, sans toucher au backend.

### Niveau A bis — dérivable **mais bloqué** — et **prérequis de C**, pas tâche indépendante

*(Point d'ordonnancement apporté par decouverte, que j'intègre : `fc_province` est l'axe principal de l'Observatoire — « Cartographie des 26 provinces », 2815 — et doit donc être recalé **avant** le schéma `indicateur`, pas après.)*

Le 4ᵉ compteur, « Provinces couvertes » (4604, 5446), **ne peut pas** être dérivé tel que proposé. `new Set(WP_STORE.posts.map(x => x.prov)).size` renverrait **1**, pas 14 : le champ `meta.province` n'est pas exposé par l'API (cf. **M-23**), donc `prov` vaut `"National"` pour tous les articles. Un compteur affichant « 1 / 26 provinces » serait **pire** que la valeur statique actuelle, car il aurait l'apparence du calcul.

**Séquence correcte** :
1. Enregistrer `fc_province` en `register_post_meta` avec `show_in_rest` (correctif M-23) ;
2. ne dériver le compteur qu'ensuite, et uniquement depuis les types qui portent réellement la donnée :
```js
const provincesAtteintes = () => new Set([
  ...WP_STORE.femmes.map(f => f.prov), ...WP_STORE.initiatives.map(i => i.prov),
  ...WP_STORE.posts.map(p => p.prov), ...WP_STORE.enquetes.map(e => e.prov)
].filter(p => p && p !== "National" && p !== "RDC")).size;
// libellé : `${provincesAtteintes()} / 26 provinces`
```
3. conserver **26** comme dénominateur (fait réel : la RDC compte 26 provinces) et le numérateur comme donnée vivante.

### Niveau C1 — **suppression immédiate** (aucun backend, aucun arbitrage)

**Tableau « Données Vérifiées »** (5470-5477). On ne peut pas le conditionner : c'est la **forme** des données qui manque, pas seulement les valeurs. Afficher des pourcentages au point près sans source, date de collecte, méthodologie ni taille d'échantillon — même conditionnellement — déplace le problème au lieu de le résoudre.
**Action immédiate** : retirer le bloc (et le titre « Données Vérifiées » de 5452, qui est lui-même l'affirmation fausse). Remplacer par un état vide honnête :
```html
<p class="obs-empty">Les indicateurs provinciaux sont en cours de constitution.
  Les premières données sourcées seront publiées avec leur source, leur date de collecte et leur méthodologie.
  <a href="/ressources">Consulter les publications disponibles</a>.</p>
```

### Niveau C2 — **reconstruction** : schéma `indicateur` (arbitrage produit)

**Réserve de terrain de decouverte, que je fais mienne** : le schéma à 7 champs est correct sur le papier et **inapplicable sur le terrain**. Ce sont des contributrices — jeunes femmes, journalistes, militantes — qui saisissent, pas des data scientists. Le mode d'échec est prévisible : schéma spécifié, jamais rempli, page vide six mois, livraison nulle.

**Version retenue — deux étages** :
| Étage | Champs | Règle |
|---|---|---|
| **Obligatoires** | `valeur`, `source`, `date_collecte` | Sans ces trois, **rien n'est affiché** |
| **Optionnels** | `url_source`, `methode`, `echantillon` | Affichés si présents, jamais exigés |

**Règle de rendu unique et tenable** : *tout chiffre affiché porte sa source et sa date en légende.* C'est la seule contrainte qui compte, et elle suffit à rendre l'Observatoire honnête :
```html
<td><strong>36 %</strong></td>
<!-- légende obligatoire -->
<p class="chart-src">Source : ${d.source}${d.url_source ? ` · <a href="${d.url_source}">document</a>` : ""} · Collecte ${d.date_collecte}${d.echantillon ? ` · n=${d.echantillon}` : ""}</p>
```

### Niveau B — CPT `partenaire` (arbitrage produit, **après C**)

**Partenaires** (4640-4644). Créer un CPT `partenaire` (nom, logo, URL) en calquant `bridge.php:144-148`. **Action immédiate, sans backend** : gater tout le bandeau sur `partenaires.length > 0` — pas un simple masquage CSS, une **non-émission du markup**.
Exiger l'**URL du site partenaire** et rendre chaque entrée cliquable : un bandeau de logos non cliquables n'est qu'un bandeau de texte, et un nom sans lien n'est pas vérifiable — or la vérifiabilité est précisément ce que ce bandeau prétend apporter.

**Arbitrage C > B** (decouverte, arbitrage que je valide) :
1. C'est le cœur du produit. Le pilier 2 du README est « produire nos propres données » : sans schéma, `/observatoire` n'est pas *incomplet*, il est **faux** — le positionnement entier est compromis, pas seulement une page. Le bandeau partenaires est de la preuve sociale décorative, jamais différenciante.
2. Face à un bailleur, seul le couple **source + date + méthode** résiste à la vérification. Un logo se fabrique (c'est exactement le défaut M-21 actuel) ; une donnée sourcée, non.
3. B dépend partiellement de C : sans observatoire crédible, citer l'ONU Femmes reste ce que c'est aujourd'hui — un nom sans preuve.

**Badges de vérification** (3157, 4905, 4918) : méta par article (`fc_verified_by`, `fc_verified_at`, `fc_sources_count`) + rendu conditionnel sur `fc_verified_by`. Un badge apposé automatiquement à tous les articles est **pire que pas de badge** : il fabrique de la confiance.

**Auteur par défaut** (4851) : je rejoins decouverte — c'est le plus grave des cinq, devant les partenaires. C'est une **attribution nominative** : le site attribue la paternité d'articles à une personne potentiellement inexistante, avec un visage aléatoire (avatar picsum) associé au nom. Le repli est `"La Rédaction"`, déjà utilisé en 3086, 4394, 4483, 4744. Correctif immédiat, niveau A.

**Sélecteur de langue** (2879-2884) : retrait, en conservant `lang="fr"` (ligne 2). Le lingala et le swahili sont pertinents pour l'audience RDC — c'est l'exécution qui est fautive (3 liens morts vers `/`), pas l'intention. Réintroduire avec de vraies locales + `hreflang`.

---

## F. CE QUI VA BIEN (à préserver)

* Le **positionnement** est réel, documenté et différenciant : 5 fonctions cyberféministes (3872-3990), Observatoire, TFGBV, ancrage provincial réel (Kasaï-Central, Lualaba, Ituri, Sud-Kivu).
* La **palette de base** est solide : `#4B1D6D` (12,38:1 sur blanc), `#B3114B` (6,78:1), `#241730` (16,93:1) — les échecs de contraste viennent des **dérivés clairs** (`--orange`, `--gris`), pas du socle.
* Le **couple typographique** Fraunces (display) / Archivo (texte) / Space Mono (méta) est pertinent et hiérarchisant.
* `:focus-visible` est correctement défini (120-124) : 3 px magenta, offset 3 px.
* La **couverture responsive** est globalement pensée : 29 media queries, `clamp()` sur les titres, overrides mobiles du hero (1825-1854) et du footer (1556-1730).
* Le **fil d'Ariane** est présent et correctement nommé (4051).
* Les **liens externes** sont tous `target="_blank" rel="noopener"` (15/15).
* La **gestion hors-ligne** via `localStorage` + fetch à la demande (4181-4246) est une bonne idée de résilience réseau — à conserver, en l'assainissant (B-01).

---

*Rapport produit en lecture seule. Aucun fichier du projet n'a été modifié hormis ce rapport.*
