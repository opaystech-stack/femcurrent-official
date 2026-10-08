# FemCurrent — Spécification de Design Tokens

**Fichier cible :** `index.html` (lignes 15–68 `:root`, 70–124 reset, 159–259 typo, 261–351 boutons)
**Auteur :** 彩格调 (design-system-expert) · Équipe Design Prototype
**Statut :** Spécification à appliquer — **ne pas** modifier `index.html` depuis ce document ; les patches sont exécutés par 筑原型 (prototype-builder).
**Méthode :** ratios WCAG 2.1 calculés (sRGB relatif, formule `(L1+0.05)/(L2+0.05)`), script Python, arrondis à 2 décimales. Les fonds translucides ont été **composités** sur leur fond porteur avant calcul (pas d'estimation visuelle).

---

## 0. Référence de design system

Le site possède déjà le bon squelette : **Fraunces** (sérif variable à fort contraste) pour le display + **Archivo** (grotesque) pour le corps + **Space Mono** pour les métadonnées. C'est exactement la structure d'un média éditorial haut de gamme.

| Ancrage | Système de référence | Ce qu'on emprunte |
|---|---|---|
| Base éditoriale | **Warm Editorial** | Voix sérif显示 + grotesque, filets fins, respiration verticale, chaleur chromatique |
| Énergie média | **The Verge** | Accents néon sur fond sombre, kickers mono uppercase, bordures-gradients, hiérarchie agressive |
| Discipline de tokens | **Stripe** | Séparation stricte `raw color` / `semantic token`, états explicites, anneau de focus dual |

Objectif : Warm Editorial × The Verge — **pas** un template Bootstrap violet.

---

## 1. Tableau de contraste complet

### 1.1 Couples sur fond clair (blanc ou lavande)

| # | Couple réellement utilisé | Ratio | Verdict | Correction | Ratio corrigé | Verdict |
|---|---|---|---|---|---|---|
| C1 | `--gris` `#6B6B6B` / `#FFFFFF` — `.lead`, `.meta`, `.crumb` (≤ 17 px) | **5.33:1** | PASS AA · FAIL AAA | `--gris-ink: #595959` | **7.00:1** | PASS AAA |
| C2 | `--orange` `#FF8C00` / `#FFFFFF` — `.crumb i`, accents, bordure `.see-all` | **2.33:1** | ❌ **FAIL AA** | `--orange-ink: #A35500` | **5.45:1** | PASS AA |
| C3 | `--magenta` `#E91E63` / `#FFFFFF` — `.accent`, hover liens, `.kicker` hover | **4.35:1** | ❌ **FAIL AA** (frôle 4.5) | `--magenta-ink: #C2185B` | **5.87:1** | PASS AA |
| C4 | `--violet` `#4B1D6D` / `#FFFFFF` — `.kicker`, `.tag`, `.btn-ghost` | **12.38:1** | ✅ PASS AAA | inchangé | — | PASS AAA |
| C5 | `--violet` `#4B1D6D` / `--lavande` `#F3EEF7` — `.tag` sur section alt | **10.84:1** | ✅ PASS AAA | inchangé | — | PASS AAA |
| C6 | `--violet-deep` `#2E1143` / `#FFFFFF` — `h1–h6` | **16.44:1** | ✅ PASS AAA | inchangé | — | PASS AAA |
| C7 | `--encre` `#241730` / `#FFFFFF` — corps de texte | **16.93:1** | ✅ PASS AAA | inchangé | — | PASS AAA |
| C8 | `--gris-dark` `#403B45` / `#FFFFFF` | **10.88:1** | ✅ PASS AAA | inchangé | — | PASS AAA |
| C9 | `--magenta-dark` `#B3114B` / `#FFFFFF` | **6.78:1** | ✅ PASS AA | inchangé | — | PASS AA |
| C10 | `--orange-deep` `#E65100` / `#FFFFFF` | **3.79:1** | ❌ **FAIL AA** | `--orange-deep-ink: #B33E00` | **5.82:1** | PASS AA |
| C11 | `--orange-deep` `#E65100` / `rgba(255,140,0,.15)` → fond effectif `#FFEED9` — `.tag.orange` | **3.34:1** | ❌ **FAIL AA** | `#B33E00` / `#FFEED9` | **5.13:1** | PASS AA |
| C12 | `--magenta-dark` `#B3114B` / `rgba(233,30,99,.12)` → fond effectif `#FCE4EC` — `.tag.magenta` | **5.63:1** | ✅ PASS AA | `--magenta-ink` `#C2185B` → **4.88:1** | PASS AA |
| C13 | `--violet` `#4B1D6D` / `rgba(75,29,109,.12)` → `#E9E4ED` — `.tag.violet` | **9.90:1** | ✅ PASS AAA | inchangé | — | PASS AAA |
| C14 | `--gris` `#6B6B6B` / `--lavande-soft` `#FAF7FC` | **5.02:1** | PASS AA (limite) | `--gris-ink` `#595959` → **6.60:1** | PASS AA+ |
| C15 | `--gris` `#6B6B6B` / `--lavande` `#F3EEF7` | **4.67:1** | PASS AA (limite) | `--gris-ink` `#595959` → **6.13:1** | PASS AA+ |

### 1.2 Couples sur fond sombre

| # | Couple | Ratio | Verdict | Correction | Ratio corrigé | Verdict |
|---|---|---|---|---|---|---|
| D1 | `#F3CEEA` / `#1B0B2E` — `.kicker.on-dark`, bandeau alerte (l. 378) | **13.08:1** | ✅ PASS AAA | → `--rose-nuit` | — | PASS AAA |
| D2 | `#F3CEEA` / `#1A072A` | **13.39:1** | ✅ PASS AAA | idem | — | PASS AAA |
| D3 | `#D9CBE8` / `#1B0B2E` | **12.04:1** | ✅ PASS AAA | → `--lavande-nuit` | — | PASS AAA |
| D4 | `#D9CBE8` / `#1F162B` (fond visuel, l. 1750) | **11.31:1** | ✅ PASS AAA | — | — | PASS AAA |
| D5 | `#D9CBE8` / `#2E1143` (`.side-ad-card`, l. 2172) | **10.69:1** | ✅ PASS AAA | — | — | PASS AAA |
| D6 | `#FFFFFF` / `#1B0B2E` | **18.52:1** | ✅ PASS AAA | inchangé | — | PASS AAA |
| D7 | `--orange` `#FF8C00` / `#1B0B2E` | **7.94:1** | ✅ PASS AAA | inchangé (usage sombre OK) | — | PASS AAA |
| D8 | `#E91E63` / `#1B0B2E` — **magenta en texte sur nuit** | **4.26:1** | ❌ **FAIL AA** | `--magenta-on-dark: #FF5C94` | **6.36:1** | PASS AA |
| D9 | `#E91E63` / `#2E1143` | **3.78:1** | ❌ **FAIL AA** | `#FF5C94` / `#2E1143` | **5.64:1** | PASS AA |
| D10 | `#FFFFFF` / `rgba(255,255,255,.2)` sur `#1B0B2E` → `#493C58` — `.tag.ghost` | **10.14:1** | ✅ PASS AAA | inchangé | — | PASS AAA |

> ✅ **Bonne nouvelle :** tous les couples « clair sur sombre » déjà en place passent AAA. Le seul échec sombre est le **magenta** (D8/D9), facilement corrigé par une variante éclaircie.

### 1.3 Blanc sur aplats de couleur (boutons, réseaux)

| # | Couple | Ratio | Verdict | Correction | Ratio corrigé |
|---|---|---|---|---|---|
| B1 | `#FFFFFF` / `#E91E63` | **4.35:1** | ❌ **FAIL AA** (0.15 sous le seuil) | `#FFFFFF` / `#C2185B` | **5.87:1** PASS AA |
| B2 | `#FFFFFF` / `#D81B60` — `.m-action-lumiere`, `.d-action-lumiere` | **4.95:1** | ✅ PASS AA | conservé ; état actif `#C2185B` → **5.87:1** | PASS AA |
| B3 | `#FFFFFF` / `#0A66C2` — LinkedIn | **5.69:1** | ✅ PASS AA | `--li: #0B5CAE` | **6.65:1** PASS AA+ |
| B4 | `#FFFFFF` / `#25D366` — WhatsApp | **1.98:1** | ❌ **FAIL AA GRAVE** | `--wa: #107C41` | **5.27:1** PASS AA |
| B5 | `#FFFFFF` / `#FF8C00` | **2.33:1** | ❌ **FAIL AA** | `--orange-deep-ink: #B33E00` | **5.82:1** PASS AA |
| B6 | `#FFFFFF` / `#4B1D6D` — `.btn-dark` | **12.38:1** | ✅ PASS AAA | inchangé | PASS AAA |
| B7 | `#FFFFFF` / `#2E1143` | **16.44:1** | ✅ PASS AAA | inchangé | PASS AAA |
| B8 | `#25D366` en **texte** sur `rgba(37,211,102,.15)` → `#DEF8E8` — `.d-action-wa` (l. 611) | **1.77:1** | ❌ **FAIL AA GRAVE** | `--wa-ink: #0B6B33` sur tint `.10` → `#E7F0EB` | **5.71:1** PASS AA |
| B9 | `#0A66C2` en texte / `#FFFFFF` (l. 4696) | **5.69:1** | ✅ PASS AA | `--li-ink: #0B5CAE` | **6.65:1** PASS AA+ |

### 1.4 Pire cas des dégradés (texte blanc posé dessus)

Le pire point d'un dégradé n'est pas sa moyenne : on échantillonne 101 points.

| # | Dégradé | Pire point | Ratio | Verdict |
|---|---|---|---|---|
| G1 | `--degrade` `#4B1D6D → #E91E63 → #FF8C00` (actuel) | `#FF8C00` (t=100 %) | **2.33:1** | ❌ FAIL AA |
| G2 | `--degrade-violet-magenta` `#4B1D6D → #E91E63` (actuel) | `#E91E63` (t=100 %) | **4.35:1** | ❌ FAIL AA |
| G3 | **`--degrade-cta`** `#4B1D6D → #C2185B → #A84500` (corrigé) | `#C2185B` (t=52 %) | **5.87:1** | ✅ PASS AA |
| G4 | **`--degrade-cta-vm`** `#4B1D6D → #C2185B` (corrigé) | `#C2185B` | **5.87:1** | ✅ PASS AA |
| G5 | **`--degrade-cta-mo`** `#C2185B → #A84500` (corrigé) | `#C2185B` | **5.87:1** | ✅ PASS AA |
| G6 | `--degrade-rev` corrigé `#A84500 → #C2185B → #4B1D6D` | `#C2185B` | **5.87:1** | ✅ PASS AA |

**Règle structurante :** on sépare désormais **deux familles de dégradés**.
- `--degrade*` (vif, `#FF8C00` conservé) → **décoratif uniquement** : filets, barre de progression, bordures, sous-lignage, aplats non porteurs de texte. Jamais sous du texte.
- `--degrade-cta*` (assombri) → **toujours** celui-ci dès qu'un texte blanc est posé dessus (`.btn-primary`, CTA de bandeau).

### 1.5 Les 6 corrections de contraste les plus importantes

| Priorité | Correction | De → Vers |
|---|---|---|
| 🔴 P1 | Texte blanc sur bouton WhatsApp | `#25D366` → **`#107C41`** (1.98 → 5.27) |
| 🔴 P2 | Texte blanc sur dégradé CTA | `#4B1D6D→#E91E63→#FF8C00` → **`#4B1D6D→#C2185B→#A84500`** (2.33 → 5.87) |
| 🔴 P3 | Magenta en texte sur blanc | `#E91E63` → **`#C2185B`** (4.35 → 5.87) |
| 🟠 P4 | Orange en texte / séparateur sur blanc | `#FF8C00` → **`#A35500`** (2.33 → 5.45) |
| 🟠 P5 | Orange profond (tag, survol) | `#E65100` → **`#B33E00`** (3.79 → 5.82) |
| 🟠 P6 | Magenta en texte sur fond nuit | `#E91E63` → **`#FF5C94`** (4.26 → 6.36) |

---

## 2. Bloc `:root` corrigé complet

**Remplace intégralement les lignes 15 à 68.** Tous les tokens existants sont conservés (aucune régression de nommage) ; les ajouts sont signalés par `/* NEW */`.

```css
:root {
  /* ── 1. COULEURS BRUTES (palette de marque) ───────────────────────── */
  --violet:        #4B1D6D;
  --violet-deep:   #2E1143;
  --violet-night:  #1A072A;
  --violet-glow:   rgba(75, 29, 109, 0.15);

  --magenta:       #E91E63;   /* décoratif / aplats uniquement */
  --magenta-dark:  #B3114B;
  --magenta-light: #FCE4EC;

  --orange:        #FF8C00;   /* décoratif / aplats uniquement */
  --orange-deep:   #E65100;
  --orange-light:  #FFF3E0;

  --lavande:       #F3EEF7;
  --lavande-soft:  #FAF7FC;
  --lavande-tint:  #EADFF0;

  --gris:          #6B6B6B;   /* conservé pour les éléments non textuels */
  --gris-light:    #F0EDF2;
  --gris-dark:     #403B45;

  --encre:         #241730;
  --blanc:         #FFFFFF;

  /* ── 2. COULEURS D'ENCRE (textuelles, WCAG AA/AAA vérifiées) ── NEW ── */
  --gris-ink:          #595959; /* 7.00:1 sur blanc — AAA */
  --magenta-ink:       #C2185B; /* 5.87:1 sur blanc — AA  */
  --orange-ink:        #A35500; /* 5.45:1 sur blanc — AA  */
  --orange-deep-ink:   #B33E00; /* 5.82:1 sur blanc — AA  */
  --violet-ink:        #4B1D6D; /* 12.38:1 — AAA (alias sémantique) */

  /* Accents sur surfaces sombres — NEW */
  --magenta-on-dark:   #FF5C94; /* 6.36:1 sur #1B0B2E — AA  */
  --orange-on-dark:    #FF8C00; /* 7.94:1 sur #1B0B2E — AAA */
  --lavande-on-dark:   #D9CBE8; /* 12.04:1 — AAA */
  --rose-on-dark:      #F3CEEA; /* 13.08:1 — AAA */

  /* Réseaux / marques tierces — NEW */
  --li:       #0B5CAE; /* blanc dessus 6.65:1 — AA+ */
  --li-ink:   #0B5CAE; /* 6.65:1 sur blanc */
  --wa:       #107C41; /* blanc dessus 5.27:1 — AA  */
  --wa-ink:   #0B6B33; /* 6.63:1 sur blanc — AA  */

  /* ── 3. SURFACES — NEW ─────────────────────────────────────────────── */
  /* Claires */
  --surface:            #FFFFFF;
  --surface-subtle:     #FAF7FC;
  --surface-muted:      #F3EEF7;
  --surface-tint:       #EADFF0;
  --surface-inset:      #F0EDF2;
  --surface-inverse:    #1B0B2E;

  /* Sombres (sections nuit) */
  --nuit:               #1B0B2E;  /* remplace #1B0B2E et #1F162B */
  --nuit-deep:          #1A072A;  /* --violet-night */
  --nuit-raised:        #241730;  /* carte posée sur --nuit */
  --nuit-raised-hi:     #2E1143;  /* --violet-deep */
  --nuit-hairline:      rgba(243, 206, 234, 0.22);
  --nuit-hairline-hi:   rgba(243, 206, 234, 0.38);

  /* Textes sur surfaces */
  --text:               var(--encre);
  --text-muted:         var(--gris-ink);
  --text-inverse:       #FFFFFF;
  --text-inverse-muted: #D9CBE8;

  /* ── 4. DÉGRADÉS ───────────────────────────────────────────────────── */
  /* Décoratifs : JAMAIS de texte blanc dessus */
  --degrade:              linear-gradient(135deg, #4B1D6D 0%, #E91E63 52%, #FF8C00 100%);
  --degrade-rev:          linear-gradient(135deg, #FF8C00 0%, #E91E63 48%, #4B1D6D 100%);
  --degrade-violet-magenta: linear-gradient(135deg, #4B1D6D 0%, #E91E63 100%);
  --degrade-magenta-orange: linear-gradient(135deg, #E91E63 0%, #FF8C00 100%);
  --degrade-subtle:       linear-gradient(180deg, #F3EEF7 0%, #FFFFFF 100%);
  --degrade-dark:         linear-gradient(180deg, #1A072A 0%, #2E1143 100%);

  /* CTA : seuls autorisés sous du texte blanc — NEW */
  --degrade-cta:         linear-gradient(135deg, #4B1D6D 0%, #C2185B 52%, #A84500 100%);
  --degrade-cta-rev:     linear-gradient(135deg, #A84500 0%, #C2185B 48%, #4B1D6D 100%);
  --degrade-cta-vm:      linear-gradient(135deg, #4B1D6D 0%, #C2185B 100%);
  --degrade-cta-mo:      linear-gradient(135deg, #C2185B 0%, #A84500 100%);

  /* ── 5. TYPOGRAPHIE ────────────────────────────────────────────────── */
  --display: 'Fraunces', Georgia, 'Times New Roman', serif;
  --body: 'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --mono: 'Space Mono', 'SF Mono', Consolas, Monaco, monospace;

  /* Échelle de corps — NEW */
  --fs-body:  1.0625rem;                          /* 17px */
  --fs-lead:  clamp(1.0625rem, 1.4vw, 1.25rem);   /* 17 → 20px */
  --fs-sm:    0.9375rem;                          /* 15px */
  --fs-xs:    0.8125rem;                          /* 13px */
  --fs-mono:  0.75rem;                            /* 12px */
  --fs-micro: 0.6875rem;                          /* 11px */

  /* Échelle display — ratio ~1.25 (tierce majeure), normalisée */
  --fs-h1: clamp(2.5rem,  6.0vw, 4.25rem);        /* 40 → 68px */
  --fs-h2: clamp(2.0rem,  4.0vw, 3.0rem);         /* 32 → 48px */
  --fs-h3: clamp(1.5rem,  2.4vw, 2.0rem);         /* 24 → 32px */
  --fs-h4: clamp(1.25rem, 1.7vw, 1.5rem);         /* 20 → 24px */
  --fs-h5: 1.125rem;                              /* 18px */
  --fs-h6: 1rem;                                  /* 16px */

  /* Interlignes — NEW */
  --lh-display: 1.10;
  --lh-h2:      1.15;
  --lh-h3:      1.22;
  --lh-h4:      1.28;
  --lh-body:    1.65;
  --lh-lead:    1.60;

  /* Graisses & suivi — NEW */
  --fw-display: 600;
  --fw-body: 400;
  --fw-bold: 700;
  --fw-black: 800;
  --ls-display: -0.018em;
  --ls-mono:    0.14em;
  --ls-kicker:  0.22em;

  /* ── 6. ESPACEMENT — base 4px, échelle 12 crans — NEW ──────────────── */
  --sp-0:  0;
  --sp-1:  0.25rem;  /*  4px — 0.3 / 0.35rem existants */
  --sp-2:  0.5rem;   /*  8px — 0.4 / 0.45 / 0.5rem      */
  --sp-3:  0.75rem;  /* 12px — 0.6 / 0.65 / 0.75 / 0.8  */
  --sp-4:  1rem;     /* 16px — 0.85 / 0.9 / 1rem        */
  --sp-5:  1.25rem;  /* 20px — 1.1 / 1.2 / 1.25rem      */
  --sp-6:  1.5rem;   /* 24px — 1.4 / 1.5 / 1.6rem       */
  --sp-7:  2rem;     /* 32px — 1.8 / 2rem               */
  --sp-8:  2.5rem;   /* 40px — 2.2 / 2.5rem             */
  --sp-9:  3rem;     /* 48px — 2.8 / 3 / 3.2rem         */
  --sp-10: 4rem;     /* 64px — 3.5 / 4rem               */
  --sp-11: 5rem;     /* 80px — 4.5 / 5rem               */
  --sp-12: 6rem;     /* 96px — 6rem                     */
  --sp-px: 1px;      /* filets                          */

  /* Rythme vertical de section — NEW */
  --section-y:  clamp(4rem, 7.5vw, 6.5rem);
  --section-y-sm: clamp(2.8rem, 5vw, 4.5rem);
  --stack:      var(--sp-4);   /* gouttière par défaut des piles */
  --gutter:     clamp(1rem, 2.5vw, 2rem);

  /* ── 7. RAYONS — échelle continue 4→48 — NEW (--r-xs, --r-2xl ajoutés) */
  --r-xs:  4px;
  --r-sm:  8px;
  --r:     14px;
  --r-md:  18px;
  --r-lg:  26px;
  --r-xl:  36px;
  --r-2xl: 48px;
  --r-full: 9999px;

  /* ── 8. OMBRES — 5 niveaux, même matrice chromatique ───────────────── */
  --shadow-xs: 0 1px 2px rgba(46, 17, 67, 0.06);
  --shadow-sm: 0 4px 14px rgba(46, 17, 67, 0.05);
  --shadow:    0 16px 45px -12px rgba(46, 17, 67, 0.16);
  --shadow-lg: 0 28px 65px -18px rgba(46, 17, 67, 0.26);
  --shadow-xl: 0 44px 90px -24px rgba(46, 17, 67, 0.34);
  --shadow-glow:   0 12px 32px -8px rgba(233, 30, 99, 0.45);
  --shadow-orange: 0 12px 32px -8px rgba(255, 140, 0, 0.40);
  --shadow-nuit:   0 18px 44px -14px rgba(12, 4, 22, 0.60);  /* NEW — surfaces sombres */
  --shadow-dry:    3px 3px 0 rgba(46, 17, 67, 0.14);          /* NEW — ombre sèche signature */

  /* ── 9. ÉTATS — NEW ────────────────────────────────────────────────── */
  --state-hover:  rgba(46, 17, 67, 0.06);
  --state-active: rgba(46, 17, 67, 0.12);
  --state-hover-inverse:  rgba(255, 255, 255, 0.12);
  --state-active-inverse: rgba(255, 255, 255, 0.20);
  --disabled-bg:     #E7E3EA;
  --disabled-text:   #8A8590;   /* 3.2:1 — volontairement sous AA, statut désactivé */
  --disabled-op:     0.55;

  /* Anneau de focus dual (visible sur fond clair ET sombre) — NEW */
  --focus-ring:       #E91E63;  /* 4.35 blanc · 3.81 lavande · 4.26 nuit · 3.78 violet-deep */
  --focus-ring-dark:  #FFB020;  /* 10.13 nuit · 8.99 violet-deep · 6.77 violet */
  --focus-halo:       #FFFFFF;
  --focus-halo-dark:  #1B0B2E;
  --focus-w:          3px;
  --focus-offset:     2px;

  /* ── 10. MOTION — NEW ──────────────────────────────────────────────── */
  --dur-1: 120ms;   /* micro : couleur, opacité      */
  --dur-2: 200ms;   /* court : survol, bordure       */
  --dur-3: 320ms;   /* moyen : transform, ombre      */
  --dur-4: 480ms;   /* long  : panneaux, drawer      */
  --dur-5: 720ms;   /* reveal au scroll              */
  --ease:        cubic-bezier(0.22, 0.80, 0.24, 1);
  --ease-in:     cubic-bezier(0.40, 0.00, 1.00, 1);
  --ease-out:    cubic-bezier(0.00, 0.00, 0.20, 1);
  --ease-in-out: cubic-bezier(0.42, 0.00, 0.58, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-linear: linear;

  /* ── 11. COUCHES & MESURES ─────────────────────────────────────────── */
  --z-grain:   1500;
  --z-progress: 2100;
  --header-h: 76px;
  --topbar-h: 38px;
  --measure: 60ch;        /* largeur de lecture */
  --container: 1240px;
  --container-narrow: 840px;
  --hairline: 1px solid rgba(46, 17, 67, 0.12);   /* NEW */
}
```

### 2.1 Variante « surface sombre » — à poser sur le conteneur

```css
/* À appliquer sur : .top-alert-strip, .side-ad-card, tout bloc fond nuit */
.surface-dark,
.on-dark {
  --focus-ring: var(--focus-ring-dark);
  --focus-halo: var(--focus-halo-dark);
  --text: var(--text-inverse);
  --text-muted: var(--text-inverse-muted);
  --state-hover: var(--state-hover-inverse);
  --state-active: var(--state-active-inverse);
  --hairline: 1px solid var(--nuit-hairline);
  color: var(--text);
}
```

---

## 3. Règles globales corrigées (à coller en remplacement des lignes 70–124)

```css
/* ==========================================================================
   RESET & RÈGLES GLOBALES — version corrigée
   ========================================================================== */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--body);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  color: var(--text);
  background-color: var(--surface);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

img, svg, video {
  display: block;
  max-width: 100%;
  height: auto;
}

/* ── Liens ───────────────────────────────────────────────────────────── */
a {
  color: inherit;
  text-decoration: none;
  transition: color var(--dur-2) var(--ease), opacity var(--dur-2) var(--ease);
}
a:not([class]) { text-decoration: underline; text-underline-offset: 3px; }

/* ── Éléments de formulaire & boutons ────────────────────────────────── */
button, input, textarea, select {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
}

button {
  cursor: pointer;
  border: none;
  background: none;
  -webkit-tap-highlight-color: transparent;
}

button:disabled,
[aria-disabled="true"],
.is-disabled {
  background: var(--disabled-bg);
  color: var(--disabled-text);
  box-shadow: none;
  cursor: not-allowed;
  opacity: var(--disabled-op);
  pointer-events: none;
}

/* ── Sélection ───────────────────────────────────────────────────────── */
::selection {
  background: var(--magenta-ink);   /* #C2185B au lieu de #E91E63 */
  color: #ffffff;                   /* 5.87:1 — AA */
}

/* ── ANNEAU DE FOCUS DUAL (renforcé) ─────────────────────────────────── */
/* Un seul anneau magenta échoue à 2.85:1 sur un bouton violet plein.
   Le double anneau (halo + trait) garantit ≥ 3:1 sur TOUT fond clair ou sombre. */
:focus-visible {
  outline: var(--focus-w) solid var(--focus-ring);
  outline-offset: var(--focus-offset);
  box-shadow: 0 0 0 calc(var(--focus-offset) + var(--focus-w) + 1px) var(--focus-halo);
  border-radius: var(--r-xs);
  position: relative;
  z-index: 2;
}
/* Sécurité : jamais de suppression d'anneau sans remplacement */
:focus:not(:focus-visible) { outline: none; }

/* ── MOTION : respect global de prefers-reduced-motion ───────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
  .grain { display: none; }
}
```

**Pourquoi le halo :** `#E91E63` ne fait que **2.85:1** contre un bouton `--violet` plein (sous le seuil 3:1 de WCAG 1.4.11). Le halo blanc de 6 px intercalé entre le composant et l'anneau restaure la séparation. Sur fond nuit, `--focus-ring-dark: #FFB020` monte à **10.13:1**.

---

## 4. Hiérarchie & échelles — diagnostic et normalisation

### 4.1 Typographie

**Échelle actuelle :** `h1` 36.8→64 · `h2` 29.6→44 · `h3` 20→25.6 · `h4` 16.8→20.
Ratios observés : 64/44 = **1.45**, 44/25.6 = **1.72**, 25.6/20 = **1.28**. → **échelle incohérente**, le saut h2→h3 est trop grand et h3→h4 trop petit. De plus `h3` (25.6 px) est plus petit que certains `font-size` codés en dur (`1.6rem` = 25.6, `2.2rem` = 35.2 à la ligne 4384).

**Correction :** ratio ~**1.25** constant → `--fs-h1…--fs-h6` (voir §2).

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--display);
  font-weight: var(--fw-display);
  letter-spacing: var(--ls-display);
  color: var(--violet-deep);            /* 16.44:1 — AAA */
  text-wrap: balance;
}
h1 { font-size: var(--fs-h1); line-height: var(--lh-display); }
h2 { font-size: var(--fs-h2); line-height: var(--lh-h2); }
h3 { font-size: var(--fs-h3); line-height: var(--lh-h3); }
h4 { font-size: var(--fs-h4); line-height: var(--lh-h4); }
h5 { font-size: var(--fs-h5); line-height: 1.3; }
h6 { font-size: var(--fs-h6); line-height: 1.35; }

