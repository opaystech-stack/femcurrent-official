# Audit de déploiement FemCurrent

**Date :** 2 novembre 2026  
**Périmètre :** copie locale, `origin/main`, page publique `https://femcurrent.com/` et quelques chemins publics de contrôle.  
**Nature :** comparaison en lecture seule. Aucun fichier applicatif n'a été modifié, commité ou publié pendant cet audit.

## Synthèse

Le checkout local pointe sur `main` et son `HEAD` est exactement le commit `origin/main` (`978234f73e8aeddd0dc91caafc0a7340bbf5204d`, daté du 8 octobre 2026). Il n'y a donc **aucun commit local en avance** à pousser. En revanche, l'arbre de travail contient une importante refonte non commitée : `index.html` (**644 insertions / 261 suppressions**) et `server.js` (**46 insertions / 2 suppressions**), plus `AUDIT-VERIFICATION.md` et sept scripts dans `tools/`, tous non suivis par Git.

Le site en ligne répond en HTTP 200 et sert une page de 294 599 octets. À la lumière du brief client fourni, cette différence est attendue : la page publique correspond à l'ancienne version; la copie locale porte la refonte demandée. Le problème est un **retard de publication**, pas un conflit de positionnement. Les données disponibles ne permettent pas de savoir si la page en ligne vient d'un autre dépôt, d'une installation WordPress, d'un déploiement manuel ou d'un ancien artefact.

## État par cible

| Cible | Constat | Conclusion |
|---|---|---|
| Copie locale → GitHub | `HEAD` = `origin/main`; changements applicatifs locaux et outils non suivis | Les nouveautés locales ne sont ni commités ni poussés |
| GitHub → site public | Le README GitHub décrit une SPA cyberféministe et un bridge WordPress headless; le site public s'affiche comme une plateforme éditoriale de leadership féminin avec actualités, enquêtes, observatoire, ressources et agenda | Pas de preuve d'un déploiement du commit `main` sur le site |
| Site public → chemins techniques | `/robots.txt`, `/sitemap.xml` et une URL inexistante renvoient le même HTML de 294 599 octets, HTTP 200, `text/html`; le backend distinct `admin.femcurrent.com/wp-json/femcurrent/v1/` répond en JSON et annonce les routes POST `submit-light` et `contact` | Défaut confirmé pour robots/sitemap et soft-404; API headless WordPress confirmée sur le sous-domaine `admin` |
| Hébergement public | En-têtes observés : Hostinger (`hcdn`, `platform: hostinger`), CSP limitée à `upgrade-insecure-requests`, `Cache-Control: no-cache` | Le frontal observé est Hostinger; origine et pipeline de publication inconnus |

**Mise à jour après confirmation du client :** WordPress sur `admin.femcurrent.com` est le backend de ce frontend. Ses huit collections nécessaires répondent. Les routes publiques WordPress actuelles contiennent `/contact` et `/submit-light`, mais pas encore `/status` : le bridge durci préparé localement n'est pas installé. La refonte se ferme d'elle-même côté TFGBV jusqu'à l'installation et la configuration de la clé.

## Écarts locaux non publiés

Le diff local porte principalement sur :

- **Sécurité** : remplacement de la CSP `unsafe-inline` par une politique avec nonce injecté par `server.js`; assainissement du contenu WordPress; échappement de textes; protections d'en-têtes et corrections du serveur.
- **Accessibilité et interactions** : ajout de jetons de contraste, labels de formulaires, boutons de pause, états ARIA, accordéon et gestion du focus/défilement.
- **Présentation et structure** : révision importante des styles et composants de `index.html`.
- **Vérification locale** : nouveaux scripts `tools/` et `AUDIT-VERIFICATION.md`, qui ne sont pas versionnés.

Ces changements sont **présents dans le dossier local seulement**. Leur présence dans le diff ne prouve ni leur validation complète, ni leur déploiement. Les outils `smoke.js`, `verify.js` et `xss-test.js` ont depuis été exécutés et passent. Le serveur local a aussi servi `robots.txt` en `text/plain`, `sitemap.xml` en `application/xml`, appliqué une CSP à nonce, répondu 404 aux assets absents et 403 à une tentative de traversée de répertoire.

Depuis le premier audit, le contenu non confirmé a été réduit dans la refonte : compteurs et tableaux provinciaux sans source, faux bandeau de baromètre, logos de partenaires non confirmés et dates d'événements passées ont été corrigés ou retirés. Le zip du bridge a été régénéré depuis le PHP local.

## Version publique : ancienne mouture encore en ligne

