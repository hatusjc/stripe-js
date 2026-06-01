<?php
/**
 * CreatorHub - Elementor Integration
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

if ( ! did_action( 'elementor/loaded' ) ) return;

use Elementor\Core\Schemes;

/* =========================================================
   THEME COLOR PALETTE FOR ELEMENTOR
   ========================================================= */
add_action( 'elementor/init', function () {
    $kit_id = get_option( 'elementor_active_kit' );
    if ( ! $kit_id ) return;

    // Register global colors via Elementor's Kit
    add_filter( 'elementor/kits/default_active_kit_meta', function ( $meta ) {
        $meta['system_colors'] = [
            [
                'id'    => 'ch-primary',
                'title' => 'Primário (CreatorHub)',
                'color' => get_theme_mod( 'ch_color_primary', '#7c3aed' ),
            ],
            [
                'id'    => 'ch-secondary',
                'title' => 'Secundário (CreatorHub)',
                'color' => get_theme_mod( 'ch_color_secondary', '#ec4899' ),
            ],
            [
                'id'    => 'ch-accent',
                'title' => 'Accent (CreatorHub)',
                'color' => get_theme_mod( 'ch_color_accent', '#06b6d4' ),
            ],
            [
                'id'    => 'ch-text',
                'title' => 'Texto (CreatorHub)',
                'color' => '#0f0d1a',
            ],
            [
                'id'    => 'ch-text-muted',
                'title' => 'Texto Suave (CreatorHub)',
                'color' => '#7c75a8',
            ],
        ];
        return $meta;
    } );
} );

/* =========================================================
   ELEMENTOR LOCATION SUPPORT (Theme Builder)
   ========================================================= */
add_action( 'elementor/theme/register_locations', function ( $elementor_theme_manager ) {
    $elementor_theme_manager->register_all_core_location();
} );

/* =========================================================
   CREATOR CARD ELEMENTOR WIDGET
   ========================================================= */
add_action( 'elementor/widgets/register', function ( $widgets_manager ) {
    $widget_file = CH_INC_DIR . '/elementor/widgets/class-creator-card-widget.php';
    if ( file_exists( $widget_file ) ) {
        require_once $widget_file;
        $widgets_manager->register( new \CreatorHub\Elementor\Creator_Card_Widget() );
    }
} );

/* =========================================================
   ELEMENTOR COMPATIBLE TEMPLATE PARTS
   ========================================================= */
add_filter( 'template_include', function ( $template ) {
    if ( ! class_exists( '\Elementor\Plugin' ) ) return $template;

    $elementor = \Elementor\Plugin::instance();
    $doc       = $elementor->documents->get_doc_for_frontend( get_the_ID() );

    if ( $doc && $doc->is_built_with_elementor() ) {
        // Let Elementor handle the full template
        return $template;
    }

    return $template;
} );

/* =========================================================
   DISABLE DEFAULT ELEMENTOR FONT AWESOME (use theme icons)
   ========================================================= */
add_filter( 'elementor/icons_manager/additional_tabs', function ( $tabs ) {
    return $tabs;
} );

/* =========================================================
   ELEMENTOR PAGE SETTINGS
   ========================================================= */
add_action( 'elementor/page_templates/canvas/before_content', function () {
    wp_head();
    echo '<div class="ch-elementor-canvas">';
} );

add_action( 'elementor/page_templates/canvas/after_content', function () {
    echo '</div>';
    wp_footer();
} );
