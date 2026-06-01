<?php
/**
 * CreatorHub - Search Results Template
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

get_header();

$query_string = get_search_query();
?>

<!-- Search Hero -->
<section class="ch-search-hero">
    <div class="ch-container">
        <h1 style="font-size:clamp(1.5rem,3vw,2.5rem);color:#fff;text-align:center;margin-bottom:24px">
            <?php
            if ( $query_string ) {
                printf(
                    esc_html__( 'Resultados para: "%s"', 'creator-hub' ),
                    '<span style="background:var(--ch-gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">' . esc_html( $query_string ) . '</span>'
                );
            } else {
                esc_html_e( 'Buscar', 'creator-hub' );
            }
            ?>
        </h1>
        <div class="ch-search-input-wrap">
            <?php echo ch_icon( 'search', 22 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
            <form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
                <input
                    type="search"
                    name="s"
                    placeholder="<?php esc_attr_e( 'Buscar criadores, conteúdos, categorias...', 'creator-hub' ); ?>"
                    value="<?php echo esc_attr( $query_string ); ?>"
                    autofocus
                >
            </form>
        </div>
    </div>
</section>

<div class="ch-section">
    <div class="ch-container">
        <?php if ( have_posts() ) : ?>

            <p style="color:var(--ch-text-muted);margin-bottom:24px">
                <?php
                printf(
                    esc_html( _n( '%s resultado encontrado', '%s resultados encontrados', $wp_query->found_posts, 'creator-hub' ) ),
                    '<strong>' . esc_html( number_format_i18n( $wp_query->found_posts ) ) . '</strong>'
                );
                ?>
            </p>

            <div class="ch-grid ch-grid--3">
                <?php while ( have_posts() ) : the_post(); ?>
                    <article <?php post_class( 'ch-card' ); ?>>
                        <?php if ( has_post_thumbnail() ) : ?>
                            <div class="ch-card__media">
                                <a href="<?php the_permalink(); ?>"><?php the_post_thumbnail( 'ch-card-thumb', [ 'loading' => 'lazy' ] ); ?></a>
                            </div>
                        <?php endif; ?>
                        <div class="ch-card__body">
                            <div class="ch-badge ch-badge--primary" style="margin-bottom:8px;display:inline-flex">
                                <?php echo esc_html( get_post_type_object( get_post_type() )->labels->singular_name ?? get_post_type() ); ?>
                            </div>
                            <h2 class="ch-card__title" style="font-size:1.125rem">
                                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                            </h2>
                            <p style="font-size:.875rem;margin-top:8px"><?php the_excerpt(); ?></p>
                        </div>
                    </article>
                <?php endwhile; ?>
            </div>

            <?php ch_pagination(); ?>

        <?php else : ?>

            <div style="text-align:center;padding:60px 0">
                <p style="font-size:1.25rem;color:var(--ch-text-muted)">
                    <?php printf( esc_html__( 'Nenhum resultado para "%s".', 'creator-hub' ), esc_html( $query_string ) ); ?>
                </p>
                <p style="color:var(--ch-text-muted);margin-top:8px">
                    <?php esc_html_e( 'Tente termos mais genéricos ou explore as categorias.', 'creator-hub' ); ?>
                </p>
                <a href="<?php echo esc_url( home_url( '/criadores' ) ); ?>" class="ch-btn ch-btn--primary" style="margin-top:24px">
                    <?php esc_html_e( 'Ver Todos os Criadores', 'creator-hub' ); ?>
                </a>
            </div>

        <?php endif; ?>
    </div>
</div>

<?php get_footer(); ?>
