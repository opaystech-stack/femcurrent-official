<?php
/**
 * Plugin Name: FemCurrent Headless Bridge
 * Plugin URI: https://femcurrent.com
 * Description: Moteur Headless officiel pour FemCurrent Média : CORS, Custom Post Types complets, redirection frontend propre sans # et API REST temps réel.
 * Version: 2.1.0
 * Author: Équipe FemCurrent & OPAYSTECH
 * Author URI: https://femcurrent.com
 * License: GPL-2.0+
 */

if (!defined('ABSPATH')) {
    exit;
}

/* ==========================================================================
   1. GESTION DU CORS COMPLET
   ========================================================================== */
add_action('init', function () {
    $allowed_origins = [
        'https://femcurrent.com',
        'https://www.femcurrent.com',
        'http://localhost:8085',
        'http://localhost:3000',
        'http://localhost:8080'
    ];

    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

    if (in_array($origin, $allowed_origins) || empty($origin)) {
        header("Access-Control-Allow-Origin: " . ($origin ? $origin : '*'));
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Type, Accept, Origin, X-Requested-With");
    }

    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
});

/* ==========================================================================
   2. CRÉATION AUTOMATIQUE DES CATÉGORIES OFFICIELLES
   ========================================================================== */
add_action('init', function () {
    $categories = [
        'Enquêtes & Analyses' => 'enquetes-analyses',
        'Initiatives de terrain' => 'initiatives-terrain',
        'Observatoire & Données' => 'observatoire-donnees',
        'Société' => 'societe',
        'Leadership féminin' => 'leadership-feminin',
        'Numérique' => 'numerique',
        'Santé' => 'sante',
        'Économie' => 'economie',
        'Gouvernance' => 'gouvernance',
        'Innovation' => 'innovation',
        'Enjeux émergents' => 'enjeux-emergents'
    ];

    foreach ($categories as $cat_name => $cat_slug) {
        if (!term_exists($cat_name, 'category')) {
            wp_insert_term($cat_name, 'category', [
                'slug' => $cat_slug
            ]);
        }
    }
});

/* ==========================================================================
   3. REDIRECTION FRONTEND AUTOMATIQUE & GESTION DES PREVIEWS ET PERMALIENS
   ========================================================================== */
add_filter('preview_post_link', function ($link, $post) {
    $frontend_url = 'https://femcurrent.com';
    if (!$post) return $link;
    $type = $post->post_type;
    $slug = !empty($post->post_name) ? $post->post_name : sanitize_title($post->post_title);
    if (empty($slug)) $slug = 'post-' . $post->ID;

    if ($type === 'enquete') return $frontend_url . '/enquetes/' . $slug;
    if ($type === 'femme_leader') return $frontend_url . '/femmes/' . $slug;
    if ($type === 'initiative') return $frontend_url . '/initiatives/' . $slug;
    if ($type === 'ressource') return $frontend_url . '/ressources/' . $slug;
    return $frontend_url . '/actualites/' . $slug;
}, 10, 2);

add_filter('post_link', function ($permalink, $post) {
    if (is_admin() && $post) {
        $frontend_url = 'https://femcurrent.com';
        $slug = !empty($post->post_name) ? $post->post_name : sanitize_title($post->post_title);
        return $frontend_url . '/actualites/' . $slug;
    }
    return $permalink;
}, 10, 2);

