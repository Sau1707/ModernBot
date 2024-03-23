class ModernElements {
    /* Utility function that return html for different elements that are used across the bot */

    /**
     * const button = elements.createButton('id', 'text', fn);
     * $('body').append(button);
     * To disable/enable the button:
     * button.addClass('disabled'); button.removeClass('disabled');
     * $('#id').addClass('disabled'); $('#id').removeClass('disabled');
     * NOTE: Even when the button is disabled, the click event will still be triggered.
     */
    createButton = (id, text, fn) => {
        const $button = $('<div>', {
            'id': id,
            'class': 'button_new',
            'style': 'cursor: pointer',
        });

        // Add the left and right divs to the button
        $button.append($('<div>', { 'class': 'left' }));
        $button.append($('<div>', { 'class': 'right' }));
        $button.append($('<div>', {
            'class': 'caption js-caption',
            'html': `${text} <div class="effect js-effect"></div>`
        }));

        // Add the click event to the button if a function is provided
        if (fn) $(document).on('click', `#${id}`, fn);

        return $button;
    }


    /**
     * const title = elements.createTitle('id', 'text', fn, description);
     * $('body').append(title);
     * To disable/enable the title:
     * title.addClass('disabled'); title.removeClass('disabled');
     * $('#id').addClass('disabled'); $('#id').removeClass('disabled');
     * NOTE: Even when the title is disabled, the click event will still be triggered.
     */
    createTitle = (id, text, fn, desc = '(click to toggle)') => {
        const $div = $('<div>').addClass('game_header bold').attr('id', id).css({
            cursor: 'pointer',
            position: 'relative',
        }).html(text);

        const $span = $('<span>').addClass('command_count');
        const $descDiv = $('<div>').css({
            position: 'absolute',
            right: '10px',
            top: '4px',
            fontSize: '10px'
        }).text(desc);

        $div.append($span).append($descDiv);
        if (fn) $(document).on('click', `#${id}`, fn);

        return $('<div>')
            .append('<div class="game_border_top"></div>')
            .append('<div class="game_border_bottom"></div>')
            .append('<div class="game_border_left"></div>')
            .append('<div class="game_border_right"></div>')
            .append('<div class="game_border_corner corner1"></div>')
            .append('<div class="game_border_corner corner2"></div>')
            .append('<div class="game_border_corner corner3"></div>')
            .append('<div class="game_border_corner corner4"></div>')
            .append($div);
    }
}

unsafeWindow.modernElements = new ModernElements();