.accent      { font-style: italic; color: var(--magenta-ink); }   /* #C2185B — 5.87:1 */
.accent-grad { background: var(--degrade); -webkit-background-clip: text;
               background-clip: text; color: transparent; }       /* décoratif only */

.lead { color: var(--gris-ink); font-size: var(--fs-lead);
        line-height: var(--lh-lead); max-width: var(--measure); }
.lead.on-dark { color: var(--text-inverse-muted); }               /* #D9CBE8 — 12.04:1 */

.kicker { font-family: var(--mono); font-size: var(--fs-mono); font-weight: var(--fw-bold);
          letter-spacing: var(--ls-kicker); text-transform: uppercase;
          color: var(--violet); margin-bottom: var(--sp-3); }
.kicker.on-dark { color: var(--rose-on-dark); }                   /* 13.08:1 */

.meta  { font-family: var(--mono); font-size: var(--fs-micro);
         color: var(--gris-ink); letter-spacing: 0.04em; }
.crumb { font-family: var(--mono); font-size: var(--fs-micro);
         color: var(--gris-ink); letter-spacing: 0.1em; text-transform: uppercase; }
.crumb a { color: var(--violet); }
.crumb a:hover { color: var(--magenta-ink); }
.crumb i { color: var(--orange-ink); font-style: normal; }        /* séparateur — 5.45:1 */
```

**30 valeurs `font-size` distinctes** ont été recensées (0.62 → 2.2 rem). Consigne : toute valeur hors `--fs-*` est ramenée au cran le plus proche. Mapping : `0.62/0.64/0.66/0.68` → `--fs-micro` · `0.7/0.72/0.74/0.76` → `--fs-mono` · `0.78/0.82` → `--fs-xs` · `0.84/0.86/0.88/0.9/0.92/0.94/0.95` → `--fs-sm` · `1.12/1.15/1.18/1.2/1.22` → `--fs-h6/h5` · `1.35/1.4` → `--fs-h4` · `1.6/2.2` → `--fs-h3/h2`.

### 4.2 Rayons

Échelle actuelle `8 · 14 · 18 · 26 · 36` — **bonne progression**, mais **62 occurrences de rayons codés en dur** hors tokens : `50%` (17), `16px` (9), `12px` (8), `18px` (6), `9999px` (5), `14px` (5), `20px` (3), `8px` (2), `10px` (2), `6px`, `4px`, `2px` (1 chacun), plus 3 `!important`.

**Correction :** ajout `--r-xs: 4px` et `--r-2xl: 48px`. Mapping : `4px`→`--r-xs` · `6px`/`8px`→`--r-sm` · `10px`/`12px`→`--r-sm` ou `--r` selon contexte · `14px`→`--r` · `16px`/`18px`→`--r-md` · `20px`→`--r-md` · `26px`→`--r-lg` · `36px`→`--r-xl` · `9999px`→`--r-full` · `50%`→`--r-full` (si cercle) ou `border-radius: 50%` conservé mais tokenisé `--r-circle`.

### 4.3 Ombres

5 niveaux `xs → xl` sur **une seule matrice chromatique** `rgba(46, 17, 67, α)` (violet-deep, pas de noir neutre — cohérence de marque). Ajout de `--shadow-nuit` (plus opaque, pour les cartes sur fond sombre) et `--shadow-dry` (ombre sèche signature, voir §7.3).

### 4.4 Motion

| Cran | Durée | Usage |
|---|---|---|
| `--dur-1` | 120 ms | couleur, opacité, bordure |
| `--dur-2` | 200 ms | survol simple, icône |
| `--dur-3` | 320 ms | `transform`, `box-shadow`, boutons |
| `--dur-4` | 480 ms | panneaux, drawer, accordéon |
| `--dur-5` | 720 ms | `[data-reveal]` au scroll |

**État actuel :** 15 valeurs de `transition` distinctes (0.1 s → 0.85 s), `transition: all` dans 5 cas (coûteux et imprécis). Consigne : remplacer tout `transition: all Xs` par la **propriété exacte** + `--dur-*` + `--ease*`. Et **une seule** occurrence de `prefers-reduced-motion` existe (ligne 4041, côté JS uniquement) → ajout du bloc CSS global (§3).

---

## 5. Jetons de surface claires / sombres

| Rôle clair | Valeur | Rôle sombre | Valeur | Notes |
|---|---|---|---|---|
| `--surface` | `#FFFFFF` | `--nuit` | `#1B0B2E` | fond de section |
| `--surface-subtle` | `#FAF7FC` | `--nuit-deep` | `#1A072A` | fond alterné / dégradé |
| `--surface-muted` | `#F3EEF7` | `--nuit-raised` | `#241730` | carte posée |
| `--surface-tint` | `#EADFF0` | `--nuit-raised-hi` | `#2E1143` | carte surélevée |
| `--surface-inset` | `#F0EDF2` | — | — | champ, séparateur |
| `--hairline` | `rgba(46,17,67,.12)` | `--nuit-hairline` | `rgba(243,206,234,.22)` | filets |
| `--text` | `#241730` (16.93:1) | `--text-inverse` | `#FFFFFF` (18.52:1) | corps |
| `--text-muted` | `#595959` (7.00:1) | `--text-inverse-muted` | `#D9CBE8` (12.04:1) | chapeaux, métas |

