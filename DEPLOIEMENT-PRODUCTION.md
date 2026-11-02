# Préparation de la mise en production — FemCurrent

## Architecture confirmée

- Frontend : `https://femcurrent.com/` (site Hostinger).
- Backend WordPress : `https://admin.femcurrent.com/`.
- API REST de contenus : `/wp-json/wp/v2/`.
- Routes FemCurrent : `/wp-json/femcurrent/v1/` (`contact`, `submit-light`; la version locale ajoute `status`).
- Le frontend vérifie `status` avant d'activer le formulaire TFGBV. Si le bridge sécurisé n'est pas installé ou si sa clé manque, le formulaire reste désactivé.

**Contrôle de production du 2 novembre 2026 :** les routes publiques existantes `/contact` et `/submit-light` sont présentes, mais `/status` répond actuellement `404`. Le bridge modifié ici n'est donc pas encore installé sur WordPress; le formulaire TFGBV sera volontairement désactivé si le frontend est publié avant le bridge.

## Clé de chiffrement TFGBV — configuration WordPress requise

La clé doit être générée **sur une machine sûre et gardée hors de Git**. Exemple de génération locale avec OpenSSL :

```sh
openssl rand -base64 32
```

Dans `wp-config.php`, au-dessus de la ligne de fin de configuration, définir la constante avec la valeur générée :

```php
define('FEMCURRENT_TFGBV_KEY', 'VALEUR_BASE64_DE_32_OCTETS');
```

Ne jamais envoyer la clé dans le dépôt, un ticket, un courriel ou ce fichier. Conserver une copie chiffrée selon la procédure de sauvegarde WordPress : les signalements existants ne pourront pas être déchiffrés après perte ou remplacement de la clé.

Le statut `GET /wp-json/femcurrent/v1/status` doit annoncer `{"tfgbv_enabled":true,"retention_days":30}` après installation du bridge et configuration de la clé. S'il annonce `false`, le formulaire ne collecte rien.

## Installation du bridge

1. Sauvegarder la base WordPress et le plugin actuellement installé.
2. Installer la version locale de `femcurrent-headless-bridge/femcurrent-headless-bridge.php` dans WordPress, puis activer le plugin.
3. Vérifier les routes REST, la prérequête CORS depuis `https://femcurrent.com`, l'accès administrateur aux soumissions et la suppression planifiée.
4. Configurer un cron Hostinger pour déclencher `wp-cron.php` au moins une fois par jour. La suppression quotidienne est planifiée par WP-Cron; sans trafic ou cron externe, l'exécution peut être tardive.
5. Vérifier la clé et le statut sécurisé **avant** d'activer le frontend. Ne pas utiliser de récit réel ou personnel comme test.

## Publication frontend

1. Déployer le `index.html`, `server.js`, `.htaccess`, les assets et `robots.txt` du commit validé sur Hostinger.
2. Vérifier que le domaine sert le frontend et que les appels de lecture et formulaires vont à `admin.femcurrent.com`.
3. Vérifier le statut HTTP, la CSP avec nonce, les routes SPA, `robots.txt`, le sitemap et les envois de test non sensibles.
4. Contrôler les pages sur mobile, clavier et lecteur d'écran; vérifier les erreurs dans la console et les journaux WordPress.
5. Garder la sauvegarde du frontend et de la base pour pouvoir revenir à l'ancienne version.

## Contrôle avant d'annoncer le canal de signalement

- Clé `FEMCURRENT_TFGBV_KEY` définie et sauvegardée hors de la base.
- Extension PHP OpenSSL active.
- Soumissions invisibles par REST publique et visibles uniquement pour les administrateurs autorisés.
- Contenu chiffré dans `wp_posts`; le titre ne contient aucune donnée personnelle.
- Suppression permanente après 30 jours et cron effectivement exécuté.
- Formulaire désactivé si un contrôle échoue; aucune soumission de test en production.

**État actuel :** les changements préparatoires sont locaux. Aucune modification n'a été envoyée à GitHub, à Hostinger ou au WordPress de production. L'activation réelle du canal sensible requiert la configuration de clé ci-dessus et l'installation du bridge mis à jour.

**Vérification PHP :** aucun exécutable PHP n'est disponible dans l'environnement local; la syntaxe du plugin n'a pas pu être validée par `php -l`. Faire ce contrôle dans l'environnement WordPress de préproduction avant activation.
