<?php
/**
 * CreatorHub - Comments Template
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

if ( post_password_required() ) return;
?>

<div id="comments" class="ch-comments">

    <?php if ( have_comments() ) : ?>
        <h3 class="ch-comments__title" style="margin-bottom:24px">
            <?php
            printf(
                esc_html( _n( '%s Comentário', '%s Comentários', get_comments_number(), 'creator-hub' ) ),
                '<span>' . esc_html( number_format_i18n( get_comments_number() ) ) . '</span>'
            );
            ?>
        </h3>

        <ol class="ch-comment-list" style="list-style:none;display:flex;flex-direction:column;gap:16px">
            <?php
            wp_list_comments( [
                'style'      => 'ol',
                'callback'   => 'ch_comment_callback',
                'short_ping' => true,
            ] );
            ?>
        </ol>

        <?php the_comments_pagination( [ 'prev_text' => '← ' . __( 'Anterior', 'creator-hub' ), 'next_text' => __( 'Próximo', 'creator-hub' ) . ' →' ] ); ?>

    <?php endif; ?>

    <?php if ( ! comments_open() ) : ?>
        <p class="ch-text-muted" style="text-align:center;padding:24px 0"><?php esc_html_e( 'Os comentários estão fechados.', 'creator-hub' ); ?></p>
    <?php else : ?>

        <?php
        comment_form( [
            'title_reply'         => __( 'Deixe um comentário', 'creator-hub' ),
            'title_reply_to'      => __( 'Responder a %s', 'creator-hub' ),
            'cancel_reply_link'   => __( 'Cancelar resposta', 'creator-hub' ),
            'label_submit'        => __( 'Enviar Comentário', 'creator-hub' ),
            'comment_field'       => '<div class="ch-form-group"><label class="ch-form-label" for="comment">' . __( 'Comentário', 'creator-hub' ) . '</label><textarea id="comment" name="comment" class="ch-form-textarea" rows="5" required></textarea></div>',
            'class_submit'        => 'ch-btn ch-btn--primary',
            'class_form'          => 'ch-comment-form',
        ] );
        ?>

    <?php endif; ?>

</div>

<?php
function ch_comment_callback( $comment, $args, $depth ) {
    $tag = ( 'div' === $args['style'] ) ? 'div' : 'li';
    ?>
    <<?php echo esc_html( $tag ); ?> id="comment-<?php comment_ID(); ?>" <?php comment_class( 'ch-comment', $comment ); ?> style="background:var(--ch-surface);border:1px solid var(--ch-border);border-radius:12px;padding:20px">
        <div style="display:flex;gap:12px">
            <div style="flex-shrink:0">
                <?php echo get_avatar( $comment, 40, '', '', [ 'class' => 'ch-comment__avatar', 'style' => 'border-radius:50%' ] ); ?>
            </div>
            <div style="flex:1">
                <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px">
                    <strong style="font-size:.875rem"><?php comment_author(); ?></strong>
                    <time style="font-size:.75rem;color:var(--ch-text-muted)" datetime="<?php comment_time( 'c' ); ?>">
                        <?php comment_date(); ?> <?php comment_time(); ?>
                    </time>
                </div>
                <?php comment_text(); ?>
                <div style="margin-top:8px">
                    <?php comment_reply_link( array_merge( $args, [ 'depth' => $depth, 'max_depth' => $args['max_depth'] ] ) ); ?>
                </div>
            </div>
        </div>
    </<?php echo esc_html( $tag ); ?>>
    <?php
}