**Unification `#1F162B` → `--nuit` :** `#1F162B` (18 occ.) et `#1B0B2E` (5 occ.) sont deux violets-nuit quasi identiques (ΔE imperceptible) qui jouent le même rôle. On ne garde **qu'un seul** : `--nuit: #1B0B2E`. `#1A072A` reste comme `--nuit-deep` (dégradés).

---

## 6. Liste des remplacements mécaniques

Occurrences comptées par `grep -o` sur `index.html` (6915 lignes). Les compteurs `#FFFFFF`/`#ffffff` sont case-insensitifs : **94** occurrences de blanc au total, dont ~40 en `rgba(255,255,255,…)`.

### 6.1 Couleurs hex → tokens

| # | Chercher | Remplacer par | Occ. | Priorité | Condition |
|---|---|---|---|---|---|
| R1 | `#1F162B` | `var(--nuit)` | **18** | 🟠 | partout (y compris dans les `style=""` inline) |
| R2 | `#1B0B2E` | `var(--nuit)` | **5** | 🟠 | partout |
| R3 | `#2E1143` | `var(--violet-deep)` | **17** | 🟢 | partout |
| R4 | `#4B1D6D` | `var(--violet)` | **25** | 🟢 | partout |
| R5 | `#1A072A` | `var(--nuit-deep)` | **3** | 🟢 | partout |
| R6 | `#241730` | `var(--encre)` | **1** | 🟢 | — |
| R7 | `#403B45` | `var(--gris-dark)` | **1** | 🟢 | — |
| R8 | `#6B6B6B` | `var(--gris-ink)` | **1** | 🔴 | texte uniquement |
| R9 | `#E91E63` | `var(--magenta)` | **39** | 🔴 | **décoratif** (fond, bordure, ombre, `rgba`) |
| R9b | `#E91E63` | `var(--magenta-ink)` | (dans R9) | 🔴 | **texte** sur fond clair |
| R9c | `#E91E63` | `var(--magenta-on-dark)` | (dans R9) | 🔴 | **texte** sur fond sombre |
| R10 | `#B3114B` | `var(--magenta-dark)` | **7** | 🟢 | — |
| R11 | `#FF8C00` | `var(--orange)` | **30** | 🟠 | **décoratif** (fond, dégradé, ombre) |
| R11b | `#FF8C00` | `var(--orange-ink)` | (dans R11) | 🔴 | **texte / séparateur** sur clair |
| R11c | `#FF8C00` | `var(--orange-on-dark)` | (dans R11) | 🟢 | sur fond sombre (déjà AAA) |
| R12 | `#E65100` | `var(--orange-deep-ink)` | **3** | 🔴 | texte — valeur corrigée |
| R13 | `#D81B60` | `var(--magenta-dark)` | **6** | 🟠 | fonds boutons (blanc dessus 4.95:1 ✅) |
| R14 | `#0A66C2` | `var(--li)` | **5** | 🟠 | → `#0B5CAE` via le token (6.65:1) |
| R15 | `#25D366` | `var(--wa)` | **4** | 🔴 | → `#107C41` via le token (5.27:1)⚠️ voir R15b |
| R15b | `#25D366` en `color:` | `var(--wa-ink)` | **2** (l. 611, 4696) | 🔴 | texte sur fond clair/tinté |
| R16 | `#F3CEEA` | `var(--rose-on-dark)` | **4** | 🟢 | déjà AAA (13.08:1) |
| R17 | `#D9CBE8` | `var(--lavande-on-dark)` | **10** | 🟢 | déjà AAA (12.04:1) |
| R18 | `#F3EEF7` | `var(--surface-muted)` | **9** | 🟢 | — |
| R19 | `#FAF7FC` | `var(--surface-subtle)` | **20** | 🟢 | — |
| R20 | `#FCE4EC` | `var(--magenta-light)` | **1** | 🟢 | — |
| R21 | `#FFF3E0` | `var(--orange-light)` | **4** | 🟢 | — |
| R22 | `#F0EDF2` | `var(--surface-inset)` | **1** | 🟢 | — |
| R23 | `#EADFF0` | `var(--surface-tint)` | **1** | 🟢 | — |
| R24 | `#EDEDED` | `var(--surface-inset)` | **2** | 🟢 | bordure header (l. 398) |
| R25 | `#FFFFFF` / `#ffffff` | `var(--blanc)` | **94** | 🟡 | optionnel — priorité aux blocs `style=""` |

