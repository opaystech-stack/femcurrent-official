<?php
/**
 * Plugin Name: FemCurrent Headless Bridge
 * Plugin URI: https://femcurrent.com
 * Description: Moteur Headless officiel pour FemCurrent Média : CORS, Custom Post Types complets (Enquêtes, Femmes leaders, Initiatives, Ressources, Événements, Podcasts, Soumissions), redirection et API REST temps réel.
 * Version: 2.0.0
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
   3. REDIRECTION FRONTEND AUTOMATIQUE VERS LE SITE PUBLIC
   ========================================================================== */
add_action('template_redirect', function () {
    if (is_admin() || wp_doing_ajax() || wp_is_json_request() || (defined('REST_REQUEST') && REST_REQUEST)) {
        return;
    }

    $frontend_url = 'https://femcurrent.com';

    if (is_single()) {
        global $post;
        if ($post && !empty($post->post_name)) {
            $type = $post->post_type;
            $slug = $post->post_name;
            if ($type === 'enquete') {
                wp_redirect($frontend_url . '/#/enquetes/' . $slug, 302);
                exit;
            } elseif ($type === 'femme_leader') {
                wp_redirect($frontend_url . '/#/femmes/' . $slug, 302);
                exit;
            } elseif ($type === 'initiative') {
                wp_redirect($frontend_url . '/#/initiatives/' . $slug, 302);
                exit;
            } elseif ($type === 'ressource') {
                wp_redirect($frontend_url . '/#/ressources/' . $slug, 302);
                exit;
            } else {
                wp_redirect($frontend_url . '/#/actualites/' . $slug, 302);
                exit;
            }
        }
    }

    if (is_front_page() || is_home()) {
        wp_redirect($frontend_url . '/#/', 302);
        exit;
    }
});

/* ==========================================================================
   4. TOUS LES CUSTOM POST TYPES POUR LE MÉDIA FEMCURRENT
   ========================================================================== */
add_action('init', function () {

    // 1. Enquêtes (FemCurrent Investigates)
    register_post_type('enquete', [
        'labels' => [
            'name' => 'Enquêtes',
            'singular_name' => 'Enquête',
            'add_new_item' => 'Ajouter une nouvelle enquête',
            'edit_item' => 'Modifier l’enquête'
        ],
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'rest_base' => 'enquetes',
        'menu_icon' => 'dashicons-search',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ]);

    // 2. Femmes à la une (Portraits)
    register_post_type('femme_leader', [
        'labels' => [
            'name' => 'Femmes à la une',
            'singular_name' => 'Femme leader',
            'add_new_item' => 'Ajouter un portrait',
            'edit_item' => 'Modifier le portrait'
        ],
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'rest_base' => 'femmes',
        'menu_icon' => 'dashicons-star-filled',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ]);

    // 3. Initiatives (FemCurrent Matendo)
    register_post_type('initiative', [
        'labels' => [
            'name' => 'Initiatives',
            'singular_name' => 'Initiative',
            'add_new_item' => 'Ajouter une initiative',
            'edit_item' => 'Modifier l’initiative'
        ],
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'rest_base' => 'initiatives',
        'menu_icon' => 'dashicons-networking',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ]);

    // 4. Observatoire & Ressources (FemCurrent Data)
    register_post_type('ressource', [
        'labels' => [
            'name' => 'Ressources & Études',
            'singular_name' => 'Ressource',
            'add_new_item' => 'Ajouter une ressource',
            'edit_item' => 'Modifier la ressource'
        ],
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'rest_base' => 'ressources',
        'menu_icon' => 'dashicons-chart-bar',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ]);

    // 5. Agenda & Événements
    register_post_type('evenement', [
        'labels' => [
            'name' => 'Agenda & Événements',
            'singular_name' => 'Événement',
            'add_new_item' => 'Ajouter un événement',
            'edit_item' => 'Modifier l’événement'
        ],
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'rest_base' => 'evenements',
        'menu_icon' => 'dashicons-calendar-alt',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ]);

    // 6. Médiathèque & Podcasts (FemCurrent Voices)
    register_post_type('podcast', [
        'labels' => [
            'name' => 'Podcasts & Médias',
            'singular_name' => 'Podcast',
            'add_new_item' => 'Ajouter un podcast / vidéo',
            'edit_item' => 'Modifier le podcast'
        ],
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'rest_base' => 'podcasts',
        'menu_icon' => 'dashicons-format-audio',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ]);

    // 7. Soumissions du public (Mettre en lumière & Contact)
    register_post_type('soumission', [
        'labels' => [
            'name' => 'Soumissions & Alertes',
            'singular_name' => 'Soumission',
            'add_new_item' => 'Ajouter une soumission',
            'edit_item' => 'Consulter la soumission'
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_rest' => true,
        'rest_base' => 'soumissions',
        'menu_icon' => 'dashicons-email-alt',
        'supports' => ['title', 'editor', 'custom-fields'],
    ]);
});

/* ==========================================================================
   5. EXPOSITION DES CHAMPS DANS L'API REST
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
});

function femcurrent_handle_submission($request) {
    $params = $request->get_json_params();
    if (empty($params)) $params = $request->get_body_params();

    $name = sanitize_text_field(isset($params['name']) ? $params['name'] : 'Proposition anonyme');
    $type = sanitize_text_field(isset($params['type']) ? $params['type'] : 'Femme leader');
    $province = sanitize_text_field(isset($params['province']) ? $params['province'] : '');
    $role = sanitize_text_field(isset($params['role']) ? $params['role'] : '');
    $story = sanitize_textarea_field(isset($params['story']) ? $params['story'] : '');
    $contact = sanitize_text_field(isset($params['contact']) ? $params['contact'] : '');

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
