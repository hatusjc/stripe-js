<?php
/**
 * CreatorHub - Custom Taxonomies
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

/* =========================================================
   CREATOR CATEGORY
   ========================================================= */
function ch_register_taxonomy_creator_category() {
    $labels = [
        'name'              => _x( 'Categorias de Criadores', 'taxonomy general name', 'creator-hub' ),
        'singular_name'     => _x( 'Categoria', 'taxonomy singular name', 'creator-hub' ),
        'search_items'      => __( 'Buscar Categorias', 'creator-hub' ),
        'all_items'         => __( 'Todas as Categorias', 'creator-hub' ),
        'parent_item'       => __( 'Categoria Pai', 'creator-hub' ),
        'parent_item_colon' => __( 'Categoria Pai:', 'creator-hub' ),
        'edit_item'         => __( 'Editar Categoria', 'creator-hub' ),
        'update_item'       => __( 'Atualizar Categoria', 'creator-hub' ),
        'add_new_item'      => __( 'Adicionar Nova Categoria', 'creator-hub' ),
        'new_item_name'     => __( 'Nome da Nova Categoria', 'creator-hub' ),
        'menu_name'         => __( 'Categorias', 'creator-hub' ),
    ];

    register_taxonomy( 'ch_creator_category', [ 'ch_creator' ], [
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => [ 'slug' => 'categoria-criador' ],
        'show_in_rest'      => true,
    ] );
}
add_action( 'init', 'ch_register_taxonomy_creator_category' );

/* =========================================================
   CONTENT TYPE (tipo de conteúdo da publicação)
   ========================================================= */
function ch_register_taxonomy_content_type() {
    $labels = [
        'name'          => _x( 'Tipo de Conteúdo', 'taxonomy general name', 'creator-hub' ),
        'singular_name' => _x( 'Tipo', 'taxonomy singular name', 'creator-hub' ),
        'all_items'     => __( 'Todos os Tipos', 'creator-hub' ),
        'edit_item'     => __( 'Editar Tipo', 'creator-hub' ),
        'add_new_item'  => __( 'Adicionar Tipo', 'creator-hub' ),
        'menu_name'     => __( 'Tipos de Conteúdo', 'creator-hub' ),
    ];

    register_taxonomy( 'ch_content_type', [ 'ch_post', 'post' ], [
        'hierarchical'      => false,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => [ 'slug' => 'tipo' ],
        'show_in_rest'      => true,
    ] );
}
add_action( 'init', 'ch_register_taxonomy_content_type' );

/* =========================================================
   INSERT DEFAULT TERMS
   ========================================================= */
function ch_insert_default_terms() {
    // Creator categories
    $creator_cats = [
        'musica'      => [ 'name' => 'Música',        'emoji' => '🎵' ],
        'arte'        => [ 'name' => 'Arte & Design',  'emoji' => '🎨' ],
        'gaming'      => [ 'name' => 'Gaming',         'emoji' => '🎮' ],
        'fitness'     => [ 'name' => 'Fitness',        'emoji' => '💪' ],
        'culinaria'   => [ 'name' => 'Culinária',      'emoji' => '🍳' ],
        'tecnologia'  => [ 'name' => 'Tecnologia',     'emoji' => '💻' ],
        'moda'        => [ 'name' => 'Moda',           'emoji' => '👗' ],
        'podcasts'    => [ 'name' => 'Podcasts',       'emoji' => '🎙️' ],
        'viagens'     => [ 'name' => 'Viagens',        'emoji' => '✈️' ],
        'educacao'    => [ 'name' => 'Educação',       'emoji' => '📚' ],
        'fotografia'  => [ 'name' => 'Fotografia',     'emoji' => '📸' ],
        'humor'       => [ 'name' => 'Humor & Comédia','emoji' => '😄' ],
    ];

    foreach ( $creator_cats as $slug => $data ) {
        if ( ! term_exists( $slug, 'ch_creator_category' ) ) {
            $term = wp_insert_term( $data['name'], 'ch_creator_category', [ 'slug' => $slug ] );
            if ( ! is_wp_error( $term ) ) {
                update_term_meta( $term['term_id'], 'ch_emoji', $data['emoji'] );
            }
        }
    }

    // Content types
    $content_types = [
        'texto'    => 'Texto',
        'imagem'   => 'Imagem',
        'video'    => 'Vídeo',
        'audio'    => 'Áudio',
        'download' => 'Download',
        'live'     => 'Live',
    ];

    foreach ( $content_types as $slug => $name ) {
        if ( ! term_exists( $slug, 'ch_content_type' ) ) {
            wp_insert_term( $name, 'ch_content_type', [ 'slug' => $slug ] );
        }
    }
}
add_action( 'init', 'ch_insert_default_terms' );

/* =========================================================
   TAXONOMY META (emoji/icon for categories)
   ========================================================= */
function ch_taxonomy_meta_fields() {
    ?>
    <div class="form-field term-emoji-wrap">
        <label for="ch_emoji"><?php esc_html_e( 'Emoji/Ícone', 'creator-hub' ); ?></label>
        <input type="text" name="ch_emoji" id="ch_emoji" value="">
        <p class="description"><?php esc_html_e( 'Emoji para representar a categoria (ex: 🎵)', 'creator-hub' ); ?></p>
    </div>
    <div class="form-field term-color-wrap">
        <label for="ch_category_color"><?php esc_html_e( 'Cor', 'creator-hub' ); ?></label>
        <input type="color" name="ch_category_color" id="ch_category_color" value="#7c3aed">
    </div>
    <?php
}
add_action( 'ch_creator_category_add_form_fields', 'ch_taxonomy_meta_fields' );

function ch_edit_taxonomy_meta_fields( $term ) {
    $emoji = get_term_meta( $term->term_id, 'ch_emoji', true );
    $color = get_term_meta( $term->term_id, 'ch_category_color', true );
    ?>
    <tr class="form-field term-emoji-wrap">
        <th scope="row"><label for="ch_emoji"><?php esc_html_e( 'Emoji/Ícone', 'creator-hub' ); ?></label></th>
        <td>
            <input type="text" name="ch_emoji" id="ch_emoji" value="<?php echo esc_attr( $emoji ); ?>">
        </td>
    </tr>
    <tr class="form-field term-color-wrap">
        <th scope="row"><label for="ch_category_color"><?php esc_html_e( 'Cor', 'creator-hub' ); ?></label></th>
        <td>
            <input type="color" name="ch_category_color" id="ch_category_color" value="<?php echo esc_attr( $color ?: '#7c3aed' ); ?>">
        </td>
    </tr>
    <?php
}
add_action( 'ch_creator_category_edit_form_fields', 'ch_edit_taxonomy_meta_fields' );

function ch_save_taxonomy_meta( $term_id ) {
    if ( isset( $_POST['ch_emoji'] ) ) {
        update_term_meta( $term_id, 'ch_emoji', sanitize_text_field( wp_unslash( $_POST['ch_emoji'] ) ) );
    }
    if ( isset( $_POST['ch_category_color'] ) ) {
        update_term_meta( $term_id, 'ch_category_color', sanitize_hex_color( wp_unslash( $_POST['ch_category_color'] ) ) );
    }
}
add_action( 'created_ch_creator_category', 'ch_save_taxonomy_meta' );
add_action( 'edited_ch_creator_category',  'ch_save_taxonomy_meta' );
