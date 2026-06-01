<?php
/**
 * CreatorHub - Main Index Template
 * Fallback template for all pages without a specific template.
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<div class="ch-section">
    <div class="ch-container">
        <?php if ( have_posts() ) : ?>

            <div class="ch-grid ch-grid--3">
                <?php while ( have_posts() ) : the_post(); ?>
                    <article <?php post_class( 'ch-card' ); ?>>
                        <?php if ( has_post_thumbnail() ) : ?>
                            <div class="ch-card__media">
                                <a href="<?php the_permalink(); ?>"><?php the_post_thumbnail( 'ch-card-thumb', [ 'loading' => 'lazy' ] ); ?></a>
                            </div>
                        <?php endif; ?>
                        <div class="ch-card__body">
                            <h2 class="ch-card__title">
                                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                            </h2>
                            <div class="ch-card__meta">
                                <span><?php the_author(); ?></span>
                                <span>·</span>
                                <span><?php the_date(); ?></span>
                            </div>
                            <p><?php the_excerpt(); ?></p>
                        </div>
                    </article>
                <?php endwhile; ?>
            </div>

            <?php ch_pagination(); ?>

        <?php else : ?>

            <div style="text-align:center;padding:80px 0">
                <h2><?php esc_html_e( 'Nenhum conteúdo encontrado.', 'creator-hub' ); ?></h2>
                <p class="ch-text-muted"><?php esc_html_e( 'Tente buscar por algo diferente ou navegue pelas categorias.', 'creator-hub' ); ?></p>
                <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="ch-btn ch-btn--primary" style="margin-top:16px">
                    <?php esc_html_e( 'Ir para o Início', 'creator-hub' ); ?>
                </a>
            </div>

        <?php endif; ?>
    </div>
</div>

<?php get_footer(); ?>
