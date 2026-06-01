<?php
/**
 * CreatorHub - Elementor Creator Card Widget
 *
 * @package CreatorHub
 */

namespace CreatorHub\Elementor;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;
use Elementor\Group_Control_Typography;

defined( 'ABSPATH' ) || exit;

class Creator_Card_Widget extends Widget_Base {

    public function get_name(): string {
        return 'ch_creator_card';
    }

    public function get_title(): string {
        return __( 'CreatorHub: Card de Criador', 'creator-hub' );
    }

    public function get_icon(): string {
        return 'eicon-person';
    }

    public function get_categories(): array {
        return [ 'creator-hub' ];
    }

    public function get_keywords(): array {
        return [ 'creator', 'criador', 'card', 'profile', 'perfil' ];
    }

    protected function register_controls(): void {
        // Content Section
        $this->start_controls_section( 'section_content', [
            'label' => __( 'Conteúdo', 'creator-hub' ),
            'tab'   => Controls_Manager::TAB_CONTENT,
        ] );

        $this->add_control( 'creator_id', [
            'label'       => __( 'ID do Criador', 'creator-hub' ),
            'type'        => Controls_Manager::NUMBER,
            'description' => __( 'ID do post do tipo "Criador"', 'creator-hub' ),
        ] );

        $this->add_control( 'show_subscribe', [
            'label'        => __( 'Mostrar botão de assinatura', 'creator-hub' ),
            'type'         => Controls_Manager::SWITCHER,
            'label_on'     => __( 'Sim', 'creator-hub' ),
            'label_off'    => __( 'Não', 'creator-hub' ),
            'return_value' => 'yes',
            'default'      => 'yes',
        ] );

        $this->add_control( 'show_follow', [
            'label'        => __( 'Mostrar botão de seguir', 'creator-hub' ),
            'type'         => Controls_Manager::SWITCHER,
            'label_on'     => __( 'Sim', 'creator-hub' ),
            'label_off'    => __( 'Não', 'creator-hub' ),
            'return_value' => 'yes',
            'default'      => 'yes',
        ] );

        $this->end_controls_section();

        // Style Section
        $this->start_controls_section( 'section_style', [
            'label' => __( 'Estilo', 'creator-hub' ),
            'tab'   => Controls_Manager::TAB_STYLE,
        ] );

        $this->add_control( 'card_border_radius', [
            'label'      => __( 'Border Radius', 'creator-hub' ),
            'type'       => Controls_Manager::SLIDER,
            'size_units' => [ 'px', 'rem' ],
            'range'      => [ 'px' => [ 'min' => 0, 'max' => 40 ] ],
            'default'    => [ 'size' => 16, 'unit' => 'px' ],
            'selectors'  => [
                '{{WRAPPER}} .ch-creator-card' => 'border-radius: {{SIZE}}{{UNIT}};',
            ],
        ] );

        $this->end_controls_section();
    }

    protected function render(): void {
        $settings   = $this->get_settings_for_display();
        $creator_id = (int) ( $settings['creator_id'] ?? 0 );

        if ( ! $creator_id ) {
            echo '<p class="ch-text-muted">' . esc_html__( 'Selecione um criador para exibir.', 'creator-hub' ) . '</p>';
            return;
        }

        ch_render_creator_card( $creator_id, [
            'show_subscribe' => $settings['show_subscribe'] === 'yes',
            'show_follow'    => $settings['show_follow'] === 'yes',
        ] );
    }
}
