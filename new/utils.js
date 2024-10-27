class ModernUtils {

    saveSettings(id, settings) {
        localStorage.setItem(`modern_settings_${id}`, JSON.stringify(settings));
    }

    loadSettings(id, defaultSettings) {
        const settings = localStorage.getItem(`modern_settings_${id}`);
        if (!settings) return defaultSettings;
        return JSON.parse(settings);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getTitleElement(text, desc = '(click to toggle)') {
        const $container = $('<div>').addClass('game_border').css({ cursor: 'pointer' })

        // Append each border element
        $container.append($('<div>').addClass('game_border_top'));
        $container.append($('<div>').addClass('game_border_bottom'));
        $container.append($('<div>').addClass('game_border_left'));
        $container.append($('<div>').addClass('game_border_right'));
        $container.append($('<div>').addClass('game_border_corner corner1'));
        $container.append($('<div>').addClass('game_border_corner corner2'));
        $container.append($('<div>').addClass('game_border_corner corner3'));
        $container.append($('<div>').addClass('game_border_corner corner4'));

        const $text = $('<div>').addClass('game_header bold').text(text);
        $container.append($text);

        const $desc = $('<div>').addClass("modern_title_description").text(desc);
        $text.append($desc);

        // Return the container jQuery element
        return { $container: $container, $title: $text };
    }

    getButtonElement(text) {
        const $button = $('<div>', {
            'class': 'button_new',
        });

        // Add the left and right divs to the button
        $button.append($('<div>', { 'class': 'left' }));
        $button.append($('<div>', { 'class': 'right' }));
        $button.append($('<div>', {
            'class': 'caption js-caption',
            'html': `${text} <div class="effect js-effect"></div>`
        }));

        return $button;
    }

}