> ⚠️ **R15 / R15b ne sont PAS un simple chercher-remplacer.** `#25D366` sert à la fois de **fond** (`.m-action-wa`, l. 474) et de **texte** (`.d-action-wa`, l. 611). Un remplacement aveugle casserait l'un des deux. Traiter les 4 occurrences une par une.

### 6.2 `rgba()` → tokens

| # | Chercher | Remplacer par | Occ. |
|---|---|---|---|
| A1 | `rgba(75, 29, 109, …)` | `var(--violet-glow)` / nouveau `--violet-a{10,12,25,40}` | **37** |
| A2 | `rgba(233, 30, 99, …)` | `var(--magenta-a{12,22,30,45})` | **16** |
| A3 | `rgba(255, 140, 0, …)` | `var(--orange-a{15,25,40})` | **5** |
| A4 | `rgba(46, 17, 67, …)` | `var(--nuit-a{5,12,16,25,34})` | **6** |
| A5 | `rgba(27, 11, 46, …)` | `var(--nuit-a*)` | **1** |
| A6 | `rgba(255, 255, 255, …)` | `--blanc-a{12,20,30}` | **40** |

**Jetons alpha à créer** (compléter le `:root`) :

```css
--violet-a10: rgba(75, 29, 109, .10);
--violet-a12: rgba(75, 29, 109, .12);
--violet-a25: rgba(75, 29, 109, .25);
--violet-a40: rgba(75, 29, 109, .40);
--magenta-a12: rgba(233, 30, 99, .12);
--magenta-a22: rgba(233, 30, 99, .22);
--magenta-a30: rgba(233, 30, 99, .30);
--magenta-a45: rgba(233, 30, 99, .45);
--orange-a15: rgba(255, 140, 0, .15);
--orange-a25: rgba(255, 140, 0, .25);
--orange-a40: rgba(255, 140, 0, .40);
--nuit-a05: rgba(46, 17, 67, .05);
--nuit-a12: rgba(46, 17, 67, .12);
--nuit-a16: rgba(46, 17, 67, .16);
--nuit-a26: rgba(46, 17, 67, .26);
--nuit-a34: rgba(46, 17, 67, .34);
--blanc-a12: rgba(255, 255, 255, .12);
--blanc-a20: rgba(255, 255, 255, .20);
--blanc-a30: rgba(255, 255, 255, .30);
```

