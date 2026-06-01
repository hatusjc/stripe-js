<?php
/**
 * Template Name: Página Inicial
 * Template Post Type: page
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<!-- =========================================================
     HERO SECTION
     ========================================================= -->
<section class="ch-hero" aria-labelledby="hero-title">
    <?php
    $hero_image = get_header_image();
    if ( $hero_image ) :
    ?>
        <div class="ch-hero__media">
            <img src="<?php echo esc_url( $hero_image ); ?>" alt="" role="presentation">
        </div>
    <?php endif; ?>

    <div class="ch-container">
        <div class="ch-hero__content">
            <div class="ch-hero__eyebrow">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <?php esc_html_e( 'Plataforma de Criadores #1', 'creator-hub' ); ?>
            </div>

            <h1 id="hero-title" class="ch-hero__title">
                <?php
                $title = get_theme_mod( 'ch_hero_title', __( 'A Plataforma dos Criadores', 'creator-hub' ) );
                $parts = explode( ' ', $title, 3 );
                if ( count( $parts ) >= 2 ) :
                    echo esc_html( $parts[0] . ' ' . $parts[1] );
                    if ( isset( $parts[2] ) ) :
                ?>
                    <br><span class="ch-text-gradient"><?php echo esc_html( $parts[2] ); ?></span>
                <?php
                    endif;
                else :
                    echo esc_html( $title );
                endif;
                ?>
            </h1>

            <p class="ch-hero__description">
                <?php echo esc_html( get_theme_mod( 'ch_hero_subtitle', __( 'Conecte-se aos seus criadores favoritos. Acesse conteúdo exclusivo, apoie talentos e faça parte de comunidades incríveis.', 'creator-hub' ) ) ); ?>
            </p>

            <div class="ch-hero__actions">
                <a href="<?php echo esc_url( home_url( '/criadores' ) ); ?>" class="ch-btn ch-btn--subscribe">
                    <?php echo esc_html( get_theme_mod( 'ch_hero_cta_primary', __( 'Explorar Criadores', 'creator-hub' ) ) ); ?>
                    <?php echo ch_icon( 'arrow-right', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                </a>
                <?php if ( ! is_user_logged_in() ) : ?>
                    <a href="<?php echo esc_url( wp_registration_url() ); ?>" class="ch-btn ch-btn--ghost" style="color:#fff;border-color:rgba(255,255,255,0.3)">
                        <?php echo esc_html( get_theme_mod( 'ch_hero_cta_secondary', __( 'Criar Perfil', 'creator-hub' ) ) ); ?>
                    </a>
                <?php endif; ?>
            </div>

            <!-- Stats -->
            <?php
            $stats = [
                [ 'value' => '10K+',  'label' => __( 'Criadores', 'creator-hub' ) ],
                [ 'value' => '500K+', 'label' => __( 'Assinantes', 'creator-hub' ) ],
                [ 'value' => '1M+',   'label' => __( 'Publicações', 'creator-hub' ) ],
            ];
            ?>
            <div class="ch-hero__stats">
                <?php foreach ( $stats as $stat ) : ?>
                    <div>
                        <span class="ch-hero__stat-value"><?php echo esc_html( $stat['value'] ); ?></span>
                        <span class="ch-hero__stat-label"><?php echo esc_html( $stat['label'] ); ?></span>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</section>

<!-- =========================================================
     CREATORS IN SPOTLIGHT
     ========================================================= -->
<section class="ch-section" aria-labelledby="section-creators">
    <div class="ch-container">
        <div class="ch-section__header">
            <span class="ch-section__eyebrow"><?php esc_html_e( 'Em Destaque', 'creator-hub' ); ?></span>
            <h2 id="section-creators" class="ch-section__title">
                <?php echo esc_html( get_theme_mod( 'ch_featured_creators_title', __( 'Criadores em Destaque', 'creator-hub' ) ) ); ?>
            </h2>
            <p class="ch-section__subtitle">
                <?php esc_html_e( 'Descubra criadores incríveis e assine para acessar conteúdo exclusivo.', 'creator-hub' ); ?>
            </p>
        </div>

        <?php
        $featured_query = new WP_Query( [
            'post_type'      => 'ch_creator',
            'post_status'    => 'publish',
            'posts_per_page' => (int) get_theme_mod( 'ch_featured_creators_count', 8 ),
            'meta_query'     => [
                [
                    'key'   => 'ch_featured',
                    'value' => '1',
                ],
            ],
            'orderby'        => 'meta_value_num',
            'meta_key'       => 'ch_subscriber_count',
            'order'          => 'DESC',
        ] );

        if ( $featured_query->have_posts() ) :
        ?>
            <div class="ch-grid ch-grid--4" role="list">
                <?php
                while ( $featured_query->have_posts() ) {
                    $featured_query->the_post();
                    echo '<div role="listitem">';
                    ch_render_creator_card( get_the_ID() );
                    echo '</div>';
                }
                wp_reset_postdata();
                ?>
            </div>

            <div style="text-align:center;margin-top:40px">
                <a href="<?php echo esc_url( home_url( '/criadores' ) ); ?>" class="ch-btn ch-btn--secondary">
                    <?php esc_html_e( 'Ver todos os criadores', 'creator-hub' ); ?>
                    <?php echo ch_icon( 'arrow-right', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                </a>
            </div>
        <?php
        else :
        ?>
            <div style="text-align:center;padding:60px 0;color:var(--ch-text-muted)">
                <p><?php esc_html_e( 'Nenhum criador em destaque ainda. Adicione criadores e marque como destaque.', 'creator-hub' ); ?></p>
                <?php if ( current_user_can( 'edit_posts' ) ) : ?>
                    <a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=ch_creator' ) ); ?>" class="ch-btn ch-btn--primary" style="margin-top:16px">
                        <?php esc_html_e( 'Criar primeiro criador', 'creator-hub' ); ?>
                    </a>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>
</section>

<!-- =========================================================
     CATEGORIES
     ========================================================= -->
<section class="ch-section ch-section--dark" aria-labelledby="section-categories">
    <div class="ch-container">
        <div class="ch-section__header">
            <span class="ch-section__eyebrow"><?php esc_html_e( 'Explore', 'creator-hub' ); ?></span>
            <h2 id="section-categories" class="ch-section__title">
                <?php esc_html_e( 'Categorias', 'creator-hub' ); ?>
            </h2>
        </div>

        <?php
        $terms = get_terms( [
            'taxonomy'   => 'ch_creator_category',
            'hide_empty' => false,
            'number'     => 12,
        ] );

        if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) :
        ?>
            <div class="ch-grid ch-grid--4" role="list">
                <?php foreach ( $terms as $term ) :
                    $emoji = get_term_meta( $term->term_id, 'ch_emoji', true );
                    $color = get_term_meta( $term->term_id, 'ch_category_color', true ) ?: '#7c3aed';
                ?>
                    <div role="listitem">
                        <a href="<?php echo esc_url( get_term_link( $term ) ); ?>" class="ch-category-card">
                            <span class="ch-category-card__icon"><?php echo $emoji ? esc_html( $emoji ) : '🎯'; ?></span>
                            <div class="ch-category-card__name"><?php echo esc_html( $term->name ); ?></div>
                            <div class="ch-category-card__count">
                                <?php
                                printf(
                                    esc_html( _n( '%s criador', '%s criadores', $term->count, 'creator-hub' ) ),
                                    '<strong>' . esc_html( $term->count ) . '</strong>'
                                );
                                ?>
                            </div>
                        </a>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</section>

<!-- =========================================================
     POPULAR CONTENT
     ========================================================= -->
<section class="ch-section" aria-labelledby="section-popular">
    <div class="ch-container">
        <div class="ch-section__header">
            <span class="ch-section__eyebrow"><?php esc_html_e( 'Tendências', 'creator-hub' ); ?></span>
            <h2 id="section-popular" class="ch-section__title">
                <?php esc_html_e( 'Conteúdos Populares', 'creator-hub' ); ?>
            </h2>
        </div>

        <?php
        $popular_query = new WP_Query( [
            'post_type'      => [ 'post', 'ch_post' ],
            'post_status'    => 'publish',
            'posts_per_page' => 6,
            'orderby'        => 'meta_value_num',
            'meta_key'       => 'ch_like_count',
            'order'          => 'DESC',
        ] );

        if ( $popular_query->have_posts() ) :
        ?>
            <div class="ch-grid ch-grid--3">
                <?php
                while ( $popular_query->have_posts() ) {
                    $popular_query->the_post();
                    ?>
                    <article class="ch-card">
                        <?php if ( has_post_thumbnail() ) : ?>
                            <div class="ch-card__media">
                                <a href="<?php the_permalink(); ?>">
                                    <?php the_post_thumbnail( 'ch-card-thumb', [ 'loading' => 'lazy' ] ); ?>
                                </a>
                            </div>
                        <?php endif; ?>
                        <div class="ch-card__body">
                            <?php
                            $cats = get_the_terms( get_the_ID(), 'ch_creator_category' );
                            if ( $cats && ! is_wp_error( $cats ) ) :
                            ?>
                                <span class="ch-badge ch-badge--primary" style="margin-bottom:8px;display:inline-flex"><?php echo esc_html( $cats[0]->name ); ?></span>
                            <?php endif; ?>
                            <h3 class="ch-card__title">
                                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                            </h3>
                            <div class="ch-card__meta">
                                <span><?php the_author(); ?></span>
                                <span>·</span>
                                <span><?php echo esc_html( human_time_diff( get_the_time( 'U' ), time() ) . ' atrás' ); ?></span>
                            </div>
                        </div>
                    </article>
                    <?php
                }
                wp_reset_postdata();
                ?>
            </div>
        <?php endif; ?>
    </div>
</section>

<!-- =========================================================
     CTA SECTION
     ========================================================= -->
<?php if ( ! is_user_logged_in() ) : ?>
<section class="ch-cta" aria-labelledby="cta-title">
    <div class="ch-container">
        <div class="ch-cta__content">
            <h2 id="cta-title" class="ch-cta__title">
                <?php esc_html_e( 'Pronto para começar?', 'creator-hub' ); ?>
                <br><span><?php esc_html_e( 'Crie sua conta gratuita.', 'creator-hub' ); ?></span>
            </h2>
            <p class="ch-cta__description">
                <?php esc_html_e( 'Junte-se a milhares de criadores que já estão monetizando seu conteúdo na nossa plataforma.', 'creator-hub' ); ?>
            </p>
            <div class="ch-cta__actions">
                <a href="<?php echo esc_url( wp_registration_url() ); ?>" class="ch-btn ch-btn--subscribe">
                    <?php esc_html_e( 'Criar Conta Grátis', 'creator-hub' ); ?>
                </a>
                <a href="<?php echo esc_url( home_url( '/criadores' ) ); ?>" class="ch-btn ch-btn--ghost" style="color:#fff;border-color:rgba(255,255,255,0.3)">
                    <?php esc_html_e( 'Explorar Criadores', 'creator-hub' ); ?>
                </a>
            </div>
        </div>
    </div>
</section>
<?php endif; ?>

<?php
get_footer();
