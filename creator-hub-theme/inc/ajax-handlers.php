<?php
/**
 * CreatorHub - AJAX Handlers & Admin Post Actions
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

/* =========================================================
   HELPERS
   ========================================================= */
function ch_ajax_verify_nonce(): bool {
    $nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
    return (bool) wp_verify_nonce( $nonce, 'ch_nonce' );
}

function ch_ajax_error( string $message, int $code = 400 ): void {
    wp_send_json_error( [ 'message' => $message ], $code );
}

/* =========================================================
   TOGGLE FOLLOW
   ========================================================= */
function ch_ajax_toggle_follow(): void {
    if ( ! ch_ajax_verify_nonce() )           ch_ajax_error( __( 'Nonce inválido.', 'creator-hub' ), 403 );
    if ( ! is_user_logged_in() )              ch_ajax_error( __( 'Faça login para continuar.', 'creator-hub' ), 401 );

    $creator_id = isset( $_POST['creator_id'] ) ? absint( $_POST['creator_id'] ) : 0;
    $follow     = isset( $_POST['follow'] ) ? (int) $_POST['follow'] : 0;
    $user_id    = get_current_user_id();

    if ( ! $creator_id ) ch_ajax_error( __( 'Criador inválido.', 'creator-hub' ) );

    $following = get_user_meta( $user_id, 'ch_following', true );
    $following = is_array( $following ) ? $following : [];

    if ( $follow ) {
        if ( ! in_array( $creator_id, $following, true ) ) {
            $following[] = $creator_id;
            $count = (int) get_post_meta( $creator_id, 'ch_follower_count', true );
            update_post_meta( $creator_id, 'ch_follower_count', $count + 1 );
        }
    } else {
        $following = array_diff( $following, [ $creator_id ] );
        $count = (int) get_post_meta( $creator_id, 'ch_follower_count', true );
        update_post_meta( $creator_id, 'ch_follower_count', max( 0, $count - 1 ) );
    }

    update_user_meta( $user_id, 'ch_following', array_values( $following ) );

    wp_send_json_success( [
        'following'      => (bool) $follow,
        'follower_count' => ch_format_count( (int) get_post_meta( $creator_id, 'ch_follower_count', true ) ),
    ] );
}
add_action( 'wp_ajax_ch_toggle_follow', 'ch_ajax_toggle_follow' );

/* =========================================================
   TOGGLE LIKE
   ========================================================= */
function ch_ajax_toggle_like(): void {
    if ( ! ch_ajax_verify_nonce() )  ch_ajax_error( __( 'Nonce inválido.', 'creator-hub' ), 403 );
    if ( ! is_user_logged_in() )     ch_ajax_error( __( 'Faça login para curtir.', 'creator-hub' ), 401 );

    $post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
    $like    = isset( $_POST['like'] ) ? (int) $_POST['like'] : 0;
    $user_id = get_current_user_id();

    if ( ! $post_id ) ch_ajax_error( __( 'Post inválido.', 'creator-hub' ) );

    $meta_key = 'ch_liked_' . $post_id;
    $count    = (int) get_post_meta( $post_id, 'ch_like_count', true );

    if ( $like && ! get_user_meta( $user_id, $meta_key, true ) ) {
        update_user_meta( $user_id, $meta_key, 1 );
        update_post_meta( $post_id, 'ch_like_count', $count + 1 );
        $count++;
    } elseif ( ! $like ) {
        delete_user_meta( $user_id, $meta_key );
        update_post_meta( $post_id, 'ch_like_count', max( 0, $count - 1 ) );
        $count = max( 0, $count - 1 );
    }

    wp_send_json_success( [ 'liked' => (bool) $like, 'like_count' => $count ] );
}
add_action( 'wp_ajax_ch_toggle_like', 'ch_ajax_toggle_like' );

/* =========================================================
   LOAD MORE POSTS
   ========================================================= */
function ch_ajax_load_more_posts(): void {
    if ( ! ch_ajax_verify_nonce() ) ch_ajax_error( __( 'Nonce inválido.', 'creator-hub' ), 403 );

    $page       = isset( $_POST['page'] ) ? absint( $_POST['page'] ) : 1;
    $query_vars = isset( $_POST['query_vars'] ) ? json_decode( stripslashes( sanitize_text_field( wp_unslash( $_POST['query_vars'] ) ) ), true ) : [];

    if ( ! is_array( $query_vars ) ) $query_vars = [];

    $allowed    = [ 'post_type', 'posts_per_page', 'tax_query', 'meta_query', 'author', 'orderby', 'order' ];
    $query_vars = array_intersect_key( $query_vars, array_flip( $allowed ) );

    $query = new WP_Query( array_merge( $query_vars, [
        'paged'          => $page,
        'posts_per_page' => 10,
        'post_status'    => 'publish',
    ] ) );

    ob_start();
    if ( $query->have_posts() ) {
        while ( $query->have_posts() ) {
            $query->the_post();
            ch_render_post_card( get_the_ID() );
        }
        wp_reset_postdata();
    }

    wp_send_json_success( [
        'html'     => ob_get_clean(),
        'has_more' => $query->max_num_pages > $page,
    ] );
}
add_action( 'wp_ajax_ch_load_more_posts',        'ch_ajax_load_more_posts' );
add_action( 'wp_ajax_nopriv_ch_load_more_posts', 'ch_ajax_load_more_posts' );

