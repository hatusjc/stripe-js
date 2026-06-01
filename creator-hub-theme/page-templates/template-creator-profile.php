<?php
/**
 * Template Name: Perfil do Criador
 * Template Post Type: page, ch_creator
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

get_header();

$creator_id  = get_queried_object_id();
$is_creator  = get_post_type( $creator_id ) === 'ch_creator';

// If not a creator post type, try to find by URL param or author
if ( ! $is_creator ) {
    $username = get_query_var( 'ch_creator' );
    if ( $username ) {
        $q = new WP_Query( [
            'post_type'  => 'ch_creator',
            'meta_key'   => 'ch_username',
            'meta_value' => sanitize_text_field( $username ),
            'posts_per_page' => 1,
        ] );
        if ( $q->have_posts() ) {
            $q->the_post();
            $creator_id = get_the_ID();
            $is_creator = true;
            wp_reset_postdata();
        }
    }
}

if ( ! $is_creator ) {
    echo '<div class="ch-container" style="padding:80px 0;text-align:center"><p>' . esc_html__( 'Criador não encontrado.', 'creator-hub' ) . '</p></div>';
    get_footer();
    return;
}

// Gather creator data
$name           = get_the_title( $creator_id );
$bio            = get_post_field( 'post_content', $creator_id );
$username       = ch_get_creator_meta( $creator_id, 'ch_username', '@' . sanitize_title( $name ) );
$verified       = ch_get_creator_meta( $creator_id, 'ch_verified' ) === '1';
$cover_url      = ch_get_creator_cover_url( $creator_id );
$avatar_url     = ch_get_creator_avatar_url( $creator_id );
$followers      = ch_format_count( ch_get_creator_follower_count( $creator_id ) );
$subs           = ch_format_count( ch_get_creator_subscriber_count( $creator_id ) );
$is_following   = ch_is_current_user_following( $creator_id );
$is_subscribed  = ch_is_current_user_subscribed( $creator_id );

$socials = [
    'instagram' => [ 'label' => 'Instagram', 'icon' => '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>' ],
    'twitter'   => [ 'label' => 'Twitter/X', 'icon' => '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' ],
    'youtube'   => [ 'label' => 'YouTube',   'icon' => '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>' ],
    'tiktok'    => [ 'label' => 'TikTok',    'icon' => '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.73a4.85 4.85 0 01-1-.04z"/></svg>' ],
    'website'   => [ 'label' => 'Website',   'icon' => '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' ],
];
?>

<div class="ch-profile">
    <!-- Cover Image -->
    <div class="ch-profile__cover" aria-hidden="true">
        <img src="<?php echo esc_url( $cover_url ); ?>" alt="">
    </div>

    <div class="ch-container">
        <!-- Profile Header -->
        <header class="ch-profile__header">
            <div class="ch-profile__header-inner">
                <div class="ch-profile__avatar">
                    <img src="<?php echo esc_url( $avatar_url ); ?>" alt="<?php echo esc_attr( $name ); ?>">
                </div>

                <div class="ch-profile__info">
                    <h1 class="ch-profile__name">
                        <?php echo esc_html( $name ); ?>
                        <?php if ( $verified ) : ?>
                            <span class="ch-profile__verified" title="<?php esc_attr_e( 'Verificado', 'creator-hub' ); ?>">
                                <?php echo ch_icon( 'check', 14 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                            </span>
                        <?php endif; ?>
                    </h1>

                    <div class="ch-profile__username"><?php echo esc_html( $username ); ?></div>

                    <?php if ( $bio ) : ?>
                        <p class="ch-profile__bio"><?php echo wp_kses_post( $bio ); ?></p>
                    <?php endif; ?>

                    <div class="ch-profile__stats">
                        <div class="ch-profile__stat">
                            <span class="ch-profile__stat-value" data-follow-count><?php echo esc_html( $followers ); ?></span>
                            <span class="ch-profile__stat-label"><?php esc_html_e( 'Seguidores', 'creator-hub' ); ?></span>
                        </div>
                        <div class="ch-profile__stat">
                            <span class="ch-profile__stat-value"><?php echo esc_html( $subs ); ?></span>
                            <span class="ch-profile__stat-label"><?php esc_html_e( 'Assinantes', 'creator-hub' ); ?></span>
                        </div>
                    </div>

                    <!-- Social Links -->
                    <?php $has_social = false;
                    foreach ( array_keys( $socials ) as $key ) {
                        if ( ch_get_creator_meta( $creator_id, "ch_{$key}" ) ) { $has_social = true; break; }
                    } ?>
                    <?php if ( $has_social ) : ?>
                        <div class="ch-profile__social">
                            <?php foreach ( $socials as $key => $data ) :
                                $url = ch_get_creator_meta( $creator_id, "ch_{$key}" );
                                if ( ! $url ) continue;
                            ?>
                                <a href="<?php echo esc_url( $url ); ?>" class="ch-profile__social-link" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr( $data['label'] ); ?>">
                                    <?php echo $data['icon']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Profile Actions -->
                <div class="ch-profile__actions">
                    <?php if ( is_user_logged_in() ) : ?>
                        <button
                            class="ch-btn ch-btn--ghost <?php echo $is_following ? 'is-following' : ''; ?>"
                            data-follow-btn
                            data-creator-id="<?php echo esc_attr( $creator_id ); ?>"
                            data-follow-label="<?php esc_attr_e( 'Seguir', 'creator-hub' ); ?>"
                            data-following-label="<?php esc_attr_e( 'Seguindo ✓', 'creator-hub' ); ?>"
                        >
                            <?php echo $is_following ? esc_html__( 'Seguindo ✓', 'creator-hub' ) : esc_html__( 'Seguir', 'creator-hub' ); ?>
                        </button>
                    <?php endif; ?>

                    <?php if ( ! $is_subscribed ) : ?>
                        <a href="#subscribe" class="ch-btn ch-btn--subscribe">
                            <?php esc_html_e( 'Assinar', 'creator-hub' ); ?>
                        </a>
                    <?php else : ?>
                        <span class="ch-badge ch-badge--success" style="padding:10px 16px">
                            <?php echo ch_icon( 'check', 14 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                            <?php esc_html_e( 'Assinante', 'creator-hub' ); ?>
                        </span>
                    <?php endif; ?>
                </div>
            </div>
        </header>

        <!-- Profile Tabs -->
        <nav class="ch-profile__tabs" aria-label="<?php esc_attr_e( 'Seções do perfil', 'creator-hub' ); ?>">
            <div class="ch-profile__tabs-inner">
                <button class="ch-profile__tab is-active" data-tab="feed">
                    <?php esc_html_e( 'Feed', 'creator-hub' ); ?>
                </button>
                <button class="ch-profile__tab" data-tab="media">
                    <?php esc_html_e( 'Mídia', 'creator-hub' ); ?>
                </button>
                <button class="ch-profile__tab" data-tab="about">
                    <?php esc_html_e( 'Sobre', 'creator-hub' ); ?>
                </button>
            </div>
        </nav>

        <!-- Profile Content -->
        <div class="ch-profile__layout">

            <!-- Main Content Area -->
            <div>
                <!-- Feed Tab -->
                <div data-tab-panel="feed">
                    <?php
                    $posts_query = new WP_Query( [
                        'post_type'      => [ 'post', 'ch_post' ],
                        'post_status'    => 'publish',
                        'posts_per_page' => 10,
                        'author'         => get_post_field( 'post_author', $creator_id ),
                        'meta_query'     => [
                            'relation' => 'OR',
                            [
                                'key'     => 'ch_creator_id',
                                'value'   => $creator_id,
                                'compare' => '=',
                            ],
                            [
                                'key'     => 'ch_creator_id',
                                'compare' => 'NOT EXISTS',
                            ],
                        ],
                        'orderby'        => [ 'meta_value' => 'DESC', 'date' => 'DESC' ],
                        'meta_key'       => 'ch_is_pinned',
                    ] );

                    if ( $posts_query->have_posts() ) :
                        echo '<div data-posts-container>';
                        while ( $posts_query->have_posts() ) {
                            $posts_query->the_post();
                            ch_render_post_card( get_the_ID(), [ 'show_creator' => false ] );
                        }
                        wp_reset_postdata();
                        echo '</div>';
                    else :
                    ?>
                        <div style="text-align:center;padding:60px 0;color:var(--ch-text-muted)">
                            <p><?php esc_html_e( 'Nenhuma publicação ainda.', 'creator-hub' ); ?></p>
                        </div>
                    <?php endif; ?>

                    <?php if ( $posts_query->max_num_pages > 1 ) : ?>
                        <div style="text-align:center;margin-top:24px">
                            <button
                                class="ch-btn ch-btn--ghost"
                                data-load-more
                                data-page="1"
                                data-load-text="<?php esc_attr_e( 'Carregar mais', 'creator-hub' ); ?>"
                                data-loading-text="<?php esc_attr_e( 'Carregando...', 'creator-hub' ); ?>"
                                data-query-vars="<?php echo esc_attr( wp_json_encode( [ 'post_type' => [ 'post', 'ch_post' ], 'author' => get_post_field( 'post_author', $creator_id ) ] ) ); ?>"
                            >
                                <?php esc_html_e( 'Carregar mais', 'creator-hub' ); ?>
                            </button>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Media Tab -->
                <div data-tab-panel="media" class="ch-hidden">
                    <?php
                    $media_query = new WP_Query( [
                        'post_type'      => [ 'post', 'ch_post' ],
                        'post_status'    => 'publish',
                        'posts_per_page' => 24,
                        'author'         => get_post_field( 'post_author', $creator_id ),
                        'meta_key'       => '_thumbnail_id',
                    ] );

                    if ( $media_query->have_posts() ) :
                    ?>
                        <div class="ch-gallery">
                            <?php while ( $media_query->have_posts() ) : $media_query->the_post(); ?>
                                <?php if ( has_post_thumbnail() ) : ?>
                                    <div class="ch-gallery__item">
                                        <a href="<?php the_permalink(); ?>" data-lightbox data-src="<?php echo esc_url( get_the_post_thumbnail_url( get_the_ID(), 'full' ) ); ?>">
                                            <?php the_post_thumbnail( 'ch-post-square', [ 'loading' => 'lazy' ] ); ?>
                                            <div class="ch-gallery__item-overlay">
                                                <?php echo ch_icon( 'image', 24 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                                            </div>
                                        </a>
                                    </div>
                                <?php endif; ?>
                            <?php endwhile; wp_reset_postdata(); ?>
                        </div>
                    <?php else : ?>
                        <div style="text-align:center;padding:60px 0;color:var(--ch-text-muted)">
                            <p><?php esc_html_e( 'Nenhuma mídia publicada ainda.', 'creator-hub' ); ?></p>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- About Tab -->
                <div data-tab-panel="about" class="ch-hidden">
                    <div style="background:var(--ch-surface);border:1px solid var(--ch-border);border-radius:16px;padding:32px">
                        <h2 style="margin-bottom:16px"><?php echo esc_html( $name ); ?></h2>
                        <?php if ( $bio ) : ?>
                            <div class="ch-post__text" style="color:var(--ch-text-secondary)">
                                <?php echo wp_kses_post( apply_filters( 'the_content', $bio ) ); ?>
                            </div>
                        <?php endif; ?>

                        <?php
                        $categories = get_the_terms( $creator_id, 'ch_creator_category' );
                        if ( $categories && ! is_wp_error( $categories ) ) :
                        ?>
                            <div style="margin-top:24px">
                                <strong style="font-size:0.875rem;color:var(--ch-text-muted);text-transform:uppercase;letter-spacing:.05em"><?php esc_html_e( 'Categorias', 'creator-hub' ); ?></strong>
                                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
                                    <?php foreach ( $categories as $cat ) : ?>
                                        <a href="<?php echo esc_url( get_term_link( $cat ) ); ?>" class="ch-category-pill">
                                            <?php echo esc_html( $cat->name ); ?>
                                        </a>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <aside id="subscribe" aria-label="<?php esc_attr_e( 'Assinatura', 'creator-hub' ); ?>">
                <?php ch_render_subscription_box( $creator_id ); ?>
            </aside>
        </div>
    </div>
</div>

<?php get_footer(); ?>
