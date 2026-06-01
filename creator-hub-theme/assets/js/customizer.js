/**
 * CreatorHub - Customizer Live Preview
 */
(function ($) {
    'use strict';

    // Platform name
    wp.customize('ch_platform_name', function (value) {
        value.bind(function (newval) {
            $('.ch-header__logo a, .ch-footer__brand-logo').text(newval);
        });
    });

    // Hero title
    wp.customize('ch_hero_title', function (value) {
        value.bind(function (newval) {
            $('#hero-title').text(newval);
        });
    });

    // Hero subtitle
    wp.customize('ch_hero_subtitle', function (value) {
        value.bind(function (newval) {
            $('.ch-hero__description').text(newval);
        });
    });

    // Footer desc
    wp.customize('ch_footer_desc', function (value) {
        value.bind(function (newval) {
            $('.ch-footer__brand-desc').text(newval);
        });
    });

    // Primary color
    wp.customize('ch_color_primary', function (value) {
        value.bind(function (newval) {
            document.documentElement.style.setProperty('--ch-primary', newval);
        });
    });

    // Secondary color
    wp.customize('ch_color_secondary', function (value) {
        value.bind(function (newval) {
            document.documentElement.style.setProperty('--ch-secondary', newval);
        });
    });

    // Font size
    wp.customize('ch_font_size_base', function (value) {
        value.bind(function (newval) {
            document.documentElement.style.fontSize = newval + 'px';
        });
    });

}(jQuery));