add_action('template_redirect', function () {
    if (is_admin() || wp_doing_ajax() || wp_is_json_request() || (defined('REST_REQUEST') && REST_REQUEST)) {
        return;
    }

    $frontend_url = 'https://femcurrent.com';

    if (is_single() || is_preview() || isset($_GET['preview']) || isset($_GET['p'])) {
        $post_id = get_the_ID();
        if (!$post_id && isset($_GET['p'])) {
            $post_id = intval($_GET['p']);
        }
        $post = $post_id ? get_post($post_id) : null;
        if ($post) {
            $type = $post->post_type;
            $slug = !empty($post->post_name) ? $post->post_name : sanitize_title($post->post_title);
            if (empty($slug)) $slug = 'post-' . $post->ID;

            if ($type === 'enquete') {
                wp_redirect($frontend_url . '/enquetes/' . $slug, 302);
                exit;
            } elseif ($type === 'femme_leader') {
                wp_redirect($frontend_url . '/femmes/' . $slug, 302);
                exit;
            } elseif ($type === 'initiative') {
                wp_redirect($frontend_url . '/initiatives/' . $slug, 302);
                exit;
            } elseif ($type === 'ressource') {
                wp_redirect($frontend_url . '/ressources/' . $slug, 302);
                exit;
            } else {
                wp_redirect($frontend_url . '/actualites/' . $slug, 302);
                exit;
            }
        }
    }

    if (is_front_page() || is_home()) {
        wp_redirect($frontend_url . '/', 302);
        exit;
    }
});

/* ==========================================================================
   4. TOUS LES CUSTOM POST TYPES POUR LE MÉDIA FEMCURRENT
   ========================================================================== */
add_action('init', function () {

    register_post_type('enquete', [
        'labels' => ['name' => 'Enquêtes', 'singular_name' => 'Enquête', 'add_new_item' => 'Ajouter une nouvelle enquête', 'edit_item' => 'Modifier l’enquête'],
        'public' => true, 'has_archive' => true, 'show_in_rest' => true, 'rest_base' => 'enquetes', 'menu_icon' => 'dashicons-search',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ]);

    register_post_type('femme_leader', [
        'labels' => ['name' => 'Femmes à la une', 'singular_name' => 'Femme leader', 'add_new_item' => 'Ajouter un portrait', 'edit_item' => 'Modifier le portrait'],
        'public' => true, 'has_archive' => true, 'show_in_rest' => true, 'rest_base' => 'femmes', 'menu_icon' => 'dashicons-star-filled',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ]);

    register_post_type('initiative', [
        'labels' => ['name' => 'Initiatives', 'singular_name' => 'Initiative', 'add_new_item' => 'Ajouter une initiative', 'edit_item' => 'Modifier l’initiative'],
        'public' => true, 'has_archive' => true, 'show_in_rest' => true, 'rest_base' => 'initiatives', 'menu_icon' => 'dashicons-networking',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ]);

    register_post_type('ressource', [
        'labels' => ['name' => 'Ressources & Études', 'singular_name' => 'Ressource', 'add_new_item' => 'Ajouter une ressource', 'edit_item' => 'Modifier la ressource'],
        'public' => true, 'has_archive' => true, 'show_in_rest' => true, 'rest_base' => 'ressources', 'menu_icon' => 'dashicons-chart-bar',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ]);

    register_post_type('evenement', [
        'labels' => ['name' => 'Agenda & Événements', 'singular_name' => 'Événement', 'add_new_item' => 'Ajouter un événement', 'edit_item' => 'Modifier l’événement'],
        'public' => true, 'has_archive' => true, 'show_in_rest' => true, 'rest_base' => 'evenements', 'menu_icon' => 'dashicons-calendar-alt',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ]);

    register_post_type('podcast', [
        'labels' => ['name' => 'Podcasts & Médias', 'singular_name' => 'Podcast', 'add_new_item' => 'Ajouter un podcast / vidéo', 'edit_item' => 'Modifier le podcast'],
        'public' => true, 'has_archive' => true, 'show_in_rest' => true, 'rest_base' => 'podcasts', 'menu_icon' => 'dashicons-format-audio',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ]);

    register_post_type('soumission', [
        'labels' => ['name' => 'Soumissions & Alertes', 'singular_name' => 'Soumission', 'add_new_item' => 'Ajouter une soumission', 'edit_item' => 'Consulter la soumission'],
        'public' => false, 'show_ui' => true, 'show_in_rest' => false, 'rest_base' => 'soumissions', 'menu_icon' => 'dashicons-email-alt',
        'map_meta_cap' => true,
        'capabilities' => [
            'edit_post' => 'manage_options', 'read_post' => 'manage_options', 'delete_post' => 'manage_options',
            'edit_posts' => 'manage_options', 'edit_others_posts' => 'manage_options',
            'publish_posts' => 'manage_options', 'read_private_posts' => 'manage_options',
            'delete_posts' => 'manage_options', 'delete_private_posts' => 'manage_options',
            'delete_published_posts' => 'manage_options', 'delete_others_posts' => 'manage_options',
            'edit_private_posts' => 'manage_options', 'edit_published_posts' => 'manage_options',
        ],
        'supports' => ['title', 'editor', 'custom-fields'],
    ]);
});

