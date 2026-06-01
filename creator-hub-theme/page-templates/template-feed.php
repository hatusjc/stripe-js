<?php
/**
 * Template Name: Feed Global
 * Template Post Type: page
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

get_header();

$paged     = get_query_var( 'paged' ) ?: 1;
$category  = isset( $_GET['categoria'] ) ? sanitize_key( $_GET['categoria'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
$type      = isset( $_GET['tipo'] ) ? sanitize_key( $_GET['tipo'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
?>

<div class="ch-section" style="padding-top:var(--ch-space-8)">
    <div class="ch-container">
        <div style="display:grid;grid-template-columns:1fr 320px;gap:32px;align-items:start">

            <!-- Feed -->
            <div>
                <!-- Filters -->
                <div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin-bottom:24px;padding-bottom:4px">
                    <a href="?" class="ch-category-pill <?php echo ! $category ? 'is-active' : ''; ?>">
                        <?php esc_html_e( 'Todos', 'creator-hub' ); ?>
                    </a>
                    <?php
                    $cats = get_terms( [ 'taxonomy' => 'ch_creator_category', 'hide_empty' => true ] );
                    foreach ( $cats as $cat ) :
                        $emoji = get_term_meta( $cat->term_id, 'ch_emoji', true );
                    ?>
                        <a href="?categoria=<?php echo esc_attr( $cat->slug ); ?>" class="ch-category-pill <?php echo $category === $cat->slug ? 'is-active' : ''; ?>">
                            <?php if ( $emoji ) echo esc_html( $emoji ) . ' '; ?>
                            <?php echo esc_html( $cat->name ); ?>
                        </a>
                    <?php endforeach; ?>
                </div>

                <?php
                $tax_query = [];
                if ( $category ) {
                    $tax_query[] = [
                        'taxonomy' => 'ch_creator_category',
                        'field'    => 'slug',
                        'terms'    => $category,
                    ];
                }

                $feed_args = [
                    'post_type'      => [ 'post', 'ch_post' ],
                    'post_status'    => 'publish',
                    'posts_per_page' => 10,
                    'paged'          => $paged,
                    'orderby'        => 'date',
                    'order'          => 'DESC',
                ];

                if ( $tax_query ) $feed_args['tax_query'] = $tax_query;

                $feed_query = new WP_Query( $feed_args );

                if ( $feed_query->have_posts() ) :
                    echo '<div data-posts-container>';
                    while ( $feed_query->have_posts() ) {
                        $feed_query->the_post();
                        ch_render_post_card( get_the_ID() );
                    }
                    wp_reset_postdata();
                    echo '</div>';

                    if ( $feed_query->max_num_pages > 1 ) :
                ?>
                        <div style="text-align:center;margin-top:24px">
                            <button
                                class="ch-btn ch-btn--ghost"
                                data-load-more
                                data-page="1"
                                data-query-vars="<?php echo esc_attr( wp_json_encode( array_intersect_key( $feed_args, array_flip( [ 'post_type', 'tax_query', 'orderby', 'order' ] ) ) ) ); ?>"
                            >
                                <?php esc_html_e( 'Carregar mais', 'creator-hub' ); ?>
                            </button>
                        </div>
                <?php
                    endif;
                else :
                    echo '<div style="text-align:center;padding:60px 0"><p class="ch-text-muted">' . esc_html__( 'Nenhuma publicação encontrada.', 'creator-hub' ) . '</p></div>';
                endif;
                ?>
            </div>

            <!-- Sidebar: Featured Creators -->
            <aside style="position:sticky;top:calc(var(--ch-header-height) + 24px)">
                <div style="background:var(--ch-surface);border:1px solid var(--ch-border);border-radius:16px;padding:24px">
                    <h3 style="font-size:1rem;margin-bottom:16px"><?php esc_html_e( 'Criadores Sugeridos', 'creator-hub' ); ?></h3>
                    <?php
                    $suggested = new WP_Query( [
                        'post_type'      => 'ch_creator',
                        'posts_per_page' => 5,
                        'meta_key'       => 'ch_featured',
                        'meta_value'     => '1',
                        'orderby'        => 'rand',
                    ] );
                    if ( $suggested->have_posts() ) :
                        echo '<div style="display:flex;flex-direction:column;gap:12px">';
                        while ( $suggested->have_posts() ) :
                            $suggested->the_post();
                            $cid = get_the_ID();
                        ?>
                            <div style="display:flex;align-items:center;gap:12px">
                                <a href="<?php the_permalink(); ?>">
                                    <img src="<?php echo esc_url( ch_get_creator_avatar_url( $cid ) ); ?>" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover">
                                </a>
                                <div style="flex:1;min-width:0">
                                    <a href="<?php the_permalink(); ?>" style="font-size:.875rem;font-weight:600;color:var(--ch-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block"><?php the_title(); ?></a>
                                    <span style="font-size:.75rem;color:var(--ch-text-muted)"><?php echo esc_html( ch_format_count( ch_get_creator_subscriber_count( $cid ) ) . ' ' . __( 'assinantes', 'creator-hub' ) ); ?></span>
                                </div>
                                <button
                                    class="ch-btn ch-btn--ghost ch-btn--sm"
                                    data-follow-btn
                                    data-creator-id="<?php echo esc_attr( $cid ); ?>"
                                    style="flex-shrink:0"
                                >
                                    <?php esc_html_e( 'Seguir', 'creator-hub' ); ?>
                                </button>
                            </div>
                        <?php
                        endwhile;
                        wp_reset_postdata();
                        echo '</div>';
                    endif;
                    ?>
                    <a href="<?php echo esc_url( home_url( '/criadores' ) ); ?>" class="ch-btn ch-btn--ghost" style="width:100%;justify-content:center;margin-top:16px;font-size:.875rem">
                        <?php esc_html_e( 'Ver todos', 'creator-hub' ); ?>
                    </a>
                </div>
            </aside>

        </div>
    </div>
</div>

<?php get_footer(); ?>
