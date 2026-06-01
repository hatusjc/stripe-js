<?php
/**
 * CreatorHub - 404 Template
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<section class="ch-section" style="min-height:70vh;display:flex;align-items:center">
    <div class="ch-container" style="text-align:center">
        <div style="font-size:8rem;font-weight:800;background:var(--ch-gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;margin-bottom:16px">404</div>
        <h1 style="font-size:2rem;margin-bottom:12px"><?php esc_html_e( 'Página não encontrada', 'creator-hub' ); ?></h1>
        <p style="color:var(--ch-text-muted);font-size:1.125rem;max-width:400px;margin:0 auto 32px">
            <?php esc_html_e( 'A página que você está procurando não existe ou foi movida.', 'creator-hub' ); ?>
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="ch-btn ch-btn--primary">
                <?php esc_html_e( 'Ir para o Início', 'creator-hub' ); ?>
            </a>
            <a href="<?php echo esc_url( home_url( '/criadores' ) ); ?>" class="ch-btn ch-btn--ghost">
                <?php esc_html_e( 'Ver Criadores', 'creator-hub' ); ?>
            </a>
        </div>
    </div>
</section>

<?php get_footer(); ?>