- Le HTML public a le titre **« FemCurrent — Les voix et les actions des femmes »** et garde l'ancienne promesse éditoriale de leadership féminin. La copie locale a le titre **« FemCurrent — Initiative Cyberféministe · Technologie, Données & Action Collective »**, conforme au brief reçu.
- La page publique conserve les rubriques actualités, enquêtes, initiatives, observatoire, ressources et agenda. La refonte locale garde ces outils éditoriaux comme moyens au service des cinq fonctions; leur présence ne contredit pas le brief.
- Le site public contient du code client avec des gabarits JavaScript interpolés. Le rendu exploré par l'indexation web montre le contenu éditorial et non ces gabarits; leur présence dans le source n'est donc pas à elle seule la preuve d'un bug d'affichage.
- Le HTML public est annoncé en français, mais propose aussi des liens Français, Lingala, Swahili et English. Le fonctionnement réel de ces versions n'a pas été validé.

## Audit de la refonte locale par rapport au brief client

### Ce qui est déjà repris

- **Vision et posture** : le titre, la méta-description, le manifeste et le README décrivent FemCurrent comme une initiative cyberféministe. La page « À propos » affirme que le média est un moyen, que la technologie est un espace d'activisme, et que les femmes produisent des savoirs et des solutions.
- **Cinq fonctions** : `UNIV` contient Voices, Data, Lab, Community et Impact; elles sont exposées dans la navigation, la page « Nos espaces », la page d'accueil et « À propos ». Matendo et Academy sont présentés séparément comme axes complémentaires, ce qui préserve les cinq fonctions du modèle.
- **Voix** : récits, liberté d'expression, représentation, contre-discours et TFGBV sont décrits; Voices relie vers la médiathèque, les témoignages et les portraits.
- **Connaissance** : cartographie, enquêtes participatives et observatoire des droits numériques sont décrits et reliés aux pages Observatoire, Ressources et Enquêtes.
- **Technologie** : civic tech, sécurité, documentation, IA et cartographies participatives sont décrites; le Lab invite à proposer un projet et à rejoindre la communauté.
- **Organisation** : la page Community cible les profils cités par le client; le formulaire « Rejoindre la communauté » recueille profil, zone géographique et motivation, avec liens vers le groupe Facebook et l'agenda.
- **Impact et cycle** : la page « À propos » illustre l'enchaînement enquête → Data → Voices → Lab → Impact/plaidoyer, et la page Impact reprend la chaîne données → connaissances → mobilisation → plaidoyer → changement.
- **Expérimentation** : la page « À propos » dit explicitement que l'initiative est émergente et que le modèle doit être expérimenté, testé et documenté. C'est un bon cadrage pour une architecture encore en construction.

### Écarts entre le modèle décrit et une infrastructure déjà opérationnelle

1. **Le cycle est aujourd'hui éditorial, pas encore relié par le produit.** Les étapes et les renvois existent dans des textes et CTA. Le code consulté ne montre pas de lien de données ou de workflow reliant un signalement à une enquête, une fiche Data, un projet Lab et une action Impact. Présenter cela comme un modèle à tester est fidèle au brief; le présenter comme un processus déjà en service serait prématuré.
2. **La communauté dispose d'un point d'entrée, pas encore d'un dispositif collectif décrit de bout en bout.** La page expose un formulaire de candidature et le groupe Facebook; elle ne précise pas le parcours après candidature (accueil, animation, règles de sécurité, gouvernance, rythmes, rôle des membres dans les décisions). Le client identifie lui-même la communauté organisée comme un axe à construire. Priorité produit élevée.
3. **Le Lab est une promesse d'expérimentation.** Des thèmes et CTA sont listés, mais aucun catalogue de prototypes, dépôt d'outils, statut de projet, appel à expérimentation ou résultat documenté n'apparaît dans ces sections. Pour l'étape actuelle, les présenter comme pistes/axes plutôt que services disponibles éviterait de surpromettre.
4. **Data et ouverture responsable manquent de garde-fous visibles.** La page promet des données « ouvertes, fiables » et réutilisables en sécurité, mais l'architecture examinée n'expose pas de protocole de consentement à la recherche, anonymisation, classification des risques, gouvernance communautaire, méthode, provenance ou règle de retrait. La TFGBV ne doit pas être rendue ouverte par défaut; chaque jeu nécessite un examen de risque et une décision des personnes concernées.
5. **Plusieurs contenus de démonstration peuvent être pris pour des preuves d'impact.** L'ancien rapport UI local signale des statistiques, partenaires et contenus non vérifiés. Pour une initiative émergente, il faut distinguer clairement exemples de maquette, projets en cours, résultats documentés et partenaires confirmés avant publication.

### Risque prioritaire : collecte de récits sensibles TFGBV