/* =========================================================
   SAVE POST (bookmark)
   ========================================================= */
function ch_ajax_save_post(): void {
    if ( ! ch_ajax_verify_nonce() )  ch_ajax_error( __( 'Nonce inválido.', 'creator-hub' ), 403 );
    if ( ! is_user_logged_in() )     ch_ajax_error( __( 'Faça login para salvar.', 'creator-hub' ), 401 );

    $post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
    $save    = isset( $_POST['save'] ) ? (int) $_POST['save'] : 0;
    $user_id = get_current_user_id();

    $saved   = get_user_meta( $user_id, 'ch_saved_posts', true );
    $saved   = is_array( $saved ) ? $saved : [];

    if ( $save ) {
        $saved   = array_unique( array_merge( $saved, [ $post_id ] ) );
    } else {
        $saved = array_diff( $saved, [ $post_id ] );
    }

    update_user_meta( $user_id, 'ch_saved_posts', array_values( $saved ) );
    wp_send_json_success( [ 'saved' => (bool) $save ] );
}
add_action( 'wp_ajax_ch_save_post', 'ch_ajax_save_post' );

/* =========================================================
   SEARCH CREATORS (live search)
   ========================================================= */
function ch_ajax_search_creators(): void {
    if ( ! ch_ajax_verify_nonce() ) ch_ajax_error( __( 'Nonce inválido.', 'creator-hub' ), 403 );

    $term = isset( $_POST['term'] ) ? sanitize_text_field( wp_unslash( $_POST['term'] ) ) : '';
    if ( strlen( $term ) < 2 ) wp_send_json_success( [] );

    $query = new WP_Query( [
        'post_type'      => 'ch_creator',
        'post_status'    => 'publish',
        'posts_per_page' => 5,
        's'              => $term,
    ] );

    $results = [];
    if ( $query->have_posts() ) {
        while ( $query->have_posts() ) {
            $query->the_post();
            $results[] = [
                'id'     => get_the_ID(),
                'title'  => get_the_title(),
                'url'    => get_permalink(),
                'avatar' => ch_get_creator_avatar_url( get_the_ID() ),
            ];
        }
        wp_reset_postdata();
    }

    wp_send_json_success( $results );
}
add_action( 'wp_ajax_ch_search_creators',        'ch_ajax_search_creators' );
add_action( 'wp_ajax_nopriv_ch_search_creators', 'ch_ajax_search_creators' );

/* =========================================================
   UPDATE USER PROFILE (front-end form)
   ========================================================= */
function ch_handle_update_profile(): void {
    if ( ! is_user_logged_in() ) {
        wp_redirect( wp_login_url() );
        exit;
    }

    $nonce = isset( $_POST['ch_profile_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['ch_profile_nonce'] ) ) : '';
    if ( ! wp_verify_nonce( $nonce, 'ch_update_profile' ) ) {
        wp_die( esc_html__( 'Ação inválida.', 'creator-hub' ) );
    }

    $user_id  = get_current_user_id();
    $userdata = [ 'ID' => $user_id ];

    if ( ! empty( $_POST['display_name'] ) ) {
        $userdata['display_name'] = sanitize_text_field( wp_unslash( $_POST['display_name'] ) );
    }

    if ( ! empty( $_POST['user_email'] ) && is_email( $_POST['user_email'] ) ) {
        $userdata['user_email'] = sanitize_email( wp_unslash( $_POST['user_email'] ) );
    }

    if ( ! empty( $_POST['pass1'] ) ) {
        $userdata['user_pass'] = wp_unslash( $_POST['pass1'] );
    }

    $updated = wp_update_user( $userdata );

    if ( ! is_wp_error( $updated ) && ! empty( $_POST['description'] ) ) {
        update_user_meta( $user_id, 'description', sanitize_textarea_field( wp_unslash( $_POST['description'] ) ) );
    }

    $redirect = add_query_arg( [
        'tab'     => 'profile',
        'updated' => is_wp_error( $updated ) ? '0' : '1',
    ], get_permalink() );

    wp_redirect( $redirect );
    exit;
}
add_action( 'admin_post_ch_update_profile', 'ch_handle_update_profile' );
