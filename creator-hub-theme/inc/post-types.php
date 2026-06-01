<?php
/**
 * CreatorHub - Custom Post Types
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

/* =========================================================
   CREATOR (Perfil do Criador)
   ========================================================= */
function ch_register_cpt_creator() {
    $labels = [
        'name'               => _x( 'Criadores', 'post type general name', 'creator-hub' ),
        'singular_name'      => _x( 'Criador', 'post type singular name', 'creator-hub' ),
        'menu_name'          => _x( 'Criadores', 'admin menu', 'creator-hub' ),
        'name_admin_bar'     => _x( 'Criador', 'add new on admin bar', 'creator-hub' ),
        'add_new'            => _x( 'Adicionar Novo', 'criador', 'creator-hub' ),
        'add_new_item'       => __( 'Adicionar Novo Criador', 'creator-hub' ),
        'new_item'           => __( 'Novo Criador', 'creator-hub' ),
        'edit_item'          => __( 'Editar Criador', 'creator-hub' ),
        'view_item'          => __( 'Ver Criador', 'creator-hub' ),
        'all_items'          => __( 'Todos os Criadores', 'creator-hub' ),
        'search_items'       => __( 'Buscar Criadores', 'creator-hub' ),
        'not_found'          => __( 'Nenhum criador encontrado.', 'creator-hub' ),
        'not_found_in_trash' => __( 'Nenhum criador na lixeira.', 'creator-hub' ),
    ];

    register_post_type( 'ch_creator', [
        'labels'             => $labels,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => [ 'slug' => 'criador', 'with_front' => false ],
        'capability_type'    => 'post',
        'has_archive'        => 'criadores',
        'hierarchical'       => false,
        'menu_position'      => 5,
        'menu_icon'          => 'dashicons-groups',
        'supports'           => [ 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'author' ],
        'show_in_rest'       => true,
        'rest_base'          => 'creators',
        'template'           => [
            [ 'ch/creator-profile-header' ],
            [ 'ch/creator-feed' ],
        ],
    ] );
}
add_action( 'init', 'ch_register_cpt_creator' );

/* =========================================================
   CREATOR POST (Publicação do Criador)
   ========================================================= */
function ch_register_cpt_creator_post() {
    $labels = [
        'name'               => _x( 'Publicações', 'post type general name', 'creator-hub' ),
        'singular_name'      => _x( 'Publicação', 'post type singular name', 'creator-hub' ),
        'menu_name'          => _x( 'Publicações', 'admin menu', 'creator-hub' ),
        'add_new'            => _x( 'Nova Publicação', 'publicação', 'creator-hub' ),
        'add_new_item'       => __( 'Nova Publicação', 'creator-hub' ),
        'edit_item'          => __( 'Editar Publicação', 'creator-hub' ),
        'view_item'          => __( 'Ver Publicação', 'creator-hub' ),
        'all_items'          => __( 'Todas as Publicações', 'creator-hub' ),
        'search_items'       => __( 'Buscar Publicações', 'creator-hub' ),
        'not_found'          => __( 'Nenhuma publicação encontrada.', 'creator-hub' ),
    ];

    register_post_type( 'ch_post', [
        'labels'             => $labels,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => [ 'slug' => 'publicacao', 'with_front' => false ],
        'capability_type'    => 'post',
        'has_archive'        => false,
        'hierarchical'       => false,
        'menu_position'      => 6,
        'menu_icon'          => 'dashicons-media-text',
        'supports'           => [ 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'comments', 'author' ],
        'show_in_rest'       => true,
        'rest_base'          => 'creator-posts',
        'taxonomies'         => [ 'ch_content_type' ],
    ] );
}
add_action( 'init', 'ch_register_cpt_creator_post' );

/* =========================================================
   SUBSCRIPTION PLAN
   ========================================================= */
function ch_register_cpt_plan() {
    $labels = [
        'name'          => _x( 'Planos de Assinatura', 'post type general name', 'creator-hub' ),
        'singular_name' => _x( 'Plano', 'post type singular name', 'creator-hub' ),
        'menu_name'     => _x( 'Planos', 'admin menu', 'creator-hub' ),
        'add_new'       => __( 'Novo Plano', 'creator-hub' ),
        'edit_item'     => __( 'Editar Plano', 'creator-hub' ),
        'all_items'     => __( 'Todos os Planos', 'creator-hub' ),
    ];

    register_post_type( 'ch_plan', [
        'labels'          => $labels,
        'public'          => false,
        'show_ui'         => true,
        'show_in_menu'    => true,
        'capability_type' => 'post',
        'hierarchical'    => false,
        'menu_icon'       => 'dashicons-star-filled',
        'supports'        => [ 'title', 'editor', 'custom-fields', 'author' ],
        'show_in_rest'    => true,
        'rest_base'       => 'plans',
    ] );
}
add_action( 'init', 'ch_register_cpt_plan' );

/* =========================================================
   FLUSH REWRITE RULES ON ACTIVATION
   ========================================================= */
