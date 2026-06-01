<?php
/**
 * CreatorHub - Sidebar
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

if ( ! is_active_sidebar( 'ch-profile-sidebar' ) ) return;
?>

<aside class="ch-sidebar" role="complementary" aria-label="<?php esc_attr_e( 'Sidebar', 'creator-hub' ); ?>">
    <?php dynamic_sidebar( 'ch-profile-sidebar' ); ?>
</aside>
