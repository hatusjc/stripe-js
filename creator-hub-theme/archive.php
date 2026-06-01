<?php
/**
 * CreatorHub - Archive Template
 * Used for creator category archives and other archives.
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

get_header();

$is_creator_archive   = is_post_type_archive( 'ch_creator' );
$is_creator_category  = is_tax( 'ch_creator_category' );
$term = $is_creator_category ? get_queried_object() : null;
?>

<!-- Archive Header -->
<section class="ch-search-hero">
    <div class="ch-container">
        <?php if ( $term ) : ?>
            <?php $emoji = get_term_meta( $term->term_id, 'ch_emoji', true ); ?>
            <div style="font-size:4rem;text-align:center;margin-bottom:16px"><?php echo $emoji ? esc_html( $emoji ) : '🎯'; ?></div>
            <h1 style="font-size:clamp(1.5rem,3vw,2.5rem);color:#fff;text-align:center;margin-bottom:8px">
                <?php echo esc_html( $term->name ); ?>
            </h1>
            <?php if ( $term->description ) : ?>
                <p style="color:rgba(255,255,255,.7);text-align:center;max-width:500px;margin:0 auto">
                    <?php echo esc_html( $term->description ); ?>
                </p>
            <?php endif; ?>
        <?php elseif ( $is_creator_archive ) : ?>
            <h1 style="font-size:clamp(1.5rem,3vw,2.5rem);color:#fff;text-align:center">
                <?php esc_html_e( 'Todos os Criadores', 'creator-hub' ); ?>
            </h1>
        <?php else : ?>
            <h1 style="font-size:clamp(1.5rem,3vw,2.5rem);color:#fff;text-align:center">
                <?php the_archive_title(); ?>
            </h1>
        <?php endif; ?>
    </div>
</section>

<!-- Filter Tabs -->
<?php if ( $is_creator_archive || $is_creator_category ) : ?>
<div style="background:var(--ch-surface);border-bottom:1px solid var(--ch-border);padding:16px 0;sticky">
    <div class="ch-container">
        <div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px">
            <a href="<?php echo esc_url( get_post_type_archive_link( 'ch_creator' ) ); ?>" class="ch-category-pill <?php echo ! $is_creator_category ? 'is-active' : ''; ?>">
                <?php esc_html_e( 'Todos', 'creator-hub' ); ?>
            </a>
            <?php
            $cats = get_terms( [ 'taxonomy' => 'ch_creator_category', 'hide_empty' => true ] );
            foreach ( $cats as $cat ) :
                $cat_emoji = get_term_meta( $cat->term_id, 'ch_emoji', true );
            ?>
                <a href="<?php echo esc_url( get_term_link( $cat ) ); ?>" class="ch-category-pill <?php echo ( $term && $term->term_id === $cat->term_id ) ? 'is-active' : ''; ?>">
                    <?php if ( $cat_emoji ) echo esc_html( $cat_emoji ) . ' '; ?>
                    <?php echo esc_html( $cat->name ); ?>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</div>
<?php endif; ?>

<div class="ch-section">
    <div class="ch-container">
        <?php if ( have_posts() ) : ?>

            <?php if ( $is_creator_archive || $is_creator_category ) : ?>
                <div class="ch-grid ch-grid--4" role="list">
                    <?php while ( have_posts() ) : the_post(); ?>
                        <div role="listitem">
                            <?php ch_render_creator_card( get_the_ID() ); ?>
                        </div>
                    <?php endwhile; ?>
                </div>
            <?php else : ?>
                <div class="ch-grid ch-grid--3">
                    <?php while ( have_posts() ) : the_post(); ?>
                        <article <?php post_class( 'ch-card' ); ?>>
                            <?php if ( has_post_thumbnail() ) : ?>
                                <div class="ch-card__media">
                                    <a href="<?php the_permalink(); ?>"><?php the_post_thumbnail( 'ch-card-thumb', [ 'loading' => 'lazy' ] ); ?></a>
                                </div>
                            <?php endif; ?>
                            <div class="ch-card__body">
                                <h2 class="ch-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                                <div class="ch-card__meta"><span><?php the_author(); ?></span><span>·</span><span><?php the_date(); ?></span></div>
                            </div>
                        </article>
                    <?php endwhile; ?>
                </div>
            <?php endif; ?>

            <?php ch_pagination(); ?>

        <?php else : ?>

            <div style="text-align:center;padding:80px 0">
                <p class="ch-text-muted"><?php esc_html_e( 'Nenhum conteúdo nesta categoria ainda.', 'creator-hub' ); ?></p>
            </div>

        <?php endif; ?>
    </div>
</div>

<?php get_footer(); ?>