/* Les signalements TFGBV sont supprimés après 30 jours. WP-Cron doit être
   déclenché régulièrement par l'hébergement pour respecter ce délai. */
add_action('init', function () {
    if (!wp_next_scheduled('femcurrent_purge_tfgbv_submissions')) {
        wp_schedule_event(time() + HOUR_IN_SECONDS, 'daily', 'femcurrent_purge_tfgbv_submissions');
    }
});
add_action('femcurrent_purge_tfgbv_submissions', 'femcurrent_purge_tfgbv_submissions');
register_deactivation_hook(__FILE__, function () {
    wp_clear_scheduled_hook('femcurrent_purge_tfgbv_submissions');
});

function femcurrent_purge_tfgbv_submissions() {
    $cutoff = gmdate('Y-m-d H:i:s', time() - (30 * DAY_IN_SECONDS));
    $expired = get_posts([
        'post_type' => 'soumission',
        'post_status' => array_keys(get_post_stati()),
        'posts_per_page' => 100,
        'fields' => 'ids',
        'meta_key' => '_femcurrent_sensitive_tfgbv',
        'meta_value' => '1',
        'date_query' => [['column' => 'post_date_gmt', 'before' => $cutoff]],
        'no_found_rows' => true,
    ]);
    foreach ($expired as $post_id) {
        wp_delete_post((int) $post_id, true);
    }
}

/* ==========================================================================
   5. EXPOSITION DES IMAGES MISES EN AVANT DANS L'API REST
   ========================================================================== */