### 6.3 Espacement → échelle (`--sp-*`)

| Valeurs existantes | Token | Occ. cumulées (approx.) |
|---|---|---|
| `0.3rem`, `0.35rem` | `--sp-1` (4 px) | ~6 |
| `0.4rem`, `0.45rem`, `0.5rem` | `--sp-2` (8 px) | ~18 |
| `0.6rem`, `0.65rem`, `0.75rem`, `0.8rem` | `--sp-3` (12 px) | ~30 |
| `0.85rem`, `0.9rem`, `1rem` | `--sp-4` (16 px) | ~14 |
| `1.1rem`, `1.2rem`, `1.25rem`, `1.3rem` | `--sp-5` (20 px) | ~20 |
| `1.4rem`, `1.5rem`, `1.6rem` | `--sp-6` (24 px) | ~20 |
| `1.8rem`, `2rem` | `--sp-7` (32 px) | ~15 |
| `2.2rem`, `2.5rem` | `--sp-8` (40 px) | ~6 |
| `2.8rem`, `3rem`, `3.2rem`, `3.5rem` | `--sp-9` (48 px) | ~14 |
| `4rem`, `4.5rem` | `--sp-10` (64 px) | ~6 |
| `5rem` | `--sp-11` (80 px) | ~2 |
| `6rem` | `--sp-12` (96 px) | ~2 |

