<?php
/**
 * CreatorHub Theme Functions
 *
 * @package CreatorHub
 * @version 1.0.0
 */

defined( 'ABSPATH' ) || exit;

/* =========================================================
   CONSTANTS
   ========================================================= */
define( 'CH_VERSION',   '1.0.0' );
define( 'CH_DIR',       get_template_directory() );
define( 'CH_URI',       get_template_directory_uri() );
define( 'CH_INC_DIR',   CH_DIR . '/inc' );
define( 'CH_ASSETS',    CH_URI . '/assets' );

/* =========================================================
   INCLUDES
   ========================================================= */
$includes = [
    '/inc/enqueue.php',
    '/inc/customizer.php',
    '/inc/post-types.php',
    '/inc/taxonomies.php',
    '/inc/widgets.php',
    '/inc/helpers.php',
    '/inc/template-tags.php',
    '/inc/ajax-handlers.php',
    '/inc/woocommerce.php',
    '/inc/elementor/elementor-support.php',
];

foreach ( $includes as $file ) {
    $path = CH_DIR . $file;
    if ( file_exists( $path ) ) {
        require_once $path;
    }
}

/* =========================================================
   THEME SETUP
   ========================================================= */
function ch_setup() {
    // Translations
    load_theme_textdomain( 'creator-hub', CH_DIR . '/languages' );

    // HTML5 support
    add_theme_support( 'html5', [
        'search-form', 'comment-form', 'comment-list',
        'gallery', 'caption', 'style', 'script',
    ] );

    // Title tag
    add_theme_support( 'title-tag' );

    // Post thumbnails
    add_theme_support( 'post-thumbnails' );
    add_image_size( 'ch-creator-avatar',  150, 150, true );
    add_image_size( 'ch-creator-cover',   1200, 350, true );
    add_image_size( 'ch-post-thumb',      800, 500, true );
    add_image_size( 'ch-post-square',     600, 600, true );
    add_image_size( 'ch-card-thumb',      400, 280, true );

    // Post formats
    add_theme_support( 'post-formats', [
        'image', 'video', 'audio', 'gallery', 'link',
    ] );

    // Custom logo
    add_theme_support( 'custom-logo', [
        'height'      => 60,
        'width'       => 200,
        'flex-width'  => true,
        'flex-height' => true,
    ] );

    // Custom header
    add_theme_support( 'custom-header', [
        'default-image'      => CH_ASSETS . '/images/header-default.jpg',
        'width'              => 1920,
        'height'             => 600,
        'flex-width'         => true,
        'flex-height'        => true,
        'header-text'        => false,
    ] );

    // Custom background
    add_theme_support( 'custom-background', [
        'default-color' => 'ffffff',
    ] );

    // Gutenberg
    add_theme_support( 'align-wide' );
    add_theme_support( 'responsive-embeds' );
    add_theme_support( 'editor-color-palette', ch_get_editor_colors() );
    add_theme_support( 'editor-gradient-presets', ch_get_editor_gradients() );
    add_theme_support( 'editor-font-sizes', ch_get_editor_font_sizes() );
    add_theme_support( 'editor-styles' );
    add_editor_style( 'assets/css/editor-style.css' );

    // WooCommerce
    add_theme_support( 'woocommerce' );
    add_theme_support( 'wc-product-gallery-zoom' );
    add_theme_support( 'wc-product-gallery-lightbox' );
    add_theme_support( 'wc-product-gallery-slider' );

    // Automatic feed links
    add_theme_support( 'automatic-feed-links' );

    // Selective refresh for widgets
    add_theme_support( 'customize-selective-refresh-widgets' );

    // Menus
    register_nav_menus( [
        'primary'   => __( 'Menu Principal', 'creator-hub' ),
        'secondary' => __( 'Menu Secundário', 'creator-hub' ),
        'footer'    => __( 'Menu Rodapé', 'creator-hub' ),
        'mobile'    => __( 'Menu Mobile', 'creator-hub' ),
        'dashboard' => __( 'Menu Dashboard', 'creator-hub' ),
    ] );
}
add_action( 'after_setup_theme', 'ch_setup' );

/* =========================================================
   CONTENT WIDTH
   ========================================================= */
function ch_content_width() {
    $GLOBALS['content_width'] = apply_filters( 'ch_content_width', 1280 );
}
add_action( 'after_setup_theme', 'ch_content_width', 0 );

/* =========================================================
   GUTENBERG COLOR PALETTE
   ========================================================= */
