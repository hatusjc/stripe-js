<?php
/**
 * CreatorHub - Helper Functions
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

/* =========================================================
   NUMBER FORMATTING
   ========================================================= */
function ch_format_count( int $n ): string {
    if ( $n >= 1_000_000 ) {
        return number_format( $n / 1_000_000, 1 ) . 'M';
    }
    if ( $n >= 1_000 ) {
        return number_format( $n / 1_000, 1 ) . 'K';
    }
    return (string) $n;
}

function ch_format_price( float $price, string $currency = 'R$' ): string {
    return $currency . ' ' . number_format( $price, 2, ',', '.' );
}

/* =========================================================
   COLOR HELPERS
   ========================================================= */
function ch_hex_to_rgb( string $hex ): array {
    $hex = ltrim( $hex, '#' );
    if ( strlen( $hex ) === 3 ) {
        $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
    }
    return [
        'r' => hexdec( substr( $hex, 0, 2 ) ),
        'g' => hexdec( substr( $hex, 2, 2 ) ),
        'b' => hexdec( substr( $hex, 4, 2 ) ),
    ];
}

function ch_darken_color( string $hex, int $percent ): string {
    $rgb = ch_hex_to_rgb( $hex );
    $factor = 1 - ( $percent / 100 );
    $r = max( 0, (int) round( $rgb['r'] * $factor ) );
    $g = max( 0, (int) round( $rgb['g'] * $factor ) );
    $b = max( 0, (int) round( $rgb['b'] * $factor ) );
    return sprintf( '#%02x%02x%02x', $r, $g, $b );
}

function ch_lighten_color( string $hex, int $percent ): string {
    $rgb = ch_hex_to_rgb( $hex );
    $factor = $percent / 100;
    $r = min( 255, (int) round( $rgb['r'] + ( 255 - $rgb['r'] ) * $factor ) );
    $g = min( 255, (int) round( $rgb['g'] + ( 255 - $rgb['g'] ) * $factor ) );
    $b = min( 255, (int) round( $rgb['b'] + ( 255 - $rgb['b'] ) * $factor ) );
    return sprintf( '#%02x%02x%02x', $r, $g, $b );
}

/* =========================================================
   CREATOR HELPERS
   ========================================================= */
function ch_get_creator_meta( int $creator_id, string $key, $default = '' ) {
    $val = get_post_meta( $creator_id, $key, true );
    return $val !== '' ? $val : $default;
}

function ch_get_creator_follower_count( int $creator_id ): int {
    return (int) get_post_meta( $creator_id, 'ch_follower_count', true );
}

function ch_get_creator_subscriber_count( int $creator_id ): int {
    return (int) get_post_meta( $creator_id, 'ch_subscriber_count', true );
}

function ch_is_current_user_following( int $creator_id ): bool {
    if ( ! is_user_logged_in() ) return false;
    $following = get_user_meta( get_current_user_id(), 'ch_following', true );
    return is_array( $following ) && in_array( $creator_id, $following, true );
}

function ch_is_current_user_subscribed( int $creator_id ): bool {
    if ( ! is_user_logged_in() ) return false;

    // Hook into membership plugins if available
    if ( function_exists( 'pmpro_hasMembershipLevel' ) ) {
        $level_id = get_post_meta( $creator_id, 'ch_pmpro_level_id', true );
        if ( $level_id ) {
            return pmpro_hasMembershipLevel( (int) $level_id );
        }
    }

    if ( function_exists( 'wcs_user_has_subscription' ) ) {
        $product_id = get_post_meta( $creator_id, 'ch_wcs_product_id', true );
        if ( $product_id ) {
            return wcs_user_has_subscription( get_current_user_id(), $product_id, 'active' );
        }
    }

    // Fallback: check custom meta
    $subscribed = get_user_meta( get_current_user_id(), 'ch_subscriptions', true );
    return is_array( $subscribed ) && in_array( $creator_id, $subscribed, true );
}

function ch_get_creator_profile_url( int $creator_id ): string {
    return get_permalink( $creator_id );
}

function ch_get_creator_cover_url( int $creator_id ): string {
    $cover_id = get_post_meta( $creator_id, 'ch_cover_image', true );
    if ( $cover_id ) {
        $img = wp_get_attachment_image_url( (int) $cover_id, 'ch-creator-cover' );
        if ( $img ) return $img;
    }
    // Fallback to featured image
    $thumb = get_the_post_thumbnail_url( $creator_id, 'ch-creator-cover' );
    return $thumb ?: CH_ASSETS . '/images/default-cover.jpg';
}

function ch_get_creator_avatar_url( int $creator_id ): string {
    $avatar_id = get_post_meta( $creator_id, 'ch_avatar_image', true );
    if ( $avatar_id ) {
        $img = wp_get_attachment_image_url( (int) $avatar_id, 'ch-creator-avatar' );
        if ( $img ) return $img;
    }
    // Fallback to post author avatar
    $author_id = get_post_field( 'post_author', $creator_id );
    return get_avatar_url( $author_id, [ 'size' => 150 ] );
}

/* =========================================================
   POST HELPERS
   ========================================================= */
function ch_is_exclusive_content( int $post_id ): bool {
    return get_post_meta( $post_id, 'ch_is_exclusive', true ) === '1';
}

function ch_current_user_can_view( int $post_id ): bool {
    if ( ! ch_is_exclusive_content( $post_id ) ) return true;
    if ( ! is_user_logged_in() ) return false;
    if ( current_user_can( 'administrator' ) ) return true;

    $creator_id = get_post_meta( $post_id, 'ch_creator_id', true );
    if ( ! $creator_id ) return false;

    return ch_is_current_user_subscribed( (int) $creator_id );
}

/* =========================================================
   MEDIA HELPERS
   ========================================================= */
function ch_get_post_media( int $post_id ): array {
    $gallery_ids = get_post_meta( $post_id, 'ch_gallery_images', true );
    $video_url   = get_post_meta( $post_id, 'ch_video_url', true );
    $audio_url   = get_post_meta( $post_id, 'ch_audio_url', true );

    return [
        'images' => is_array( $gallery_ids ) ? $gallery_ids : [],
        'video'  => $video_url,
        'audio'  => $audio_url,
    ];
}

/* =========================================================
   SVG ICONS
   ========================================================= */
function ch_icon( string $name, int $size = 20, string $class = '' ): string {
    $icons = [
        'lock'       => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
        'heart'      => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
        'comment'    => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
        'share'      => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
        'bookmark'   => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>',
        'check'      => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" class="{c}"><polyline points="20 6 9 17 4 12"/></svg>',
        'verified'   => '<svg width="{s}" height="{s}" fill="currentColor" viewBox="0 0 24 24" class="{c}"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
        'users'      => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
        'star'       => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'search'     => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
        'sun'        => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        'moon'       => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
        'menu'       => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
        'x'          => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        'arrow-up'   => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
        'arrow-right'=> '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
        'play'       => '<svg width="{s}" height="{s}" fill="currentColor" viewBox="0 0 24 24" class="{c}"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
        'image'      => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
        'music'      => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
        'download'   => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        'chart'      => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        'settings'   => '<svg width="{s}" height="{s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="{c}"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    ];

    if ( ! isset( $icons[ $name ] ) ) return '';

    return str_replace(
        [ '{s}', '{c}' ],
        [ esc_attr( (string) $size ), esc_attr( $class ) ],
        $icons[ $name ]
    );
}
