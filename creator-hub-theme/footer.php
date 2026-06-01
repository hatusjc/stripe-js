</main><!-- #main-content -->

<footer class="ch-footer" role="contentinfo">
    <div class="ch-container">
        <div class="ch-footer__main">

            <!-- Brand Column -->
            <div>
                <div class="ch-footer__brand-logo">
                    <?php echo esc_html( get_theme_mod( 'ch_platform_name', get_bloginfo( 'name' ) ) ); ?>
                </div>
                <p class="ch-footer__brand-desc">
                    <?php echo esc_html( get_theme_mod( 'ch_footer_desc', __( 'A plataforma para criadores de conteúdo independentes. Crie, compartilhe e monetize seu talento.', 'creator-hub' ) ) ); ?>
                </p>

                <!-- Social Links -->
                <?php
                $socials = [
                    'instagram' => [
                        'label' => 'Instagram',
                        'icon'  => '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
                    ],
                    'twitter' => [
                        'label' => 'Twitter/X',
                        'icon'  => '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
                    ],
                    'youtube' => [
                        'label' => 'YouTube',
                        'icon'  => '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>',
                    ],
                    'tiktok' => [
                        'label' => 'TikTok',
                        'icon'  => '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.73a4.85 4.85 0 01-1-.04z"/></svg>',
                    ],
                ];

                $has_social = false;
                foreach ( array_keys( $socials ) as $key ) {
                    if ( get_theme_mod( "ch_social_{$key}", '' ) ) { $has_social = true; break; }
                }
                ?>
                <?php if ( $has_social ) : ?>
                    <div class="ch-footer__social">
                        <?php foreach ( $socials as $key => $data ) :
                            $url = get_theme_mod( "ch_social_{$key}", '' );
                            if ( ! $url ) continue;
                        ?>
                            <a href="<?php echo esc_url( $url ); ?>" class="ch-footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr( $data['label'] ); ?>">
                                <?php echo $data['icon']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                            </a>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Links Columns -->
            <?php
            $footer_cols = [
                'ch_footer_col_1' => [
                    'title'    => __( 'Plataforma', 'creator-hub' ),
                    'location' => 'footer',
                    'fallback' => [
                        home_url( '/' )              => __( 'Início', 'creator-hub' ),
                        home_url( '/criadores' )      => __( 'Criadores', 'creator-hub' ),
                        home_url( '/categorias' )     => __( 'Categorias', 'creator-hub' ),
                        home_url( '/buscar' )         => __( 'Buscar', 'creator-hub' ),
                    ],
                ],
                'ch_footer_col_2' => [
                    'title'    => __( 'Para Criadores', 'creator-hub' ),
                    'fallback' => [
                        home_url( '/criar-perfil' )  => __( 'Criar Perfil', 'creator-hub' ),
                        home_url( '/monetizar' )     => __( 'Monetizar', 'creator-hub' ),
                        home_url( '/recursos' )      => __( 'Recursos', 'creator-hub' ),
                        home_url( '/suporte' )       => __( 'Suporte', 'creator-hub' ),
                    ],
                ],
                'ch_footer_col_3' => [
                    'title'    => __( 'Legal', 'creator-hub' ),
                    'fallback' => [
                        home_url( '/termos' )           => __( 'Termos de Uso', 'creator-hub' ),
                        home_url( '/privacidade' )      => __( 'Privacidade', 'creator-hub' ),
                        home_url( '/cookies' )          => __( 'Cookies', 'creator-hub' ),
                        home_url( '/contato' )          => __( 'Contato', 'creator-hub' ),
                    ],
                ],
            ];
            ?>

            <?php foreach ( $footer_cols as $col ) : ?>
                <div>
                    <h3 class="ch-footer__col-title"><?php echo esc_html( $col['title'] ); ?></h3>
                    <ul class="ch-footer__col-links">
                        <?php foreach ( $col['fallback'] as $url => $label ) : ?>
                            <li><a href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $label ); ?></a></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endforeach; ?>

        </div>

        <!-- Footer Bottom -->
        <div class="ch-footer__bottom">
            <p class="ch-footer__copyright">
                <?php echo wp_kses_post( get_theme_mod( 'ch_footer_copyright', sprintf( __( '&copy; %s %s. Todos os direitos reservados.', 'creator-hub' ), gmdate( 'Y' ), get_bloginfo( 'name' ) ) ) ); ?>
            </p>
            <ul class="ch-footer__bottom-links">
                <li><a href="<?php echo esc_url( home_url( '/termos' ) ); ?>"><?php esc_html_e( 'Termos', 'creator-hub' ); ?></a></li>
                <li><a href="<?php echo esc_url( home_url( '/privacidade' ) ); ?>"><?php esc_html_e( 'Privacidade', 'creator-hub' ); ?></a></li>
                <li><a href="<?php echo esc_url( home_url( '/contato' ) ); ?>"><?php esc_html_e( 'Contato', 'creator-hub' ); ?></a></li>
            </ul>
        </div>

    </div>
</footer>

<!-- Scroll to Top -->
<button class="ch-scroll-top" aria-label="<?php esc_attr_e( 'Voltar ao topo', 'creator-hub' ); ?>">
    <?php echo ch_icon( 'arrow-up', 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</button>

<!-- Toast Container -->
<div class="ch-toast-container" aria-live="polite"></div>

<?php wp_footer(); ?>
</body>
</html>
