<?php
/**
 * CreatorHub - Customizer Settings
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

function ch_customizer_settings( $wp_customize ) {

    /* =========================================================
       PANEL: CREATOR HUB
       ========================================================= */
    $wp_customize->add_panel( 'ch_panel', [
        'title'       => __( 'CreatorHub', 'creator-hub' ),
        'description' => __( 'Configurações globais do tema CreatorHub.', 'creator-hub' ),
        'priority'    => 10,
    ] );

    /* =========================================================
       SECTION: IDENTIDADE
       ========================================================= */
    $wp_customize->add_section( 'ch_identity', [
        'title'    => __( 'Identidade da Plataforma', 'creator-hub' ),
        'panel'    => 'ch_panel',
        'priority' => 10,
    ] );

    // Platform name
    $wp_customize->add_setting( 'ch_platform_name', [
        'default'           => get_bloginfo( 'name' ),
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'ch_platform_name', [
        'label'   => __( 'Nome da Plataforma', 'creator-hub' ),
        'section' => 'ch_identity',
        'type'    => 'text',
    ] );

    // Platform tagline
    $wp_customize->add_setting( 'ch_platform_tagline', [
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'ch_platform_tagline', [
        'label'   => __( 'Slogan / Tagline', 'creator-hub' ),
        'section' => 'ch_identity',
        'type'    => 'text',
    ] );

    /* =========================================================
       SECTION: CORES
       ========================================================= */
    $wp_customize->add_section( 'ch_colors', [
        'title'    => __( 'Sistema de Cores', 'creator-hub' ),
        'panel'    => 'ch_panel',
        'priority' => 20,
    ] );

    $color_settings = [
        'ch_color_primary'   => [ 'label' => __( 'Cor Primária', 'creator-hub' ),   'default' => '#7c3aed' ],
        'ch_color_secondary' => [ 'label' => __( 'Cor Secundária', 'creator-hub' ), 'default' => '#ec4899' ],
        'ch_color_accent'    => [ 'label' => __( 'Cor Accent', 'creator-hub' ),     'default' => '#06b6d4' ],
    ];

    foreach ( $color_settings as $id => $args ) {
        $wp_customize->add_setting( $id, [
            'default'           => $args['default'],
            'sanitize_callback' => 'sanitize_hex_color',
            'transport'         => 'postMessage',
        ] );
        $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, $id, [
            'label'   => $args['label'],
            'section' => 'ch_colors',
        ] ) );
    }

    /* =========================================================
       SECTION: TIPOGRAFIA
       ========================================================= */
    $wp_customize->add_section( 'ch_typography', [
        'title'    => __( 'Tipografia', 'creator-hub' ),
        'panel'    => 'ch_panel',
        'priority' => 30,
    ] );

    $font_choices = [
        "'Inter', sans-serif"             => 'Inter (Padrão)',
        "'Plus Jakarta Sans', sans-serif" => 'Plus Jakarta Sans',
        "'Poppins', sans-serif"           => 'Poppins',
        "'Nunito', sans-serif"            => 'Nunito',
        "'Roboto', sans-serif"            => 'Roboto',
        "'Open Sans', sans-serif"         => 'Open Sans',
        "'Montserrat', sans-serif"        => 'Montserrat',
        "'Raleway', sans-serif"           => 'Raleway',
    ];

    $wp_customize->add_setting( 'ch_font_body', [
        'default'           => "'Inter', sans-serif",
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'ch_font_body', [
        'label'   => __( 'Fonte do Corpo', 'creator-hub' ),
        'section' => 'ch_typography',
        'type'    => 'select',
        'choices' => $font_choices,
    ] );

    $wp_customize->add_setting( 'ch_font_heading', [
        'default'           => "'Plus Jakarta Sans', sans-serif",
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'ch_font_heading', [
        'label'   => __( 'Fonte dos Títulos', 'creator-hub' ),
        'section' => 'ch_typography',
        'type'    => 'select',
        'choices' => $font_choices,
    ] );

    // Base font size
    $wp_customize->add_setting( 'ch_font_size_base', [
        'default'           => '16',
        'sanitize_callback' => 'absint',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'ch_font_size_base', [
        'label'       => __( 'Tamanho Base da Fonte (px)', 'creator-hub' ),
        'section'     => 'ch_typography',
        'type'        => 'number',
        'input_attrs' => [ 'min' => 12, 'max' => 24, 'step' => 1 ],
    ] );

    /* =========================================================
       SECTION: DARK MODE
       ========================================================= */
    $wp_customize->add_section( 'ch_dark_mode', [
        'title'    => __( 'Modo Escuro (Dark Mode)', 'creator-hub' ),
        'panel'    => 'ch_panel',
        'priority' => 40,
    ] );

    $wp_customize->add_setting( 'ch_default_theme', [
        'default'           => 'auto',
        'sanitize_callback' => 'sanitize_text_field',
    ] );
    $wp_customize->add_control( 'ch_default_theme', [
        'label'   => __( 'Tema Padrão', 'creator-hub' ),
        'section' => 'ch_dark_mode',
        'type'    => 'select',
        'choices' => [
            'auto'  => __( 'Automático (segue o sistema)', 'creator-hub' ),
            'light' => __( 'Sempre Claro', 'creator-hub' ),
            'dark'  => __( 'Sempre Escuro', 'creator-hub' ),
        ],
    ] );

    $wp_customize->add_setting( 'ch_show_darkmode_toggle', [
        'default'           => true,
        'sanitize_callback' => 'ch_sanitize_checkbox',
    ] );
    $wp_customize->add_control( 'ch_show_darkmode_toggle', [
        'label'   => __( 'Mostrar botão de alternar tema no header', 'creator-hub' ),
        'section' => 'ch_dark_mode',
        'type'    => 'checkbox',
    ] );

    /* =========================================================
       SECTION: HEADER
       ========================================================= */
    $wp_customize->add_section( 'ch_header', [
        'title'    => __( 'Header', 'creator-hub' ),
        'panel'    => 'ch_panel',
        'priority' => 50,
    ] );

    $wp_customize->add_setting( 'ch_show_search_header', [
        'default'           => true,
        'sanitize_callback' => 'ch_sanitize_checkbox',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'ch_show_search_header', [
        'label'   => __( 'Mostrar busca no header', 'creator-hub' ),
        'section' => 'ch_header',
        'type'    => 'checkbox',
    ] );

    $wp_customize->add_setting( 'ch_header_cta_text', [
        'default'           => __( 'Começar Grátis', 'creator-hub' ),
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'ch_header_cta_text', [
        'label'   => __( 'Texto do botão CTA (visitantes)', 'creator-hub' ),
        'section' => 'ch_header',
        'type'    => 'text',
    ] );

    $wp_customize->add_setting( 'ch_header_cta_url', [
        'default'           => wp_registration_url(),
        'sanitize_callback' => 'esc_url_raw',
    ] );
    $wp_customize->add_control( 'ch_header_cta_url', [
        'label'   => __( 'URL do botão CTA', 'creator-hub' ),
        'section' => 'ch_header',
        'type'    => 'url',
    ] );

    /* =========================================================
       SECTION: HOME PAGE
       ========================================================= */
    $wp_customize->add_section( 'ch_homepage', [
        'title'    => __( 'Página Inicial', 'creator-hub' ),
        'panel'    => 'ch_panel',
        'priority' => 60,
    ] );

    $wp_customize->add_setting( 'ch_hero_title', [
        'default'           => __( 'A Plataforma dos Criadores', 'creator-hub' ),
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'ch_hero_title', [
        'label'   => __( 'Título do Hero', 'creator-hub' ),
        'section' => 'ch_homepage',
        'type'    => 'text',
    ] );

    $wp_customize->add_setting( 'ch_hero_subtitle', [
        'default'           => __( 'Conecte-se aos seus criadores favoritos. Acesse conteúdo exclusivo, apoie talentos e faça parte de comunidades incríveis.', 'creator-hub' ),
        'sanitize_callback' => 'sanitize_textarea_field',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'ch_hero_subtitle', [
        'label'   => __( 'Subtítulo do Hero', 'creator-hub' ),
        'section' => 'ch_homepage',
        'type'    => 'textarea',
    ] );

    $wp_customize->add_setting( 'ch_hero_cta_primary', [
        'default'           => __( 'Explorar Criadores', 'creator-hub' ),
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'ch_hero_cta_primary', [
        'label'   => __( 'Texto CTA Primário', 'creator-hub' ),
        'section' => 'ch_homepage',
        'type'    => 'text',
    ] );

    $wp_customize->add_setting( 'ch_hero_cta_secondary', [
        'default'           => __( 'Criar Perfil', 'creator-hub' ),
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'ch_hero_cta_secondary', [
        'label'   => __( 'Texto CTA Secundário', 'creator-hub' ),
        'section' => 'ch_homepage',
        'type'    => 'text',
    ] );

    $wp_customize->add_setting( 'ch_featured_creators_title', [
        'default'           => __( 'Criadores em Destaque', 'creator-hub' ),
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'ch_featured_creators_title', [
        'label'   => __( 'Título: Criadores em Destaque', 'creator-hub' ),
        'section' => 'ch_homepage',
        'type'    => 'text',
    ] );

    $wp_customize->add_setting( 'ch_featured_creators_count', [
        'default'           => 8,
        'sanitize_callback' => 'absint',
    ] );
    $wp_customize->add_control( 'ch_featured_creators_count', [
        'label'       => __( 'Quantidade de criadores em destaque', 'creator-hub' ),
        'section'     => 'ch_homepage',
        'type'        => 'number',
        'input_attrs' => [ 'min' => 1, 'max' => 24 ],
    ] );

    /* =========================================================
       SECTION: FOOTER
       ========================================================= */
    $wp_customize->add_section( 'ch_footer', [
        'title'    => __( 'Rodapé', 'creator-hub' ),
        'panel'    => 'ch_panel',
        'priority' => 80,
    ] );

    $wp_customize->add_setting( 'ch_footer_desc', [
        'default'           => __( 'A plataforma para criadores de conteúdo independentes. Crie, compartilhe e monetize seu talento.', 'creator-hub' ),
        'sanitize_callback' => 'sanitize_textarea_field',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'ch_footer_desc', [
        'label'   => __( 'Descrição da marca', 'creator-hub' ),
        'section' => 'ch_footer',
        'type'    => 'textarea',
    ] );

    $wp_customize->add_setting( 'ch_footer_copyright', [
        'default'           => sprintf( __( '&copy; %s CreatorHub. Todos os direitos reservados.', 'creator-hub' ), date( 'Y' ) ),
        'sanitize_callback' => 'wp_kses_post',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'ch_footer_copyright', [
        'label'   => __( 'Texto de copyright', 'creator-hub' ),
        'section' => 'ch_footer',
        'type'    => 'text',
    ] );

    // Social links
    $socials = [
        'instagram' => 'Instagram',
        'twitter'   => 'Twitter/X',
        'facebook'  => 'Facebook',
        'youtube'   => 'YouTube',
        'tiktok'    => 'TikTok',
        'linkedin'  => 'LinkedIn',
    ];

    foreach ( $socials as $key => $name ) {
        $wp_customize->add_setting( "ch_social_{$key}", [
            'default'           => '',
            'sanitize_callback' => 'esc_url_raw',
        ] );
        $wp_customize->add_control( "ch_social_{$key}", [
            'label'   => sprintf( __( 'URL do %s', 'creator-hub' ), $name ),
            'section' => 'ch_footer',
            'type'    => 'url',
        ] );
    }

    /* =========================================================
       SECTION: CSS PERSONALIZADO
       ========================================================= */
    $wp_customize->add_section( 'ch_custom_code', [
        'title'    => __( 'Código Personalizado', 'creator-hub' ),
        'panel'    => 'ch_panel',
        'priority' => 100,
    ] );

    $wp_customize->add_setting( 'ch_custom_css', [
        'default'           => '',
        'sanitize_callback' => 'wp_strip_all_tags',
    ] );
    $wp_customize->add_control( new WP_Customize_Code_Editor_Control( $wp_customize, 'ch_custom_css', [
        'label'       => __( 'CSS Personalizado', 'creator-hub' ),
        'description' => __( 'Adicione CSS personalizado aqui. Também disponível em Aparência > Personalizar > CSS Adicional.', 'creator-hub' ),
        'section'     => 'ch_custom_code',
        'code_type'   => 'text/css',
    ] ) );
}
add_action( 'customize_register', 'ch_customizer_settings' );

/* =========================================================
   SANITIZE HELPERS
   ========================================================= */
function ch_sanitize_checkbox( $val ) {
    return (bool) $val;
}

function ch_sanitize_select( $val, $setting ) {
    $choices = $setting->manager->get_control( $setting->id )->choices;
    return array_key_exists( $val, $choices ) ? $val : $setting->default;
}

/* =========================================================
   CUSTOMIZER POSTMESSAGE JS
   ========================================================= */
function ch_customizer_live_preview() {
    wp_enqueue_script(
        'ch-customizer',
        CH_ASSETS . '/js/customizer.js',
        [ 'customize-preview', 'jquery' ],
        CH_VERSION,
        true
    );
}
add_action( 'customize_preview_init', 'ch_customizer_live_preview' );