### 6.4 Rayons → échelle

| Chercher | Remplacer par | Occ. |
|---|---|---|
| `border-radius: 4px` | `var(--r-xs)` | 1 |
| `border-radius: 6px` / `8px` | `var(--r-sm)` | 3 |
| `border-radius: 10px` / `12px` | `var(--r-sm)` → `var(--r)` | 12 |
| `border-radius: 14px` | `var(--r)` | 6 |
| `border-radius: 16px` / `18px` / `20px` | `var(--r-md)` | 18 |
| `border-radius: 26px` | `var(--r-lg)` | — |
| `border-radius: 36px` | `var(--r-xl)` | — |
| `border-radius: 9999px` | `var(--r-full)` | 5 |
| `border-radius: 50%` | `var(--r-circle)` (nouveau : `50%`) | 17 |

### 6.5 Ordre d'exécution recommandé pour 筑原型

1. Remplacer le `:root` (§2) + ajouter les jetons alpha (§6.2).
2. Remplacer le bloc reset/focus/motion (§3).
3. Remplacements **texte** : R8, R9b, R9c, R11b, R12, R14, R15, R15b. *(ceux qui corrigent le contraste)*
4. Remplacements **décoratifs** : R1–R7, R9, R10, R11, R13, R16–R24.
5. Espacement et rayons (§6.3, §6.4) — passe cosmétique, aucune incidence WCAG.
6. Vérifier aucun `#` hex hors `:root` , puis relancer un audit contraste.