function ch_get_editor_colors() {
    return [
        [ 'name' => __( 'Primário',      'creator-hub' ), 'slug' => 'primary',        'color' => '#7c3aed' ],
        [ 'name' => __( 'Primário Claro','creator-hub' ), 'slug' => 'primary-light',  'color' => '#a78bfa' ],
        [ 'name' => __( 'Secundário',    'creator-hub' ), 'slug' => 'secondary',      'color' => '#ec4899' ],
        [ 'name' => __( 'Accent',        'creator-hub' ), 'slug' => 'accent',         'color' => '#06b6d4' ],
        [ 'name' => __( 'Sucesso',       'creator-hub' ), 'slug' => 'success',        'color' => '#10b981' ],
        [ 'name' => __( 'Aviso',         'creator-hub' ), 'slug' => 'warning',        'color' => '#f59e0b' ],
        [ 'name' => __( 'Erro',          'creator-hub' ), 'slug' => 'error',          'color' => '#ef4444' ],
        [ 'name' => __( 'Texto',         'creator-hub' ), 'slug' => 'text',           'color' => '#0f0d1a' ],
        [ 'name' => __( 'Texto Claro',   'creator-hub' ), 'slug' => 'text-muted',     'color' => '#7c75a8' ],
        [ 'name' => __( 'Fundo',         'creator-hub' ), 'slug' => 'background',     'color' => '#ffffff' ],
        [ 'name' => __( 'Branco',        'creator-hub' ), 'slug' => 'white',          'color' => '#ffffff' ],
    ];
}

function ch_get_editor_gradients() {
    return [
        [
            'name'     => __( 'Gradiente Primário', 'creator-hub' ),
            'slug'     => 'gradient-primary',
            'gradient' => 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
        ],
        [
            'name'     => __( 'Gradiente Secundário', 'creator-hub' ),
            'slug'     => 'gradient-secondary',
            'gradient' => 'linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%)',
        ],
        [
            'name'     => __( 'Gradiente Dark', 'creator-hub' ),
            'slug'     => 'gradient-dark',
            'gradient' => 'linear-gradient(135deg, #1e1b4b 0%, #2d1b69 100%)',
        ],
    ];
}

function ch_get_editor_font_sizes() {
    return [
        [ 'name' => __( 'Pequeno',  'creator-hub' ), 'slug' => 'small',   'size' => 14 ],
        [ 'name' => __( 'Normal',   'creator-hub' ), 'slug' => 'normal',  'size' => 16 ],
        [ 'name' => __( 'Médio',    'creator-hub' ), 'slug' => 'medium',  'size' => 20 ],
        [ 'name' => __( 'Grande',   'creator-hub' ), 'slug' => 'large',   'size' => 30 ],
        [ 'name' => __( 'Enorme',   'creator-hub' ), 'slug' => 'huge',    'size' => 48 ],
    ];
}

/* =========================================================
   BODY CLASSES
   ========================================================= */
function ch_body_classes( $classes ) {
    if ( is_singular() ) {
        $classes[] = 'is-singular';
    }
    if ( is_user_logged_in() ) {
        $classes[] = 'is-logged-in';
        if ( current_user_can( 'edit_posts' ) ) {
            $classes[] = 'is-creator';
        }
    }
    $dark_mode = get_theme_mod( 'ch_default_theme', 'auto' );
    if ( $dark_mode === 'dark' ) {
        $classes[] = 'dark-mode';
    }
    return $classes;
}
add_filter( 'body_class', 'ch_body_classes' );

/* =========================================================
   PASSWORD-PROTECTED POST MESSAGE
   ========================================================= */
function ch_password_form() {
    ob_start();
    ?>
    <div class="ch-post__locked">
        <div class="ch-post__locked-overlay">
            <div class="ch-post__locked-icon">
                <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
            <div class="ch-post__locked-title"><?php esc_html_e( 'Conteúdo Protegido', 'creator-hub' ); ?></div>
            <div class="ch-post__locked-desc"><?php esc_html_e( 'Este conteúdo é exclusivo para assinantes.', 'creator-hub' ); ?></div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_filter( 'the_password_form', 'ch_password_form' );

/* =========================================================
   EXCERPT
   ========================================================= */
function ch_excerpt_length( $length ) {
    return 25;
}
add_filter( 'excerpt_length', 'ch_excerpt_length' );

function ch_excerpt_more( $more ) {
    return '&hellip;';
}
add_filter( 'excerpt_more', 'ch_excerpt_more' );

/* =========================================================
   SEARCH FORM
   ========================================================= */
function ch_search_form( $form ) {
    $unique_id = wp_unique_id( 'search-form-' );
    $placeholder = __( 'Buscar criadores, conteúdos...', 'creator-hub' );
    $label = __( 'Buscar', 'creator-hub' );
    $submit = __( 'Buscar', 'creator-hub' );

    $form = sprintf(
        '<form role="search" method="get" class="ch-search-form" action="%s">
            <label class="ch-sr-only" for="%s">%s</label>
            <div class="ch-header__search">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input id="%s" type="search" class="ch-form-input" placeholder="%s" value="%s" name="s" autocomplete="off">
                <button type="submit" class="ch-sr-only">%s</button>
            </div>
        </form>',
        esc_url( home_url( '/' ) ),
        esc_attr( $unique_id ),
        esc_html( $label ),
        esc_attr( $unique_id ),
        esc_attr( $placeholder ),
        esc_attr( get_search_query() ),
        esc_html( $submit )
    );

    return $form;
}
add_filter( 'get_search_form', 'ch_search_form' );