function ch_flush_rewrite_rules() {
    ch_register_cpt_creator();
    ch_register_cpt_creator_post();
    ch_register_cpt_plan();
    flush_rewrite_rules();
}
register_activation_hook( CH_DIR . '/functions.php', 'ch_flush_rewrite_rules' );

/* =========================================================
   CREATOR POST META BOXES
   ========================================================= */
function ch_creator_meta_boxes() {
    // Creator Profile Meta
    add_meta_box(
        'ch_creator_profile',
        __( 'Informações do Criador', 'creator-hub' ),
        'ch_creator_profile_meta_cb',
        'ch_creator',
        'normal',
        'high'
    );

    // Creator Post Meta
    add_meta_box(
        'ch_post_settings',
        __( 'Configurações da Publicação', 'creator-hub' ),
        'ch_post_settings_meta_cb',
        'ch_post',
        'side',
        'default'
    );

    // Plan Meta
    add_meta_box(
        'ch_plan_settings',
        __( 'Configurações do Plano', 'creator-hub' ),
        'ch_plan_settings_meta_cb',
        'ch_plan',
        'normal',
        'high'
    );
}
add_action( 'add_meta_boxes', 'ch_creator_meta_boxes' );

function ch_creator_profile_meta_cb( $post ) {
    wp_nonce_field( 'ch_creator_meta', 'ch_creator_nonce' );
    $meta = [
        'ch_username'         => get_post_meta( $post->ID, 'ch_username', true ),
        'ch_tagline'          => get_post_meta( $post->ID, 'ch_tagline', true ),
        'ch_verified'         => get_post_meta( $post->ID, 'ch_verified', true ),
        'ch_instagram'        => get_post_meta( $post->ID, 'ch_instagram', true ),
        'ch_twitter'          => get_post_meta( $post->ID, 'ch_twitter', true ),
        'ch_youtube'          => get_post_meta( $post->ID, 'ch_youtube', true ),
        'ch_tiktok'           => get_post_meta( $post->ID, 'ch_tiktok', true ),
        'ch_website'          => get_post_meta( $post->ID, 'ch_website', true ),
        'ch_subscription_price' => get_post_meta( $post->ID, 'ch_subscription_price', true ),
        'ch_featured'         => get_post_meta( $post->ID, 'ch_featured', true ),
    ];
    ?>
    <table class="form-table">
        <tr>
            <th><label for="ch_username"><?php esc_html_e( 'Username', 'creator-hub' ); ?></label></th>
            <td><input type="text" name="ch_username" id="ch_username" value="<?php echo esc_attr( $meta['ch_username'] ); ?>" class="regular-text" placeholder="@username"></td>
        </tr>
        <tr>
            <th><label for="ch_tagline"><?php esc_html_e( 'Tagline', 'creator-hub' ); ?></label></th>
            <td><input type="text" name="ch_tagline" id="ch_tagline" value="<?php echo esc_attr( $meta['ch_tagline'] ); ?>" class="regular-text"></td>
        </tr>
        <tr>
            <th><label for="ch_verified"><?php esc_html_e( 'Verificado', 'creator-hub' ); ?></label></th>
            <td><input type="checkbox" name="ch_verified" id="ch_verified" value="1" <?php checked( $meta['ch_verified'], '1' ); ?>> <label for="ch_verified"><?php esc_html_e( 'Conta verificada', 'creator-hub' ); ?></label></td>
        </tr>
        <tr>
            <th><label for="ch_subscription_price"><?php esc_html_e( 'Preço de Assinatura (R$)', 'creator-hub' ); ?></label></th>
            <td><input type="number" name="ch_subscription_price" id="ch_subscription_price" value="<?php echo esc_attr( $meta['ch_subscription_price'] ); ?>" step="0.01" min="0" class="small-text"></td>
        </tr>
        <tr>
            <th><?php esc_html_e( 'Redes Sociais', 'creator-hub' ); ?></th>
            <td>
                <?php foreach ( [ 'ch_instagram' => 'Instagram', 'ch_twitter' => 'Twitter/X', 'ch_youtube' => 'YouTube', 'ch_tiktok' => 'TikTok', 'ch_website' => 'Website' ] as $field => $label ) : ?>
                <p><label><?php echo esc_html( $label ); ?></label><br>
                <input type="url" name="<?php echo esc_attr( $field ); ?>" value="<?php echo esc_url( $meta[ $field ] ); ?>" class="regular-text" placeholder="https://"></p>
                <?php endforeach; ?>
            </td>
        </tr>
        <tr>
            <th><label for="ch_featured"><?php esc_html_e( 'Destaque', 'creator-hub' ); ?></label></th>
            <td><input type="checkbox" name="ch_featured" id="ch_featured" value="1" <?php checked( $meta['ch_featured'], '1' ); ?>> <label for="ch_featured"><?php esc_html_e( 'Mostrar na página inicial', 'creator-hub' ); ?></label></td>
        </tr>
    </table>
    <?php
}