---

## 7. Recommandations de spécificité — sortir du « template générique »

Le socle actuel est compétent mais **générique** : dégradé violet→magenta→orange + ombres douces + Fraunces = la recette de 40 % des sites Webflow 2024. Voici 8 décisions qui ancrent le design dans la RDC et le cyberféminisme.

### 7.1 Matière : la trame Kuba, pas le grain aléatoire

Le filtre `feTurbulence` (ligne 145) est le grain SVG standard — reconnaissable au premier coup d'œil. Remplacer par un **motif géométrique inspiré du textile Kuba (Kasaï)** : un SVG `pattern` de chevrons/damiers à 24 px, `opacity: .04`, `mix-blend-mode: multiply`, appliqué **uniquement** sur les bandeaux de section et les cartes éditoriales — pas sur tout le body. Le grain devient une signature culturelle, pas un effet.

```css
.trame-kuba {
  background-image: url("data:image/svg+xml,…chevrons…");
  background-size: 24px 24px;
  opacity: .04;
  mix-blend-mode: multiply;
  pointer-events: none;
}
```

### 7.2 Vocabulaire de tokens : nommer en lingua, pas en code

Renommer **l'usage**, pas le `:root` : les classes et les commentaires doivent porter le lexique de FemCurrent. `--nuit` → commenté « nuit de Goma », `--magenta-ink` → « **lumière** », `--orange-ink` → « **flambe** » , `--gris-ink` → « terre ». Cela ne coûte rien techniquement et rend le code illisible-copiable par un template.

