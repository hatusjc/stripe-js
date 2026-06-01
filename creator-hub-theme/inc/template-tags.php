<?php
/**
 * CreatorHub - Template Tags (reusable output functions)
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

/* =========================================================
   CREATOR CARD
   ========================================================= */
function ch_render_creator_card( int $creator_id, array $args = [] ): void {
    $args = wp_parse_args( $args, [
        'show_subscribe' => true,
        'show_follow'    => true,
        'size'           => 'default',
    ] );

    $name       = get_the_title( $creator_id );
    $username   = ch_get_creator_meta( $creator_id, 'ch_username', '@' . sanitize_title( $name ) );
    $verified   = ch_get_creator_meta( $creator_id, 'ch_verified' ) === '1';
    $followers  = ch_format_count( ch_get_creator_follower_count( $creator_id ) );
    $subs       = ch_format_count( ch_get_creator_subscriber_count( $creator_id ) );
    $price      = (float) ch_get_creator_meta( $creator_id, 'ch_subscription_price', 0 );
    $cover_url  = ch_get_creator_cover_url( $creator_id );
    $avatar_url = ch_get_creator_avatar_url( $creator_id );
    $profile_url = ch_get_creator_profile_url( $creator_id );
    $categories = get_the_terms( $creator_id, 'ch_creator_category' );
    $category   = ! is_wp_error( $categories ) && ! empty( $categories ) ? $categories[0]->name : '';
    $is_following  = ch_is_current_user_following( $creator_id );
    ?>
    <article class="ch-creator-card" data-creator-id="<?php echo esc_attr( $creator_id ); ?>">
        <a href="<?php echo esc_url( $profile_url ); ?>" class="ch-creator-card__cover" aria-label="<?php echo esc_attr( $name ); ?>">
            <img src="<?php echo esc_url( $cover_url ); ?>" alt="" loading="lazy">
        </a>

        <a href="<?php echo esc_url( $profile_url ); ?>" class="ch-creator-card__avatar">
            <img src="<?php echo esc_url( $avatar_url ); ?>" alt="<?php echo esc_attr( $name ); ?>" loading="lazy">
        </a>

        <div class="ch-creator-card__body">
            <a href="<?php echo esc_url( $profile_url ); ?>" class="ch-creator-card__name">
                <?php echo esc_html( $name ); ?>
                <?php if ( $verified ) : ?>
                    <span class="ch-profile__verified" title="<?php esc_attr_e( 'Verificado', 'creator-hub' ); ?>">
                        <?php echo ch_icon( 'check', 12 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    </span>
                <?php endif; ?>
            </a>

            <?php if ( $category ) : ?>
                <div class="ch-creator-card__category"><?php echo esc_html( $category ); ?></div>
            <?php endif; ?>

            <div class="ch-creator-card__stats">
                <div>
                    <span class="ch-creator-card__stat-value"><?php echo esc_html( $followers ); ?></span>
                    <span class="ch-creator-card__stat-label"><?php esc_html_e( 'Seguidores', 'creator-hub' ); ?></span>
                </div>
                <div>
                    <span class="ch-creator-card__stat-value"><?php echo esc_html( $subs ); ?></span>
                    <span class="ch-creator-card__stat-label"><?php esc_html_e( 'Assinantes', 'creator-hub' ); ?></span>
                </div>
            </div>

            <div style="display:flex;gap:8px;justify-content:center">
                <?php if ( $args['show_follow'] ) : ?>
                    <button
                        class="ch-btn ch-btn--ghost ch-btn--sm <?php echo $is_following ? 'is-following' : ''; ?>"
                        data-follow-btn
                        data-creator-id="<?php echo esc_attr( $creator_id ); ?>"
                        data-follow-label="<?php esc_attr_e( 'Seguir', 'creator-hub' ); ?>"
                        data-following-label="<?php esc_attr_e( 'Seguindo', 'creator-hub' ); ?>"
                    >
                        <?php echo $is_following ? esc_html__( 'Seguindo', 'creator-hub' ) : esc_html__( 'Seguir', 'creator-hub' ); ?>
                    </button>
                <?php endif; ?>

                <?php if ( $args['show_subscribe'] && $price > 0 ) : ?>
                    <a href="<?php echo esc_url( $profile_url ); ?>" class="ch-btn ch-btn--primary ch-btn--sm">
                        <?php echo esc_html( ch_format_price( $price ) . '/mês' ); ?>
                    </a>
                <?php elseif ( $args['show_subscribe'] ) : ?>
                    <a href="<?php echo esc_url( $profile_url ); ?>" class="ch-btn ch-btn--primary ch-btn--sm">
                        <?php esc_html_e( 'Ver Perfil', 'creator-hub' ); ?>
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </article>
    <?php
}

/* =========================================================
   SUBSCRIPTION BOX
   ========================================================= */
function ch_render_subscription_box( int $creator_id ): void {
    $price = (float) ch_get_creator_meta( $creator_id, 'ch_subscription_price', 0 );
    $is_subscribed = ch_is_current_user_subscribed( $creator_id );
    $profile_url   = ch_get_creator_profile_url( $creator_id );
    ?>
    <div class="ch-subscription-box">
        <h3 class="ch-subscription-box__title"><?php esc_html_e( 'Assine agora', 'creator-hub' ); ?></h3>

        <?php if ( $price > 0 ) : ?>
            <div class="ch-subscription-box__price">
                <?php echo esc_html( ch_format_price( $price ) ); ?>
                <span>/<?php esc_html_e( 'mês', 'creator-hub' ); ?></span>
            </div>
        <?php else : ?>
            <div class="ch-subscription-box__price">
                <?php esc_html_e( 'Gratuito', 'creator-hub' ); ?>
            </div>
        <?php endif; ?>

        <ul class="ch-subscription-box__features">
            <li class="ch-subscription-box__feature">
                <?php echo ch_icon( 'check', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <?php esc_html_e( 'Acesso a todo conteúdo exclusivo', 'creator-hub' ); ?>
            </li>
            <li class="ch-subscription-box__feature">
                <?php echo ch_icon( 'check', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <?php esc_html_e( 'Mensagens diretas com o criador', 'creator-hub' ); ?>
            </li>
            <li class="ch-subscription-box__feature">
                <?php echo ch_icon( 'check', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <?php esc_html_e( 'Suporte prioritário', 'creator-hub' ); ?>
            </li>
            <li class="ch-subscription-box__feature">
                <?php echo ch_icon( 'check', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <?php esc_html_e( 'Cancele quando quiser', 'creator-hub' ); ?>
            </li>
        </ul>

        <?php if ( ! is_user_logged_in() ) : ?>
            <a href="<?php echo esc_url( wp_login_url( get_permalink() ) ); ?>" class="ch-btn ch-btn--subscribe">
                <?php esc_html_e( 'Fazer Login para Assinar', 'creator-hub' ); ?>
            </a>
        <?php elseif ( $is_subscribed ) : ?>
            <div class="ch-badge ch-badge--success" style="justify-content:center;padding:12px">
                <?php echo ch_icon( 'check', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <?php esc_html_e( 'Você é assinante', 'creator-hub' ); ?>
            </div>
        <?php else : ?>
            <a href="<?php echo esc_url( apply_filters( 'ch_subscribe_url', $profile_url . '#subscribe', $creator_id ) ); ?>" class="ch-btn ch-btn--subscribe">
                <?php esc_html_e( 'Assinar Agora', 'creator-hub' ); ?>
            </a>
            <div class="ch-subscription-box__divider"><?php esc_html_e( 'ou', 'creator-hub' ); ?></div>
            <a href="<?php echo esc_url( $profile_url ); ?>" class="ch-btn ch-btn--ghost" style="width:100%;justify-content:center">
                <?php esc_html_e( 'Ver conteúdo gratuito', 'creator-hub' ); ?>
            </a>
        <?php endif; ?>

        <p style="text-align:center;font-size:0.75rem;color:var(--ch-text-muted);margin-top:12px">
            <?php esc_html_e( 'Pagamento seguro. Cancele a qualquer momento.', 'creator-hub' ); ?>
        </p>
    </div>
    <?php
}

/* =========================================================
   POST CARD (Feed Item)
   ========================================================= */
function ch_render_post_card( int $post_id, array $args = [] ): void {
    $args = wp_parse_args( $args, [ 'show_creator' => true ] );

    $post       = get_post( $post_id );
    $creator_id = (int) get_post_meta( $post_id, 'ch_creator_id', true );
    $can_view   = ch_current_user_can_view( $post_id );
    $is_excl    = ch_is_exclusive_content( $post_id );
    $media      = ch_get_post_media( $post_id );
    $like_count = (int) get_post_meta( $post_id, 'ch_like_count', true );
    $is_liked   = is_user_logged_in() ? (bool) get_user_meta( get_current_user_id(), 'ch_liked_' . $post_id, true ) : false;

    // Creator info
    $creator_name   = $creator_id ? get_the_title( $creator_id ) : get_the_author_meta( 'display_name', $post->post_author );
    $creator_avatar = $creator_id ? ch_get_creator_avatar_url( $creator_id ) : get_avatar_url( $post->post_author );
    $creator_url    = $creator_id ? ch_get_creator_profile_url( $creator_id ) : get_author_posts_url( $post->post_author );
    ?>
    <article class="ch-post" data-post-id="<?php echo esc_attr( $post_id ); ?>">
        <header class="ch-post__header">
            <?php if ( $args['show_creator'] ) : ?>
                <a href="<?php echo esc_url( $creator_url ); ?>" class="ch-post__avatar">
                    <img src="<?php echo esc_url( $creator_avatar ); ?>" alt="<?php echo esc_attr( $creator_name ); ?>" loading="lazy">
                </a>
                <div>
                    <div class="ch-post__author-name">
                        <a href="<?php echo esc_url( $creator_url ); ?>"><?php echo esc_html( $creator_name ); ?></a>
                    </div>
                    <div class="ch-post__date"><?php echo esc_html( human_time_diff( get_post_time( 'U', false, $post ), time() ) . ' ' . __( 'atrás', 'creator-hub' ) ); ?></div>
                </div>
            <?php endif; ?>

            <?php if ( $is_excl ) : ?>
                <span class="ch-badge ch-badge--primary" style="margin-left:auto">
                    <?php echo ch_icon( 'lock', 12 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    <?php esc_html_e( 'Exclusivo', 'creator-hub' ); ?>
                </span>
            <?php endif; ?>

            <button class="ch-post__menu" aria-label="<?php esc_attr_e( 'Opções', 'creator-hub' ); ?>">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
            </button>
        </header>

        <div class="ch-post__content">
            <?php if ( $can_view ) : ?>
                <?php if ( get_the_title( $post_id ) ) : ?>
                    <h3 class="ch-post__text" style="font-size:1.1rem;font-weight:600;margin-bottom:8px"><?php echo esc_html( get_the_title( $post_id ) ); ?></h3>
                <?php endif; ?>

                <div class="ch-post__text"><?php echo wp_kses_post( wp_trim_words( get_post_field( 'post_content', $post_id ), 50 ) ); ?></div>

                <?php if ( ! empty( $media['images'] ) ) : ?>
                    <div class="ch-post__media">
                        <div class="ch-post__media-grid ch-post__media-grid--<?php echo count( $media['images'] ) > 4 ? '4' : count( $media['images'] ); ?>">
                            <?php foreach ( array_slice( $media['images'], 0, 4 ) as $img_id ) : ?>
                                <div class="ch-post__media-item">
                                    <?php echo wp_get_attachment_image( (int) $img_id, 'ch-post-square', false, [ 'loading' => 'lazy' ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php elseif ( has_post_thumbnail( $post_id ) ) : ?>
                    <div class="ch-post__media">
                        <div class="ch-post__media-grid ch-post__media-grid--1">
                            <div class="ch-post__media-item">
                                <?php echo get_the_post_thumbnail( $post_id, 'ch-post-thumb', [ 'loading' => 'lazy' ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                            </div>
                        </div>
                    </div>
                <?php endif; ?>

                <?php if ( $media['video'] ) : ?>
                    <div class="ch-post__media">
                        <video controls style="width:100%;border-radius:12px" loading="lazy">
                            <source src="<?php echo esc_url( $media['video'] ); ?>">
                        </video>
                    </div>
                <?php endif; ?>

                <?php if ( $media['audio'] ) : ?>
                    <div class="ch-post__media">
                        <audio controls style="width:100%">
                            <source src="<?php echo esc_url( $media['audio'] ); ?>">
                        </audio>
                    </div>
                <?php endif; ?>

            <?php else : ?>
                <div class="ch-post__locked">
                    <?php if ( has_post_thumbnail( $post_id ) ) : ?>
                        <?php echo get_the_post_thumbnail( $post_id, 'ch-post-thumb', [ 'style' => 'width:100%;border-radius:12px;opacity:0.3;filter:blur(4px)' ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    <?php else : ?>
                        <div style="height:200px;background:var(--ch-bg-tertiary);border-radius:12px"></div>
                    <?php endif; ?>
                    <div class="ch-post__locked-overlay">
                        <div class="ch-post__locked-icon">
                            <?php echo ch_icon( 'lock', 28 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                        </div>
                        <div class="ch-post__locked-title"><?php esc_html_e( 'Conteúdo Exclusivo', 'creator-hub' ); ?></div>
                        <div class="ch-post__locked-desc">
                            <?php esc_html_e( 'Assine para ter acesso a este conteúdo.', 'creator-hub' ); ?>
                        </div>
                        <?php if ( $creator_id ) : ?>
                            <a href="<?php echo esc_url( ch_get_creator_profile_url( $creator_id ) . '#subscribe' ); ?>" class="ch-btn ch-btn--subscribe" style="font-size:0.875rem;padding:10px 24px">
                                <?php esc_html_e( 'Assinar Agora', 'creator-hub' ); ?>
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>

        <footer class="ch-post__actions">
            <button
                class="ch-post__action-btn <?php echo $is_liked ? 'is-liked' : ''; ?>"
                data-like-btn
                data-post-id="<?php echo esc_attr( $post_id ); ?>"
                aria-label="<?php esc_attr_e( 'Curtir', 'creator-hub' ); ?>"
            >
                <?php echo ch_icon( 'heart', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <span class="ch-like-count"><?php echo esc_html( $like_count ); ?></span>
            </button>

            <button class="ch-post__action-btn" aria-label="<?php esc_attr_e( 'Comentar', 'creator-hub' ); ?>">
                <?php echo ch_icon( 'comment', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <span><?php echo esc_html( get_comments_number( $post_id ) ); ?></span>
            </button>

            <button class="ch-post__action-btn" aria-label="<?php esc_attr_e( 'Compartilhar', 'creator-hub' ); ?>">
                <?php echo ch_icon( 'share', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
            </button>

            <button class="ch-post__action-btn" style="margin-left:auto" aria-label="<?php esc_attr_e( 'Salvar', 'creator-hub' ); ?>">
                <?php echo ch_icon( 'bookmark', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
            </button>
        </footer>
    </article>
    <?php
}

/* =========================================================
   PAGINATION
   ========================================================= */
function ch_pagination( array $args = [] ): void {
    $args = wp_parse_args( $args, [
        'prev_text' => '← ' . __( 'Anterior', 'creator-hub' ),
        'next_text' => __( 'Próximo', 'creator-hub' ) . ' →',
        'mid_size'  => 2,
    ] );

    $links = paginate_links( array_merge( $args, [ 'type' => 'array' ] ) );
    if ( empty( $links ) ) return;
    ?>
    <nav class="ch-pagination" aria-label="<?php esc_attr_e( 'Navegação', 'creator-hub' ); ?>">
        <ul class="ch-pagination__list">
            <?php foreach ( $links as $link ) : ?>
                <li class="ch-pagination__item"><?php echo $link; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></li>
            <?php endforeach; ?>
        </ul>
    </nav>
    <?php
}