Le formulaire `#lum-cyber` affirme que les données sont « chiffrées » et ne seront jamais publiées sans consentement. Le front transmet le récit à l'endpoint public `/submit-light`; dans le bridge versionné, le callback construit un texte contenant le récit et l'enregistre comme contenu d'une soumission WordPress en attente (`wp_insert_post`). Aucun chiffrement applicatif au repos, contrôle de rétention, procédure d'effacement, contrôle anti-abus ou canal d'aide sécurisé n'est visible dans le code examiné. Cela ne prouve pas l'absence de chiffrement au niveau de l'hébergeur, qui reste inconnu, mais **la promesse de chiffrement ne peut pas être vérifiée**. Le formulaire ne propose pas non plus clairement une soumission anonyme ni n'explique qui accède aux récits, combien de temps ils sont gardés et comment demander leur suppression.

**Avant collecte réelle de récits sensibles :** vérifier et documenter la sécurité du stockage et des accès, réduire au minimum les données demandées, définir une conservation/suppression, ajouter un choix anonyme et un consentement éclairé spécifique à la collecte, puis revoir la promesse affichée. Les signalements ouverts sans limitation peuvent aussi recevoir du spam; prévoir limitation de débit et protection contre les abus.

## Défauts publics confirmés — priorité haute

## Défauts publics confirmés — priorité haute

1. **`robots.txt` absent ou mal servi** : son URL renvoie la page HTML d'accueil, pas un fichier robots en texte brut.
2. **`sitemap.xml` absent ou mal servi** : son URL renvoie également la page HTML d'accueil, pas un sitemap XML.
3. **Soft-404** : une URL aléatoire inexistante reçoit le code HTTP 200 et la page d'accueil. Les moteurs et les outils ne peuvent pas distinguer cette erreur d'une page valide via le statut HTTP.
4. **CSP publique faible pour une défense XSS** : l'unique directive observée est `upgrade-insecure-requests`; pas de `default-src`, `script-src` ou `object-src` dans l'en-tête. Ce contrôle ne permet pas de conclure sur d'éventuelles protections appliquées ailleurs.
5. **Origine et version déployée inconnues** : le serveur ne publie aucun identifiant de commit. Il n'est pas possible d'associer de façon probante la page à `origin/main` ou à la copie locale.

## Actions restantes avant publication

- Garder le brief client comme référence éditoriale et publier la refonte lorsqu'elle est validée; le site visible est encore l'ancienne mouture.
- Traiter le flux et la promesse de sécurité des signalements TFGBV avant toute collecte réelle.
- Donner un parcours concret à la communauté (accueil, règles, animation et participation aux décisions) et signaler clairement les dispositifs encore expérimentaux.
- Distinguer les données et partenaires confirmés des contenus d'exemple; publier la méthode et les règles de gouvernance des données avant d'annoncer des données ouvertes.
- Le sous-domaine `admin.femcurrent.com` expose bien l'API WordPress et les routes déclarées par le bridge. Confirmer si le plugin source du dépôt est la même version que celle installée sur la production avant de mettre à jour le backend.
- Installer le bridge local mis à jour sur WordPress et confirmer que `/status` annonce `tfgbv_enabled: true`, après avoir défini la clé de chiffrement hors dépôt. Tant que le statut renvoie 404 ou false, le formulaire TFGBV reste fermé.
- Passer le site sur un environnement de préproduction Hostinger connecté au backend WordPress avant publication publique. Aucun environnement de préproduction ni accès d'hébergement n'a été identifié dans le poste de travail.
- Configurer un cron fiable sur Hostinger pour que la purge des récits de plus de 30 jours ne dépende pas uniquement du trafic WordPress.
- Valider la refonte locale avant de l'intégrer : les rapports existants signalent encore des défauts ouverts et les scripts de vérification n'ont pas été exécutés ici.
- Établir la procédure de déploiement et relever le commit/artefact réellement publié afin que la comparaison puisse être répétée sans ambiguïté.

## Limites

Audit ponctuel du 2 novembre 2026. Les contrôles du site ont porté sur les réponses HTTP et le contenu HTML d'accueil et de quelques chemins; aucun audit visuel multi-écran, test clavier/lecteur d'écran, soumission de formulaire, analyse exhaustive des routes ni mesure Core Web Vitals n'a été réalisé. Les réponses de routes WordPress peuvent dépendre de règles serveur; les constats ci-dessus décrivent les réponses observées, sans attribuer une cause technique certaine.

## Sources

- [Site public FemCurrent](https://femcurrent.com/)
- [Dépôt GitHub femcurrent-official](https://github.com/opaystech-stack/femcurrent-official)
- État local du dépôt et des fichiers le 2 novembre 2026.