function ch_post_settings_meta_cb( $post ) {
    wp_nonce_field( 'ch_post_meta', 'ch_post_nonce' );
    $is_exclusive = get_post_meta( $post->ID, 'ch_is_exclusive', true );
    $is_pinned    = get_post_meta( $post->ID, 'ch_is_pinned', true );
    $price        = get_post_meta( $post->ID, 'ch_individual_price', true );
    ?>
    <p>
        <label><input type="checkbox" name="ch_is_exclusive" value="1" <?php checked( $is_exclusive, '1' ); ?>>
        <?php esc_html_e( 'Conteúdo exclusivo para assinantes', 'creator-hub' ); ?></label>
    </p>
    <p>
        <label><input type="checkbox" name="ch_is_pinned" value="1" <?php checked( $is_pinned, '1' ); ?>>
        <?php esc_html_e( 'Fixar no topo do perfil', 'creator-hub' ); ?></label>
    </p>
    <p>
        <label for="ch_individual_price"><?php esc_html_e( 'Preço individual (R$)', 'creator-hub' ); ?></label><br>
        <input type="number" id="ch_individual_price" name="ch_individual_price" value="<?php echo esc_attr( $price ); ?>" step="0.01" min="0">
    </p>
    <?php
}

function ch_plan_settings_meta_cb( $post ) {
    wp_nonce_field( 'ch_plan_meta', 'ch_plan_nonce' );
    $fields = [
        'ch_plan_price'    => [ 'label' => __( 'Preço (R$/mês)', 'creator-hub' ),  'type' => 'number' ],
        'ch_plan_duration' => [ 'label' => __( 'Duração (dias)', 'creator-hub' ),  'type' => 'number' ],
        'ch_plan_features' => [ 'label' => __( 'Benefícios (1 por linha)', 'creator-hub' ), 'type' => 'textarea' ],
        'ch_plan_badge'    => [ 'label' => __( 'Label/Badge', 'creator-hub' ),     'type' => 'text' ],
    ];
    ?>
    <table class="form-table">
        <?php foreach ( $fields as $key => $field ) : $val = get_post_meta( $post->ID, $key, true ); ?>
        <tr>
            <th><label for="<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $field['label'] ); ?></label></th>
            <td>
                <?php if ( $field['type'] === 'textarea' ) : ?>
                    <textarea name="<?php echo esc_attr( $key ); ?>" id="<?php echo esc_attr( $key ); ?>" rows="5" class="large-text"><?php echo esc_textarea( $val ); ?></textarea>
                <?php else : ?>
                    <input type="<?php echo esc_attr( $field['type'] ); ?>" name="<?php echo esc_attr( $key ); ?>" id="<?php echo esc_attr( $key ); ?>" value="<?php echo esc_attr( $val ); ?>" class="regular-text">
                <?php endif; ?>
            </td>
        </tr>
        <?php endforeach; ?>
    </table>
    <?php
}

/* =========================================================
   SAVE META
   ========================================================= */
function ch_save_creator_meta( $post_id ) {
    if ( ! isset( $_POST['ch_creator_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['ch_creator_nonce'] ) ), 'ch_creator_meta' ) ) return;
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( ! current_user_can( 'edit_post', $post_id ) ) return;

    $text_fields = [ 'ch_username', 'ch_tagline' ];
    $url_fields  = [ 'ch_instagram', 'ch_twitter', 'ch_youtube', 'ch_tiktok', 'ch_website' ];
    $check_fields = [ 'ch_verified', 'ch_featured' ];

    foreach ( $text_fields as $field ) {
        if ( isset( $_POST[ $field ] ) ) {
            update_post_meta( $post_id, $field, sanitize_text_field( wp_unslash( $_POST[ $field ] ) ) );
        }
    }

    foreach ( $url_fields as $field ) {
        if ( isset( $_POST[ $field ] ) ) {
            update_post_meta( $post_id, $field, esc_url_raw( wp_unslash( $_POST[ $field ] ) ) );
        }
    }

    foreach ( $check_fields as $field ) {
        update_post_meta( $post_id, $field, isset( $_POST[ $field ] ) ? '1' : '0' );
    }

    if ( isset( $_POST['ch_subscription_price'] ) ) {
        update_post_meta( $post_id, 'ch_subscription_price', (float) $_POST['ch_subscription_price'] );
    }
}
add_action( 'save_post_ch_creator', 'ch_save_creator_meta' );

function ch_save_post_meta( $post_id ) {
    if ( ! isset( $_POST['ch_post_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['ch_post_nonce'] ) ), 'ch_post_meta' ) ) return;
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( ! current_user_can( 'edit_post', $post_id ) ) return;

    update_post_meta( $post_id, 'ch_is_exclusive', isset( $_POST['ch_is_exclusive'] ) ? '1' : '0' );
    update_post_meta( $post_id, 'ch_is_pinned',    isset( $_POST['ch_is_pinned'] )    ? '1' : '0' );

    if ( isset( $_POST['ch_individual_price'] ) ) {
        update_post_meta( $post_id, 'ch_individual_price', (float) $_POST['ch_individual_price'] );
    }
}
add_action( 'save_post_ch_post', 'ch_save_post_meta' );
