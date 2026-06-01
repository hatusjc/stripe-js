<?php
/**
 * CreatorHub - Page Template
 *
 * @package CreatorHub
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) : the_post(); ?>

<article <?php post_class( 'ch-section' ); ?>>
    <div class="ch-container ch-container--narrow">
        <header style="margin-bottom:32px">
            <h1 style="font-size:clamp(2rem,4vw,3rem);margin-bottom:8px"><?php the_title(); ?></h1>
        </header>
        <div class="entry-content">
            <?php the_content(); ?>
        </div>
    </div>
</article>

<?php endwhile;

get_footer();
