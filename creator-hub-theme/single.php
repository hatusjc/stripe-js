<?php
/**
 * CreatorHub - Single Post Template
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) : the_post();
    $post_id = get_the_ID();
    $can_view = ch_current_user_can_view( $post_id );
    $is_excl  = ch_is_exclusive_content( $post_id );
?>

<article <?php post_class( 'ch-section ch-single-post' ); ?>>
    <div class="ch-container ch-container--narrow">

        <!-- Post Header -->
        <header style="margin-bottom:32px">
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
                <?php the_tags( '<span class="ch-badge ch-badge--primary">', ' </span><span class="ch-badge ch-badge--primary">', '</span>' ); ?>
                <?php if ( $is_excl ) : ?>
                    <span class="ch-badge ch-badge--locked">
                        <?php echo ch_icon( 'lock', 12 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                        <?php esc_html_e( 'Exclusivo', 'creator-hub' ); ?>
                    </span>
                <?php endif; ?>
            </div>

            <h1 style="font-size:clamp(1.875rem,4vw,3rem);line-height:1.2;margin-bottom:16px"><?php the_title(); ?></h1>

            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
                <div style="display:flex;align-items:center;gap:10px">
                    <img src="<?php echo esc_url( get_avatar_url( get_the_author_meta( 'ID' ), [ 'size' => 40 ] ) ); ?>" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover">
                    <div>
                        <div style="font-weight:600;font-size:.875rem"><?php the_author(); ?></div>
                        <div style="font-size:.75rem;color:var(--ch-text-muted)"><?php echo esc_html( get_the_date() ); ?></div>
                    </div>
                </div>
                <div style="margin-left:auto;display:flex;gap:8px">
                    <button class="ch-post__action-btn" aria-label="<?php esc_attr_e( 'Compartilhar', 'creator-hub' ); ?>">
                        <?php echo ch_icon( 'share', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                        <?php esc_html_e( 'Compartilhar', 'creator-hub' ); ?>
                    </button>
                    <button
                        class="ch-post__action-btn"
                        data-like-btn
                        data-post-id="<?php echo esc_attr( $post_id ); ?>"
                        aria-label="<?php esc_attr_e( 'Curtir', 'creator-hub' ); ?>"
                    >
                        <?php echo ch_icon( 'heart', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                        <span class="ch-like-count"><?php echo esc_html( (int) get_post_meta( $post_id, 'ch_like_count', true ) ); ?></span>
                    </button>
                </div>
            </div>
        </header>

        <!-- Featured Image -->
        <?php if ( has_post_thumbnail() ) : ?>
            <div style="border-radius:16px;overflow:hidden;margin-bottom:32px;aspect-ratio:16/9">
                <?php the_post_thumbnail( 'ch-post-thumb', [ 'style' => 'width:100%;height:100%;object-fit:cover' ] ); ?>
            </div>
        <?php endif; ?>

        <!-- Post Content -->
        <?php if ( $can_view ) : ?>
            <div class="entry-content" style="max-width:680px;margin:0 auto">
                <?php the_content(); ?>
            </div>

            <?php wp_link_pages( [ 'before' => '<div class="page-links">' . esc_html__( 'Páginas:', 'creator-hub' ), 'after' => '</div>' ] ); ?>

        <?php else : ?>
            <div class="ch-post__locked" style="border-radius:16px;overflow:hidden;min-height:300px;position:relative">
                <?php the_excerpt(); ?>
                <div class="ch-post__locked-overlay">
                    <div class="ch-post__locked-icon">
                        <?php echo ch_icon( 'lock', 28 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    </div>
                    <div class="ch-post__locked-title"><?php esc_html_e( 'Conteúdo para Assinantes', 'creator-hub' ); ?></div>
                    <div class="ch-post__locked-desc"><?php esc_html_e( 'Assine para acessar este e muito mais conteúdo exclusivo.', 'creator-hub' ); ?></div>
                    <?php
                    $creator_id = (int) get_post_meta( $post_id, 'ch_creator_id', true );
                    if ( $creator_id ) :
                    ?>
                        <a href="<?php echo esc_url( ch_get_creator_profile_url( $creator_id ) . '#subscribe' ); ?>" class="ch-btn ch-btn--subscribe">
                            <?php esc_html_e( 'Assinar Agora', 'creator-hub' ); ?>
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        <?php endif; ?>

        <!-- Comments -->
        <?php if ( comments_open() || get_comments_number() ) : ?>
            <div style="margin-top:48px;padding-top:48px;border-top:1px solid var(--ch-border)">
                <?php comments_template(); ?>
            </div>
        <?php endif; ?>

    </div>
</article>

<?php endwhile; ?>

<?php get_footer(); ?>
