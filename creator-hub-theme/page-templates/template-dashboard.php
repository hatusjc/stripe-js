<?php
/**
 * Template Name: Dashboard do Usuário
 * Template Post Type: page
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

if ( ! is_user_logged_in() ) {
    wp_redirect( wp_login_url( get_permalink() ) );
    exit;
}

get_header();

$user       = wp_get_current_user();
$user_id    = $user->ID;
$is_creator = current_user_can( 'edit_posts' );
$saved_ids  = get_user_meta( $user_id, 'ch_saved_posts', true );
$saved_ids  = is_array( $saved_ids ) ? $saved_ids : [];
$following  = get_user_meta( $user_id, 'ch_following', true );
$following  = is_array( $following ) ? $following : [];
$subs       = get_user_meta( $user_id, 'ch_subscriptions', true );
$subs       = is_array( $subs ) ? $subs : [];
$active_tab = isset( $_GET['tab'] ) ? sanitize_key( $_GET['tab'] ) : 'feed'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
?>

<div class="ch-dashboard">

    <!-- Sidebar -->
    <nav class="ch-dashboard__sidebar" aria-label="<?php esc_attr_e( 'Menu do Dashboard', 'creator-hub' ); ?>">

        <div class="ch-dashboard__nav-group">
            <div class="ch-dashboard__nav-label"><?php esc_html_e( 'Geral', 'creator-hub' ); ?></div>

            <a href="?tab=feed" class="ch-dashboard__nav-link <?php echo $active_tab === 'feed' ? 'is-active' : ''; ?>">
                <?php echo ch_icon( 'image', 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <span><?php esc_html_e( 'Feed', 'creator-hub' ); ?></span>
            </a>
            <a href="?tab=following" class="ch-dashboard__nav-link <?php echo $active_tab === 'following' ? 'is-active' : ''; ?>">
                <?php echo ch_icon( 'users', 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <span><?php esc_html_e( 'Seguindo', 'creator-hub' ); ?></span>
            </a>
            <a href="?tab=subscriptions" class="ch-dashboard__nav-link <?php echo $active_tab === 'subscriptions' ? 'is-active' : ''; ?>">
                <?php echo ch_icon( 'star', 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <span><?php esc_html_e( 'Assinaturas', 'creator-hub' ); ?></span>
            </a>
            <a href="?tab=saved" class="ch-dashboard__nav-link <?php echo $active_tab === 'saved' ? 'is-active' : ''; ?>">
                <?php echo ch_icon( 'bookmark', 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <span><?php esc_html_e( 'Salvos', 'creator-hub' ); ?></span>
            </a>
        </div>

        <?php if ( $is_creator ) : ?>
        <div class="ch-dashboard__nav-group">
            <div class="ch-dashboard__nav-label"><?php esc_html_e( 'Criador', 'creator-hub' ); ?></div>

            <a href="?tab=stats" class="ch-dashboard__nav-link <?php echo $active_tab === 'stats' ? 'is-active' : ''; ?>">
                <?php echo ch_icon( 'chart', 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <span><?php esc_html_e( 'Estatísticas', 'creator-hub' ); ?></span>
            </a>
            <a href="?tab=posts" class="ch-dashboard__nav-link <?php echo $active_tab === 'posts' ? 'is-active' : ''; ?>">
                <?php echo ch_icon( 'image', 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <span><?php esc_html_e( 'Publicações', 'creator-hub' ); ?></span>
            </a>
            <a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=ch_post' ) ); ?>" class="ch-dashboard__nav-link">
                <?php echo ch_icon( 'arrow-right', 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <span><?php esc_html_e( 'Nova Publicação', 'creator-hub' ); ?></span>
            </a>
        </div>
        <?php endif; ?>

        <div class="ch-dashboard__nav-group">
            <div class="ch-dashboard__nav-label"><?php esc_html_e( 'Conta', 'creator-hub' ); ?></div>

            <a href="?tab=profile" class="ch-dashboard__nav-link <?php echo $active_tab === 'profile' ? 'is-active' : ''; ?>">
                <?php echo ch_icon( 'settings', 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <span><?php esc_html_e( 'Perfil', 'creator-hub' ); ?></span>
            </a>
            <a href="<?php echo esc_url( wp_logout_url( home_url() ) ); ?>" class="ch-dashboard__nav-link">
                <?php echo ch_icon( 'x', 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <span><?php esc_html_e( 'Sair', 'creator-hub' ); ?></span>
            </a>
        </div>

    </nav>

    <!-- Main Content -->
    <div class="ch-dashboard__main">

        <!-- Dashboard Header -->
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:32px;flex-wrap:wrap">
            <img src="<?php echo esc_url( get_avatar_url( $user_id, [ 'size' => 56 ] ) ); ?>" alt="" style="width:56px;height:56px;border-radius:50%;object-fit:cover">
            <div>
                <h1 style="font-size:1.5rem;margin-bottom:4px"><?php printf( esc_html__( 'Olá, %s!', 'creator-hub' ), esc_html( $user->display_name ) ); ?></h1>
                <p style="color:var(--ch-text-muted);font-size:0.875rem;margin:0"><?php esc_html_e( 'Bem-vindo ao seu dashboard.', 'creator-hub' ); ?></p>
            </div>
        </div>

        <?php
        switch ( $active_tab ) {

            /* --- FEED --- */
            case 'feed':
            ?>
                <h2 style="margin-bottom:24px"><?php esc_html_e( 'Seu Feed', 'creator-hub' ); ?></h2>
                <?php
                if ( ! empty( $following ) ) :
                    $feed_query = new WP_Query( [
                        'post_type'      => [ 'post', 'ch_post' ],
                        'post_status'    => 'publish',
                        'posts_per_page' => 10,
                        'meta_query'     => [
                            [
                                'key'     => 'ch_creator_id',
                                'value'   => $following,
                                'compare' => 'IN',
                            ],
                        ],
                        'orderby' => 'date',
                        'order'   => 'DESC',
                    ] );

                    if ( $feed_query->have_posts() ) :
                        while ( $feed_query->have_posts() ) {
                            $feed_query->the_post();
                            ch_render_post_card( get_the_ID() );
                        }
                        wp_reset_postdata();
                    else :
                        echo '<p class="ch-text-muted">' . esc_html__( 'Nenhuma publicação recente dos criadores que você segue.', 'creator-hub' ) . '</p>';
                    endif;
                else :
                    echo '<div style="text-align:center;padding:60px 0">
                        <p class="ch-text-muted">' . esc_html__( 'Siga criadores para ver o conteúdo deles aqui.', 'creator-hub' ) . '</p>
                        <a href="' . esc_url( home_url( '/criadores' ) ) . '" class="ch-btn ch-btn--primary" style="margin-top:16px">' . esc_html__( 'Explorar Criadores', 'creator-hub' ) . '</a>
                    </div>';
                endif;
                break;

            /* --- FOLLOWING --- */
            case 'following':
            ?>
                <h2 style="margin-bottom:24px"><?php esc_html_e( 'Criadores que Sigo', 'creator-hub' ); ?></h2>
                <?php
                if ( ! empty( $following ) ) :
                    echo '<div class="ch-grid ch-grid--4">';
                    foreach ( $following as $cid ) {
                        if ( get_post_status( $cid ) === 'publish' ) {
                            ch_render_creator_card( (int) $cid );
                        }
                    }
                    echo '</div>';
                else :
                    echo '<p class="ch-text-muted">' . esc_html__( 'Você não segue nenhum criador ainda.', 'creator-hub' ) . '</p>';
                endif;
                break;

            /* --- SUBSCRIPTIONS --- */
            case 'subscriptions':
            ?>
                <h2 style="margin-bottom:24px"><?php esc_html_e( 'Minhas Assinaturas', 'creator-hub' ); ?></h2>
                <?php
                if ( ! empty( $subs ) ) :
                    echo '<div class="ch-grid ch-grid--3">';
                    foreach ( $subs as $cid ) {
                        if ( get_post_status( $cid ) === 'publish' ) {
                            ch_render_creator_card( (int) $cid, [ 'show_follow' => false ] );
                        }
                    }
                    echo '</div>';
                else :
                    echo '<p class="ch-text-muted">' . esc_html__( 'Você não possui assinaturas ativas.', 'creator-hub' ) . '</p>';
                endif;
                break;

            /* --- SAVED --- */
            case 'saved':
            ?>
                <h2 style="margin-bottom:24px"><?php esc_html_e( 'Conteúdos Salvos', 'creator-hub' ); ?></h2>
                <?php
                if ( ! empty( $saved_ids ) ) :
                    $saved_query = new WP_Query( [
                        'post_type' => 'any',
                        'post__in'  => $saved_ids,
                        'orderby'   => 'post__in',
                    ] );

                    if ( $saved_query->have_posts() ) :
                        while ( $saved_query->have_posts() ) {
                            $saved_query->the_post();
                            ch_render_post_card( get_the_ID() );
                        }
                        wp_reset_postdata();
                    endif;
                else :
                    echo '<p class="ch-text-muted">' . esc_html__( 'Nenhum conteúdo salvo ainda.', 'creator-hub' ) . '</p>';
                endif;
                break;

            /* --- STATS (CREATOR) --- */
            case 'stats':
                if ( ! $is_creator ) break;

                $my_creator = get_posts( [
                    'post_type'   => 'ch_creator',
                    'author'      => $user_id,
                    'numberposts' => 1,
                ] );
                $c_id = $my_creator ? $my_creator[0]->ID : 0;
                ?>
                <h2 style="margin-bottom:24px"><?php esc_html_e( 'Estatísticas', 'creator-hub' ); ?></h2>
                <div class="ch-grid ch-grid--4" style="margin-bottom:32px">
                    <?php
                    $stat_cards = [
                        [
                            'label' => __( 'Seguidores', 'creator-hub' ),
                            'value' => $c_id ? ch_format_count( ch_get_creator_follower_count( $c_id ) ) : '0',
                            'color' => 'rgba(124,58,237,0.15)',
                            'icon'  => 'users',
                        ],
                        [
                            'label' => __( 'Assinantes', 'creator-hub' ),
                            'value' => $c_id ? ch_format_count( ch_get_creator_subscriber_count( $c_id ) ) : '0',
                            'color' => 'rgba(236,72,153,0.15)',
                            'icon'  => 'star',
                        ],
                        [
                            'label' => __( 'Publicações', 'creator-hub' ),
                            'value' => wp_count_posts( 'ch_post' )->publish,
                            'color' => 'rgba(6,182,212,0.15)',
                            'icon'  => 'image',
                        ],
                        [
                            'label' => __( 'Curtidas', 'creator-hub' ),
                            'value' => ch_format_count( (int) get_user_meta( $user_id, 'ch_total_likes', true ) ),
                            'color' => 'rgba(239,68,68,0.15)',
                            'icon'  => 'heart',
                        ],
                    ];
                    ?>
                    <?php foreach ( $stat_cards as $sc ) : ?>
                        <div class="ch-stat-card">
                            <div class="ch-stat-card__icon" style="background:<?php echo esc_attr( $sc['color'] ); ?>">
                                <?php echo ch_icon( $sc['icon'], 20, 'ch-text-primary' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                            </div>
                            <div class="ch-stat-card__label"><?php echo esc_html( $sc['label'] ); ?></div>
                            <div class="ch-stat-card__value"><?php echo esc_html( $sc['value'] ); ?></div>
                        </div>
                    <?php endforeach; ?>
                </div>
                <?php
                break;

            /* --- MY POSTS --- */
            case 'posts':
                if ( ! $is_creator ) break;
                ?>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">
                    <h2><?php esc_html_e( 'Minhas Publicações', 'creator-hub' ); ?></h2>
                    <a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=ch_post' ) ); ?>" class="ch-btn ch-btn--primary ch-btn--sm">
                        + <?php esc_html_e( 'Nova Publicação', 'creator-hub' ); ?>
                    </a>
                </div>
                <?php
                $my_posts = new WP_Query( [
                    'post_type'      => 'ch_post',
                    'author'         => $user_id,
                    'post_status'    => [ 'publish', 'draft', 'pending' ],
                    'posts_per_page' => 20,
                ] );
                if ( $my_posts->have_posts() ) :
                    echo '<div style="background:var(--ch-surface);border:1px solid var(--ch-border);border-radius:16px;overflow:hidden">';
                    echo '<table style="width:100%;border-collapse:collapse">';
                    echo '<thead><tr style="background:var(--ch-bg-secondary)">';
                    echo '<th style="padding:12px 16px;text-align:left;font-size:.875rem;color:var(--ch-text-muted)">' . esc_html__( 'Título', 'creator-hub' ) . '</th>';
                    echo '<th style="padding:12px 16px;text-align:center;font-size:.875rem;color:var(--ch-text-muted)">' . esc_html__( 'Status', 'creator-hub' ) . '</th>';
                    echo '<th style="padding:12px 16px;text-align:center;font-size:.875rem;color:var(--ch-text-muted)">' . esc_html__( 'Curtidas', 'creator-hub' ) . '</th>';
                    echo '<th style="padding:12px 16px;text-align:right;font-size:.875rem;color:var(--ch-text-muted)">' . esc_html__( 'Ações', 'creator-hub' ) . '</th>';
                    echo '</tr></thead><tbody>';
                    while ( $my_posts->have_posts() ) {
                        $my_posts->the_post();
                        $pid    = get_the_ID();
                        $status = get_post_status( $pid );
                        $likes  = (int) get_post_meta( $pid, 'ch_like_count', true );
                        $badge  = $status === 'publish' ? 'ch-badge--success' : 'ch-badge--warning';
                        $status_label = $status === 'publish' ? __( 'Publicado', 'creator-hub' ) : __( 'Rascunho', 'creator-hub' );
                        echo '<tr style="border-top:1px solid var(--ch-border)">';
                        echo '<td style="padding:12px 16px"><a href="' . esc_url( get_edit_post_link( $pid ) ) . '" style="color:var(--ch-text);font-weight:500">' . esc_html( get_the_title() ) . '</a></td>';
                        echo '<td style="padding:12px 16px;text-align:center"><span class="ch-badge ' . esc_attr( $badge ) . '">' . esc_html( $status_label ) . '</span></td>';
                        echo '<td style="padding:12px 16px;text-align:center;color:var(--ch-text-muted)">' . esc_html( $likes ) . '</td>';
                        echo '<td style="padding:12px 16px;text-align:right"><a href="' . esc_url( get_edit_post_link( $pid ) ) . '" class="ch-btn ch-btn--ghost ch-btn--sm">' . esc_html__( 'Editar', 'creator-hub' ) . '</a></td>';
                        echo '</tr>';
                    }
                    wp_reset_postdata();
                    echo '</tbody></table></div>';
                else :
                    echo '<p class="ch-text-muted">' . esc_html__( 'Nenhuma publicação encontrada.', 'creator-hub' ) . '</p>';
                endif;
                break;

            /* --- PROFILE SETTINGS --- */
            case 'profile':
            ?>
                <h2 style="margin-bottom:24px"><?php esc_html_e( 'Configurações do Perfil', 'creator-hub' ); ?></h2>
                <div style="background:var(--ch-surface);border:1px solid var(--ch-border);border-radius:16px;padding:32px;max-width:600px">
                    <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
                        <?php wp_nonce_field( 'ch_update_profile', 'ch_profile_nonce' ); ?>
                        <input type="hidden" name="action" value="ch_update_profile">

                        <div class="ch-form-group">
                            <label class="ch-form-label"><?php esc_html_e( 'Nome de Exibição', 'creator-hub' ); ?></label>
                            <input type="text" name="display_name" class="ch-form-input" value="<?php echo esc_attr( $user->display_name ); ?>">
                        </div>

                        <div class="ch-form-group">
                            <label class="ch-form-label"><?php esc_html_e( 'E-mail', 'creator-hub' ); ?></label>
                            <input type="email" name="user_email" class="ch-form-input" value="<?php echo esc_attr( $user->user_email ); ?>">
                        </div>

                        <div class="ch-form-group">
                            <label class="ch-form-label"><?php esc_html_e( 'Bio', 'creator-hub' ); ?></label>
                            <textarea name="description" class="ch-form-textarea" rows="4"><?php echo esc_textarea( get_user_meta( $user_id, 'description', true ) ); ?></textarea>
                        </div>

                        <div class="ch-form-group">
                            <label class="ch-form-label"><?php esc_html_e( 'Nova Senha', 'creator-hub' ); ?></label>
                            <input type="password" name="pass1" class="ch-form-input" autocomplete="new-password">
                        </div>

                        <button type="submit" class="ch-btn ch-btn--primary">
                            <?php esc_html_e( 'Salvar Alterações', 'creator-hub' ); ?>
                        </button>
                    </form>
                </div>
                <?php
                break;
        }
        ?>
    </div>
</div>

<?php get_footer(); ?>
