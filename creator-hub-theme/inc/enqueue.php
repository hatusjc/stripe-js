<?php
/**
 * CreatorHub - Assets Enqueue
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

/* =========================================================
   FRONT-END ASSETS
   ========================================================= */
function ch_enqueue_assets() {
    $ver = CH_VERSION;

    // Google Fonts
    $fonts = 'Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&family=JetBrains+Mono:wght@400;500';
    wp_enqueue_style(
        'ch-google-fonts',
        'https://fonts.googleapis.com/css2?' . urlencode( 'family=' . $fonts ) . '&display=swap',
        [],
        null
    );

    // CSS Variables
    wp_enqueue_style( 'ch-variables', CH_ASSETS . '/css/variables.css', [], $ver );

    // Main CSS
    wp_enqueue_style( 'ch-main', CH_ASSETS . '/css/main.css', [ 'ch-variables' ], $ver );

    // Responsive CSS
    wp_enqueue_style( 'ch-responsive', CH_ASSETS . '/css/responsive.css', [ 'ch-main' ], $ver );

    // Theme Style (required by WordPress)
    wp_enqueue_style( 'ch-style', get_stylesheet_uri(), [ 'ch-main' ], $ver );

    // WooCommerce styles
    if ( class_exists( 'WooCommerce' ) ) {
        wp_enqueue_style( 'ch-woocommerce', CH_ASSETS . '/css/woocommerce.css', [ 'ch-main' ], $ver );
    }

    // Inline custom CSS from Customizer
    $custom_css = get_theme_mod( 'ch_custom_css', '' );
    if ( $custom_css ) {
        wp_add_inline_style( 'ch-main', wp_strip_all_tags( $custom_css ) );
    }

    // Main JS
    wp_enqueue_script( 'ch-main', CH_ASSETS . '/js/main.js', [], $ver, true );

    // Localize script
    wp_localize_script( 'ch-main', 'chAjax', [
        'ajaxUrl'  => admin_url( 'admin-ajax.php' ),
        'nonce'    => wp_create_nonce( 'ch_nonce' ),
        'homeUrl'  => home_url( '/' ),
        'isLoggedIn' => is_user_logged_in(),
        'userId'   => get_current_user_id(),
        'i18n'     => [
            'follow'          => __( 'Seguir', 'creator-hub' ),
            'following'       => __( 'Seguindo', 'creator-hub' ),
            'subscribe'       => __( 'Assinar', 'creator-hub' ),
            'subscribed'      => __( 'Assinado', 'creator-hub' ),
            'loadMore'        => __( 'Carregar mais', 'creator-hub' ),
            'loading'         => __( 'Carregando...', 'creator-hub' ),
            'errorGeneric'    => __( 'Ocorreu um erro. Tente novamente.', 'creator-hub' ),
            'loginRequired'   => __( 'Faça login para continuar.', 'creator-hub' ),
        ],
    ] );

    // Comment reply JS
    if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
        wp_enqueue_script( 'comment-reply' );
    }

    // Inline CSS variables from Customizer colors
    ch_output_customizer_css();
}
add_action( 'wp_enqueue_scripts', 'ch_enqueue_assets' );

/* =========================================================
   ADMIN ASSETS
   ========================================================= */
function ch_admin_assets( $hook ) {
    wp_enqueue_style( 'ch-admin', CH_ASSETS . '/css/admin.css', [], CH_VERSION );
}
add_action( 'admin_enqueue_scripts', 'ch_admin_assets' );

/* =========================================================
   EDITOR (GUTENBERG) STYLES
   ========================================================= */
function ch_block_editor_assets() {
    wp_enqueue_style( 'ch-editor-variables', CH_ASSETS . '/css/variables.css', [], CH_VERSION );
}
add_action( 'enqueue_block_editor_assets', 'ch_block_editor_assets' );

/* =========================================================
   CUSTOMIZER → INLINE CSS
   ========================================================= */
function ch_output_customizer_css() {
    $primary   = get_theme_mod( 'ch_color_primary',   '#7c3aed' );
    $secondary = get_theme_mod( 'ch_color_secondary', '#ec4899' );
    $accent    = get_theme_mod( 'ch_color_accent',    '#06b6d4' );
    $font_body = get_theme_mod( 'ch_font_body',       "'Inter', sans-serif" );
    $font_head = get_theme_mod( 'ch_font_heading',    "'Plus Jakarta Sans', sans-serif" );

    $css = "
        :root {
            --ch-primary:        {$primary};
            --ch-primary-dark:   " . ch_darken_color( $primary, 20 ) . ";
            --ch-primary-light:  " . ch_lighten_color( $primary, 20 ) . ";
            --ch-secondary:      {$secondary};
            --ch-accent:         {$accent};
            --ch-font-sans:      {$font_body};
            --ch-font-heading:   {$font_head};
            --ch-gradient-primary: linear-gradient(135deg, {$primary} 0%, {$secondary} 100%);
        }
    ";

    wp_add_inline_style( 'ch-variables', $css );
}

/* =========================================================
   PRECONNECT FOR GOOGLE FONTS
   ========================================================= */
function ch_resource_hints( $urls, $relation_type ) {
    if ( 'preconnect' === $relation_type ) {
        $urls[] = 'https://fonts.googleapis.com';
        $urls[] = 'https://fonts.gstatic.com';
    }
    return $urls;
}
add_filter( 'wp_resource_hints', 'ch_resource_hints', 10, 2 );

/* =========================================================
   REMOVE QUERY STRINGS (performance)
   ========================================================= */
function ch_remove_query_strings( $src ) {
    if ( strpos( $src, '?ver=' ) ) {
        $src = remove_query_arg( 'ver', $src );
    }
    return $src;
}
add_filter( 'style_loader_src',  'ch_remove_query_strings', 10, 2 );
add_filter( 'script_loader_src', 'ch_remove_query_strings', 10, 2 );
