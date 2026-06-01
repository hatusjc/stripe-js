<?php
/**
 * CreatorHub - Widgets
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

/* =========================================================
   REGISTER WIDGET AREAS
   ========================================================= */
function ch_register_widget_areas() {
    $areas = [
        [
            'name'          => __( 'Sidebar do Perfil', 'creator-hub' ),
            'id'            => 'ch-profile-sidebar',
            'description'   => __( 'Sidebar exibida no perfil do criador.', 'creator-hub' ),
        ],
        [
            'name'          => __( 'Footer - Coluna 1', 'creator-hub' ),
            'id'            => 'ch-footer-1',
            'description'   => __( 'Primeira coluna do rodapé.', 'creator-hub' ),
        ],
        [
            'name'          => __( 'Footer - Coluna 2', 'creator-hub' ),
            'id'            => 'ch-footer-2',
            'description'   => __( 'Segunda coluna do rodapé.', 'creator-hub' ),
        ],
        [
            'name'          => __( 'Footer - Coluna 3', 'creator-hub' ),
            'id'            => 'ch-footer-3',
            'description'   => __( 'Terceira coluna do rodapé.', 'creator-hub' ),
        ],
        [
            'name'          => __( 'Dashboard Sidebar', 'creator-hub' ),
            'id'            => 'ch-dashboard-sidebar',
            'description'   => __( 'Área de widgets no dashboard.', 'creator-hub' ),
        ],
    ];

    foreach ( $areas as $area ) {
        register_sidebar( array_merge( $area, [
            'before_widget' => '<div id="%1$s" class="ch-widget %2$s">',
            'after_widget'  => '</div>',
            'before_title'  => '<h3 class="ch-widget__title">',
            'after_title'   => '</h3>',
        ] ) );
    }
}
add_action( 'widgets_init', 'ch_register_widget_areas' );

/* =========================================================
   WIDGET: FEATURED CREATORS
   ========================================================= */
class CH_Featured_Creators_Widget extends WP_Widget {

    public function __construct() {
        parent::__construct(
            'ch_featured_creators',
            __( 'CreatorHub: Criadores em Destaque', 'creator-hub' ),
            [ 'description' => __( 'Exibe uma lista de criadores em destaque.', 'creator-hub' ) ]
        );
    }

    public function widget( $args, $instance ) {
        $title = ! empty( $instance['title'] ) ? $instance['title'] : __( 'Criadores em Destaque', 'creator-hub' );
        $count = ! empty( $instance['count'] ) ? absint( $instance['count'] ) : 5;

        echo $args['before_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

        if ( $title ) {
            echo $args['before_title'] . esc_html( $title ) . $args['after_title']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        }

        $query = new WP_Query( [
            'post_type'      => 'ch_creator',
            'post_status'    => 'publish',
            'posts_per_page' => $count,
            'meta_key'       => 'ch_featured',
            'meta_value'     => '1',
            'orderby'        => 'meta_value_num',
            'meta_key'       => 'ch_subscriber_count', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
            'order'          => 'DESC',
        ] );

        if ( $query->have_posts() ) {
            echo '<ul class="ch-widget-creators">';
            while ( $query->have_posts() ) {
                $query->the_post();
                $creator_id = get_the_ID();
                ?>
                <li class="ch-widget-creator">
                    <a href="<?php echo esc_url( get_permalink() ); ?>" class="ch-widget-creator__link">
                        <img src="<?php echo esc_url( ch_get_creator_avatar_url( $creator_id ) ); ?>" alt="<?php the_title_attribute(); ?>" width="40" height="40" loading="lazy">
                        <div>
                            <strong><?php the_title(); ?></strong>
                            <span><?php echo esc_html( ch_format_count( ch_get_creator_subscriber_count( $creator_id ) ) . ' ' . __( 'assinantes', 'creator-hub' ) ); ?></span>
                        </div>
                    </a>
                </li>
                <?php
            }
            echo '</ul>';
            wp_reset_postdata();
        }

        echo $args['after_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }

    public function form( $instance ) {
        $title = ! empty( $instance['title'] ) ? $instance['title'] : '';
        $count = ! empty( $instance['count'] ) ? absint( $instance['count'] ) : 5;
        ?>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Título:', 'creator-hub' ); ?></label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'count' ) ); ?>"><?php esc_html_e( 'Quantidade:', 'creator-hub' ); ?></label>
            <input class="tiny-text" id="<?php echo esc_attr( $this->get_field_id( 'count' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'count' ) ); ?>" type="number" step="1" min="1" value="<?php echo esc_attr( $count ); ?>" size="3">
        </p>
        <?php
    }

    public function update( $new_instance, $old_instance ) {
        return [
            'title' => sanitize_text_field( $new_instance['title'] ),
            'count' => absint( $new_instance['count'] ),
        ];
    }
}

/* =========================================================
   REGISTER CUSTOM WIDGETS
   ========================================================= */
function ch_register_widgets() {
    register_widget( 'CH_Featured_Creators_Widget' );
}
add_action( 'widgets_init', 'ch_register_widgets' );
