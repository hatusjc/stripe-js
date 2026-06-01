<?php
/**
 * CreatorHub - WooCommerce Integration
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WooCommerce' ) ) return;

/* =========================================================
   REMOVE DEFAULT WC WRAPPERS (use theme wrappers)
   ========================================================= */
remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
remove_action( 'woocommerce_after_main_content',  'woocommerce_output_content_wrapper_end', 10 );

add_action( 'woocommerce_before_main_content', function () {
    echo '<main class="ch-container ch-wc-main"><div class="ch-wc-content">';
} );

add_action( 'woocommerce_after_main_content', function () {
    echo '</div></main>';
} );

/* =========================================================
   BREADCRUMBS
   ========================================================= */
add_filter( 'woocommerce_breadcrumb_defaults', function ( $args ) {
    return array_merge( $args, [
        'delimiter'   => ' &rsaquo; ',
        'wrap_before' => '<nav class="ch-breadcrumbs" aria-label="' . esc_attr__( 'Você está aqui', 'creator-hub' ) . '"><ol>',
        'wrap_after'  => '</ol></nav>',
        'before'      => '<li>',
        'after'       => '</li>',
    ] );
} );

/* =========================================================
   PRODUCT COLUMNS
   ========================================================= */
add_filter( 'loop_shop_columns', function () { return 3; } );
add_filter( 'loop_shop_per_page', function () { return 12; }, 20 );

/* =========================================================
   CUSTOM PRODUCT TAB: Subscription Info
   ========================================================= */
add_filter( 'woocommerce_product_tabs', function ( $tabs ) {
    $tabs['ch_subscription_info'] = [
        'title'    => __( 'Informações de Assinatura', 'creator-hub' ),
        'priority' => 50,
        'callback' => 'ch_wc_subscription_tab_content',
    ];
    return $tabs;
} );

function ch_wc_subscription_tab_content(): void {
    ?>
    <div class="ch-wc-subscription-info">
        <h2><?php esc_html_e( 'O que está incluso na assinatura', 'creator-hub' ); ?></h2>
        <ul>
            <li><?php esc_html_e( 'Acesso imediato a todo conteúdo exclusivo', 'creator-hub' ); ?></li>
            <li><?php esc_html_e( 'Novos conteúdos publicados regularmente', 'creator-hub' ); ?></li>
            <li><?php esc_html_e( 'Comunicação direta com o criador', 'creator-hub' ); ?></li>
            <li><?php esc_html_e( 'Acesso à comunidade de assinantes', 'creator-hub' ); ?></li>
            <li><?php esc_html_e( 'Cancele a qualquer momento', 'creator-hub' ); ?></li>
        </ul>
        <p class="ch-text-muted">
            <?php esc_html_e( 'Ao assinar, você concorda com os Termos de Serviço e a Política de Privacidade.', 'creator-hub' ); ?>
        </p>
    </div>
    <?php
}

/* =========================================================
   PAYMENT GATEWAY HOOKS (Extensível)
   ========================================================= */

/**
 * Fires after a WooCommerce subscription is created.
 * Other plugins can hook into this to grant membership access.
 */
add_action( 'woocommerce_checkout_order_created', function ( $order ) {
    do_action( 'ch_subscription_created', $order );
} );

/**
 * Hook for granting creator subscription access after payment.
 */
add_action( 'woocommerce_payment_complete', function ( $order_id ) {
    $order = wc_get_order( $order_id );
    if ( ! $order ) return;

    $user_id = $order->get_customer_id();
    if ( ! $user_id ) return;

    foreach ( $order->get_items() as $item ) {
        $product_id = $item->get_product_id();

        // Check if this product is linked to a creator
        $creator_id = get_post_meta( $product_id, 'ch_linked_creator_id', true );
        if ( ! $creator_id ) continue;

        // Grant subscription
        $subscriptions = get_user_meta( $user_id, 'ch_subscriptions', true );
        $subscriptions = is_array( $subscriptions ) ? $subscriptions : [];
        $subscriptions[] = (int) $creator_id;
        $subscriptions   = array_unique( $subscriptions );
        update_user_meta( $user_id, 'ch_subscriptions', $subscriptions );

        // Update subscriber count
        $count = (int) get_post_meta( $creator_id, 'ch_subscriber_count', true );
        update_post_meta( $creator_id, 'ch_subscriber_count', $count + 1 );

        do_action( 'ch_user_subscribed', $user_id, $creator_id, $order_id );
    }
} );

/* =========================================================
   MINI CART WIDGET SUPPORT
   ========================================================= */
function ch_wc_cart_contents_count(): int {
    return WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
}

/* =========================================================
   CHECKOUT CUSTOMIZATION
   ========================================================= */
add_filter( 'woocommerce_checkout_fields', function ( $fields ) {
    // Remove unnecessary fields for digital subscriptions
    unset( $fields['billing']['billing_company'] );
    unset( $fields['billing']['billing_address_2'] );
    unset( $fields['billing']['billing_state'] );
    return $fields;
} );
