<!doctype html>
<html <?php language_attributes(); ?> data-theme="<?php echo esc_attr( get_theme_mod( 'ch_default_theme', 'auto' ) ); ?>">
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="ch-sr-only" href="#main-content"><?php esc_html_e( 'Pular para o conteúdo', 'creator-hub' ); ?></a>

<header class="ch-header" role="banner">
    <div class="ch-container">
        <div class="ch-header__inner">

            <!-- Logo -->
            <div class="ch-header__logo">
                <?php if ( has_custom_logo() ) : ?>
                    <?php the_custom_logo(); ?>
                <?php else : ?>
                    <a href="<?php echo esc_url( home_url( '/' ) ); ?>">
                        <?php echo esc_html( get_theme_mod( 'ch_platform_name', get_bloginfo( 'name' ) ) ); ?>
                    </a>
                <?php endif; ?>
            </div>

            <!-- Primary Navigation -->
            <nav class="ch-nav" aria-label="<?php esc_attr_e( 'Navegação Principal', 'creator-hub' ); ?>">
                <?php
                wp_nav_menu( [
                    'theme_location' => 'primary',
                    'menu_class'     => 'ch-nav__menu',
                    'container'      => false,
                    'fallback_cb'    => function () {
                        echo '<ul class="ch-nav__menu">';
                        echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Início', 'creator-hub' ) . '</a></li>';
                        echo '<li><a href="' . esc_url( home_url( '/criadores' ) ) . '">' . esc_html__( 'Criadores', 'creator-hub' ) . '</a></li>';
                        echo '<li><a href="' . esc_url( home_url( '/categorias' ) ) . '">' . esc_html__( 'Categorias', 'creator-hub' ) . '</a></li>';
                        echo '</ul>';
                    },
                ] );
                ?>
            </nav>

            <!-- Header Actions -->
            <div class="ch-header__actions">

                <?php if ( get_theme_mod( 'ch_show_search_header', true ) ) : ?>
                    <div class="ch-header__search" role="search">
                        <?php echo ch_icon( 'search', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                        <form method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
                            <input
                                type="search"
                                name="s"
                                placeholder="<?php esc_attr_e( 'Buscar criadores...', 'creator-hub' ); ?>"
                                value="<?php echo esc_attr( get_search_query() ); ?>"
                                autocomplete="off"
                                aria-label="<?php esc_attr_e( 'Buscar', 'creator-hub' ); ?>"
                            >
                        </form>
                    </div>
                <?php endif; ?>

                <?php if ( get_theme_mod( 'ch_show_darkmode_toggle', true ) ) : ?>
                    <button class="ch-darkmode-toggle" aria-label="<?php esc_attr_e( 'Alternar tema', 'creator-hub' ); ?>">
                        <svg class="ch-icon-sun" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                        <svg class="ch-icon-moon ch-hidden" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                    </button>
                <?php endif; ?>

                <?php if ( is_user_logged_in() ) : ?>
                    <a href="<?php echo esc_url( home_url( '/dashboard' ) ); ?>" class="ch-btn ch-btn--ghost ch-btn--sm">
                        <?php esc_html_e( 'Dashboard', 'creator-hub' ); ?>
                    </a>
                    <a href="<?php echo esc_url( wp_logout_url( home_url() ) ); ?>" class="ch-btn ch-btn--ghost ch-btn--sm">
                        <?php esc_html_e( 'Sair', 'creator-hub' ); ?>
                    </a>
                <?php else : ?>
                    <a href="<?php echo esc_url( wp_login_url() ); ?>" class="ch-btn ch-btn--ghost ch-btn--sm">
                        <?php esc_html_e( 'Entrar', 'creator-hub' ); ?>
                    </a>
                    <a href="<?php echo esc_url( get_theme_mod( 'ch_header_cta_url', wp_registration_url() ) ); ?>" class="ch-btn ch-btn--primary ch-btn--sm">
                        <?php echo esc_html( get_theme_mod( 'ch_header_cta_text', __( 'Começar Grátis', 'creator-hub' ) ) ); ?>
                    </a>
                <?php endif; ?>

                <!-- Mobile Toggle -->
                <button class="ch-menu-toggle" aria-expanded="false" aria-controls="ch-mobile-nav" aria-label="<?php esc_attr_e( 'Abrir menu', 'creator-hub' ); ?>">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

        </div>
    </div>
</header>

<!-- Mobile Navigation Overlay -->
<nav id="ch-mobile-nav" class="ch-mobile-nav" aria-label="<?php esc_attr_e( 'Menu Mobile', 'creator-hub' ); ?>">
    <button class="ch-mobile-nav__close" aria-label="<?php esc_attr_e( 'Fechar menu', 'creator-hub' ); ?>">
        <?php echo ch_icon( 'x', 24 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    </button>
    <?php
    wp_nav_menu( [
        'theme_location' => 'mobile',
        'menu_class'     => 'ch-mobile-nav__menu',
        'container'      => false,
        'fallback_cb'    => function () {
            echo '<ul class="ch-mobile-nav__menu">';
            $nav_items = [
                home_url( '/' )           => __( 'Início', 'creator-hub' ),
                home_url( '/criadores' )  => __( 'Criadores', 'creator-hub' ),
                home_url( '/categorias' ) => __( 'Categorias', 'creator-hub' ),
                home_url( '/buscar' )     => __( 'Buscar', 'creator-hub' ),
            ];
            foreach ( $nav_items as $url => $label ) {
                echo '<li><a href="' . esc_url( $url ) . '">' . esc_html( $label ) . '</a></li>';
            }
            echo '</ul>';
        },
    ] );
    ?>
    <div style="margin-top:auto;padding:24px 0;display:flex;flex-direction:column;gap:12px">
        <?php if ( is_user_logged_in() ) : ?>
            <a href="<?php echo esc_url( home_url( '/dashboard' ) ); ?>" class="ch-btn ch-btn--ghost" style="justify-content:center">
                <?php esc_html_e( 'Dashboard', 'creator-hub' ); ?>
            </a>
        <?php else : ?>
            <a href="<?php echo esc_url( wp_login_url() ); ?>" class="ch-btn ch-btn--ghost" style="justify-content:center">
                <?php esc_html_e( 'Entrar', 'creator-hub' ); ?>
            </a>
            <a href="<?php echo esc_url( wp_registration_url() ); ?>" class="ch-btn ch-btn--primary" style="justify-content:center">
                <?php esc_html_e( 'Começar Grátis', 'creator-hub' ); ?>
            </a>
        <?php endif; ?>
    </div>
</nav>

<main id="main-content" role="main">