add_action('rest_api_init', function () {
    register_rest_field(['post', 'enquete', 'femme_leader', 'initiative', 'ressource', 'evenement', 'podcast'], 'featured_image_url', [
        'get_callback' => function ($post) {
            $img_id = get_post_thumbnail_id($post['id']);
            return $img_id ? wp_get_attachment_image_url($img_id, 'full') : null;
        }
    ]);

    register_rest_route('femcurrent/v1', '/submit-light', [
        'methods' => 'POST',
        'callback' => 'femcurrent_handle_submission',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('femcurrent/v1', '/contact', [
        'methods' => 'POST',
        'callback' => 'femcurrent_handle_contact',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('femcurrent/v1', '/status', [
        'methods' => 'GET',
        'callback' => function () {
            return new WP_REST_Response([
                'tfgbv_enabled' => femcurrent_tfgbv_encryption_key() !== null && function_exists('openssl_encrypt'),
                'retention_days' => 30,
            ], 200);
        },
        'permission_callback' => '__return_true',
    ]);
});

function femcurrent_tfgbv_encryption_key() {
    if (!defined('FEMCURRENT_TFGBV_KEY')) return null;
    $key = base64_decode(trim((string) FEMCURRENT_TFGBV_KEY), true);
    return is_string($key) && strlen($key) === 32 ? $key : null;
}

function femcurrent_encrypt_tfgbv($plaintext) {
    $key = femcurrent_tfgbv_encryption_key();
    if ($key === null || !function_exists('openssl_encrypt')) return false;
    try {
        $iv = random_bytes(12);
    } catch (Throwable $e) {
        return false;
    }
    $tag = '';
    $ciphertext = openssl_encrypt($plaintext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag, '', 16);
    if ($ciphertext === false || strlen($tag) !== 16) return false;
    return 'FC-TFGBV:v1:' . base64_encode($iv . $tag . $ciphertext);
}

function femcurrent_decrypt_tfgbv($payload) {
    $key = femcurrent_tfgbv_encryption_key();
    if ($key === null || !function_exists('openssl_decrypt') || strpos($payload, 'FC-TFGBV:v1:') !== 0) return false;
    $packed = base64_decode(substr($payload, strlen('FC-TFGBV:v1:')), true);
    if (!is_string($packed) || strlen($packed) < 29) return false;
    $iv = substr($packed, 0, 12);
    $tag = substr($packed, 12, 16);
    $ciphertext = substr($packed, 28);
    return openssl_decrypt($ciphertext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag, '');
}

function femcurrent_submission_rate_limit($bucket, $limit = 10) {
    $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
    if ($ip === '') return new WP_Error('femcurrent_rate_limit', 'Soumission momentanément indisponible.', ['status' => 429]);
    $signature = hash_hmac('sha256', $ip, wp_salt('auth'));
    $transient = 'fc_submit_' . sanitize_key($bucket) . '_' . substr($signature, 0, 40);
    $count = (int) get_transient($transient);
    if ($count >= $limit) {
        return new WP_Error('femcurrent_rate_limit', 'Trop de soumissions. Réessayez plus tard.', ['status' => 429]);
    }
    set_transient($transient, $count + 1, HOUR_IN_SECONDS);
    return true;
}

add_action('add_meta_boxes_soumission', function ($post) {
    if (get_post_meta($post->ID, '_femcurrent_sensitive_tfgbv', true) !== '1') return;
    remove_meta_box('postdivrich', 'soumission', 'normal');
    add_meta_box(
        'femcurrent-tfgbv-content',
        'Signalement TFGBV — contenu déchiffré',
        'femcurrent_render_tfgbv_meta_box',
        'soumission',
        'normal',
        'high'
    );
});

function femcurrent_render_tfgbv_meta_box($post) {
    if (!current_user_can('manage_options')) {
        echo '<p>Accès réservé aux administratrices et administrateurs autorisés.</p>';
        return;
    }
    $plaintext = femcurrent_decrypt_tfgbv($post->post_content);
    echo '<p>Ce signalement est chiffré en base et supprimé automatiquement après 30 jours. Ne copiez pas son contenu dans des notes ou des messages non protégés.</p>';
    if ($plaintext === false) {
        echo '<p>Impossible de déchiffrer ce signalement. Vérifiez la clé FEMCURRENT_TFGBV_KEY dans wp-config.php.</p>';
        return;
    }
    echo '<textarea class="widefat" rows="12" readonly>' . esc_textarea($plaintext) . '</textarea>';
}

function femcurrent_handle_submission($request) {
    $limit = femcurrent_submission_rate_limit('light', 10);
    if (is_wp_error($limit)) return $limit;
    if (isset($_SERVER['CONTENT_LENGTH']) && (int) $_SERVER['CONTENT_LENGTH'] > 20000) {
        return new WP_Error('femcurrent_payload_too_large', 'La soumission est trop volumineuse.', ['status' => 413]);
    }
    $params = $request->get_json_params();
    if (empty($params)) $params = $request->get_body_params();

    $name = sanitize_text_field(isset($params['name']) ? $params['name'] : 'Proposition anonyme');
    $type = sanitize_text_field(isset($params['type']) ? $params['type'] : 'Femme leader');
    $province = sanitize_text_field(isset($params['province']) ? $params['province'] : '');
    $role = sanitize_text_field(isset($params['role']) ? $params['role'] : '');
    $story = sanitize_textarea_field(isset($params['story']) ? $params['story'] : '');
    $contact = sanitize_text_field(isset($params['contact']) ? $params['contact'] : '');

    if ($type === 'Signalement TFGBV') {
        if (femcurrent_tfgbv_encryption_key() === null || !function_exists('openssl_encrypt')) {
            return new WP_Error('femcurrent_tfgbv_unavailable', 'Le canal sécurisé de signalement n’est pas activé. Rien n’a été enregistré.', ['status' => 503]);
        }
        $consent = isset($params['consent']) && filter_var($params['consent'], FILTER_VALIDATE_BOOLEAN);
        if (!$consent || $story === '' || strlen($story) > 10000) {
            return new WP_Error('femcurrent_invalid_tfgbv', 'Consentement requis et récit limité à 10 000 caractères.', ['status' => 400]);
        }
        $record = wp_json_encode([
            'platform' => sanitize_text_field(isset($params['platform']) ? $params['platform'] : ''),
            'support' => sanitize_text_field(isset($params['support']) ? $params['support'] : ''),
            'story' => $story,
            'consented_at' => sanitize_text_field(isset($params['consented_at']) ? $params['consented_at'] : ''),
        ]);
        $encrypted = femcurrent_encrypt_tfgbv($record);
        if ($encrypted === false) {
            return new WP_Error('femcurrent_tfgbv_encryption_failed', 'Le canal sécurisé est momentanément indisponible. Rien n’a été enregistré.', ['status' => 503]);
        }
        $post_id = wp_insert_post([
            'post_type' => 'soumission',
            'post_title' => 'Signalement TFGBV chiffré',
            'post_content' => $encrypted,
            'post_status' => 'pending',
        ], true);
        if (is_wp_error($post_id)) return new WP_Error('femcurrent_submit_failed', 'La soumission n’a pas pu être enregistrée.', ['status' => 500]);
        update_post_meta($post_id, '_femcurrent_sensitive_tfgbv', '1');
        return new WP_REST_Response(['success' => true, 'message' => 'Signalement chiffré reçu.'], 200);
    }

    $content = "Type : " . $type . "\n" .
               "Nom : " . $name . "\n" .
               "Province : " . $province . "\n" .
               "Rôle/Domaine : " . $role . "\n" .
               "Contact : " . $contact . "\n\n" .
               "Description/Histoire :\n" . $story;

    $post_id = wp_insert_post([
        'post_type' => 'soumission',
        'post_title' => '[' . $type . '] ' . $name,
        'post_content' => $content,
        'post_status' => 'pending'
    ]);

    if (is_wp_error($post_id)) {
        return new WP_REST_Response(['success' => false, 'message' => 'Erreur'], 500);
    }
    return new WP_REST_Response(['success' => true, 'id' => $post_id, 'message' => 'Proposition reçue.'], 200);
}

function femcurrent_handle_contact($request) {
    $limit = femcurrent_submission_rate_limit('contact', 10);
    if (is_wp_error($limit)) return $limit;
    if (isset($_SERVER['CONTENT_LENGTH']) && (int) $_SERVER['CONTENT_LENGTH'] > 20000) {
        return new WP_Error('femcurrent_payload_too_large', 'La soumission est trop volumineuse.', ['status' => 413]);
    }
    $params = $request->get_json_params();
    if (empty($params)) $params = $request->get_body_params();

    $name = sanitize_text_field(isset($params['name']) ? $params['name'] : '');
    $email = sanitize_text_field(isset($params['email']) ? $params['email'] : '');
    $subject = sanitize_text_field(isset($params['subject']) ? $params['subject'] : 'Contact général');
    $message = sanitize_textarea_field(isset($params['message']) ? $params['message'] : '');

    $content = "Nom : " . $name . "\n" .
               "Email/Tel : " . $email . "\n" .
               "Sujet : " . $subject . "\n\n" .
               "Message :\n" . $message;

    $post_id = wp_insert_post([
        'post_type' => 'soumission',
        'post_title' => '[CONTACT] ' . $subject . ' - ' . $name,
        'post_content' => $content,
        'post_status' => 'pending'
    ]);

    if (is_wp_error($post_id)) {
        return new WP_REST_Response(['success' => false, 'message' => 'Erreur'], 500);
    }
    return new WP_REST_Response(['success' => true, 'id' => $post_id, 'message' => 'Message reçu.'], 200);
}