### 7.3 Ombres sèches sur les cartes d'action

Remplacer les ombres douces `0 16px 45px -12px` par une **ombre sèche décalée** sur les CTA et cartes d'engagement : `box-shadow: 3px 3px 0 rgba(46,17,67,.14)` (token `--shadow-dry`). C'est la signature des affiches militantes et des imprimés — ça ancre physiquement le numérique. Conserver les ombres douces pour les surfaces flottantes (modales, drawer) seulement.

### 7.4 Sous-lignage « wax » au lieu de `border-bottom`

Le `.see-all` utilise un `border-bottom: 2px solid var(--orange)` (l. 338). Remplacer par un **soulignement en trois barres décalées** (hommage aux motifs wax), implémenté en `background-image: linear-gradient` répété ou en `::after` avec `repeating-linear-gradient`. Évite l'effet « lien bootstrap ».

```css
.see-all::after {
  content: '';
  display: block;
  height: 3px;
  margin-top: 4px;
  background: repeating-linear-gradient(90deg,
    var(--magenta-ink) 0 10px, transparent 10px 14px,
    var(--orange-ink) 14px 24px, transparent 24px 28px);
}
```

### 7.5 Détail typographique : activer les axes variables de Fraunces

Fraunces est chargé en `ital,opsz,wght` — mais les axes **`SOFT`** et **`WONK`** ne sont pas demandés dans l'URL Google Fonts (l. 10). Les activer donne une irrégularité organique qu'aucun template n'a :

```
family=Fraunces:ital,opsz,SOFT,WONK,wght@0,9..144,0..100,0..1,300..900;…
```

Puis : `h1, h2 { font-variation-settings: 'SOFT' 40, 'WONK' 1; }` et `h1 { font-optical-sizing: auto; }`. Les chiffres (statistiques, compteurs, dates) passent en **Space Mono avec `font-variant-numeric: tabular-nums`** — crucial pour un site qui publie des données.

### 7.6 Traitement photographique : duotone ancré, jamais de stock générique

Appliquer un **duotone violet-deep / orange** (`#2E1143` dans les ombres, `#FFC24D` dans les hautes lumières) sur les portraits, avec `mix-blend-mode: luminosity` + calque `multiply`, et **toujours** un crédit + légende en Space Mono. Interdiction absolue des visuels « femme africaine souriante » génériques : cadrage serré, regard direct vers l'objectif, profondeur de champ courte. Le duotone est un token : `--filter-duotone`.

### 7.7 Rythme : le « souffle » long et la règle de 12

Le rythme actuel est uniforme (`--section-y` partout). Introduire une **alternance respiratoire** : après chaque section dense (grille de 3 cartes), une section « souffle » avec `--section-y-sm` et un filet `--nuit-hairline` de 2 px sur `--sp-10` de marge. Et une grille **12 colonnes / gouttière `--gutter`** (`grid-template-columns: repeat(12, 1fr)`) au lieu des `flex` libres, pour que les cartes d'enquête (5/12), le lead (7/12) et la sidebar (3/12) tombent sur des rapports justes.

### 7.8 Data-viz accessible : hachures, pas seulement la couleur

FemCurrent publie des données (Observatoire). Construire une **palette catégorielle de 5 teintes** dérivée de la triade de marque (`#4B1D6D`, `#C2185B`, `#A35500`, `#0B5CAE`, `#0B6B33`) et systématiquement **doubler la couleur d'une hachure ou d'un motif SVG** (`pattern` diagonal / pointillé / croisé) pour que les graphiques restent lisibles en daltonisme et en impression N&B. Les 5 teintes passent toutes ≥ 4.5:1 sur blanc (vérifié).

---

## 8. Checklist d'application

- [ ] `:root` remplacé (§2) — aucun token existant supprimé
- [ ] Jetons alpha ajoutés (§6.2)
- [ ] Reset + `:focus-visible` dual + `prefers-reduced-motion` global (§3)
- [ ] `.surface-dark` / `.on-dark` appliqués sur `.top-alert-strip`, `.side-ad-card`, blocs `#1F162B`
- [ ] **P1** WhatsApp `#25D366` → `--wa #107C41` (fond) / `--wa-ink #0B6B33` (texte)
- [ ] **P2** `.btn-primary` : `--degrade` → `--degrade-cta`
- [ ] **P3** `#E91E63` texte → `var(--magenta-ink)` (#C2185B)
- [ ] **P4** `#FF8C00` texte/séparateur → `var(--orange-ink)` (#A35500)
- [ ] **P5** `#E65100` → `var(--orange-deep-ink)` (#B33E00)
- [ ] **P6** `#E91E63` sur fond sombre → `var(--magenta-on-dark)` (#FF5C94)
- [ ] Échelle typo `--fs-*` appliquée aux `h1–h6` et aux 30 `font-size` en dur
- [ ] Espacement `--sp-*` (§6.3) et rayons `--r-*` (§6.4)
- [ ] `transition: all` → propriété explicite + `--dur-*` / `--ease*`
- [ ] Aucun `#hex` hors `:root` (grep de contrôle)
- [ ] 8 recommandations de spécificité (§7) — au moins 4 implémentées

**Contrôle final :** `grep -oE '#[0-9A-Fa-f]{6}' index.html | sort -u` ne doit plus renvoyer que les valeurs du `:root`.
