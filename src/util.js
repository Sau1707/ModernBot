class ModernUtil {
    /* CONSTANTS */

    REQUIREMENTS = {
        sword: {},
        archer: { research: 'archer' },
        hoplite: { research: 'hoplite' },
        slinger: { research: 'slinger' },
        catapult: { research: 'catapult' },
        rider: { research: 'rider', building: 'barracks', level: 10 },
        chariot: { research: 'chariot', building: 'barracks', level: 15 },
        big_transporter: { building: 'docks', level: 1 },
        small_transporter: { research: 'small_transporter', building: 'docks', level: 1 },
        bireme: { research: 'bireme', building: 'docks', level: 1 },
        attack_ship: { research: 'attack_ship', building: 'docks', level: 1 },
        trireme: { research: 'trireme', building: 'docks', level: 1 },
        colonize_ship: { research: 'colonize_ship', building: 'docks', level: 10 },
    };

    constructor(console, storage) {
        this.console = console;
        this.storage = storage;
    }
    /* Usage async this.sleep(ms) -> stop the code for ms */
    sleep = ms => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    /**
     * Generate a list of town IDs that are located on large islands.
     * A large island is defined as an island that has at least one town that is not on a small island.
     * @returns {Array} - Array of town IDs.
     */
    generateList = () => {
        const townList = uw.MM.getOnlyCollectionByName('Town').models;
        const islandsList = [];
        const polisList = [];

        for (const town of townList) {
            const { island_id, id, on_small_island } = town.attributes;

            if (on_small_island) continue; // Skip towns on small islands

            if (!islandsList.includes(island_id)) {
                islandsList.push(island_id);
                polisList.push(id);
            }
        }

        return polisList;
    };

    /**
     * Returns HTML code for a button with a specified ID, text, function, and optional properties.
     *
     * @param {string} id - The ID for the button.
     * @param {string} text - The text to display on the button.
     * @param {Function} fn - The function to call when the button is clicked.
     * @param {string} [props] - Optional properties to pass to the function.
     * @returns {string} - The HTML code for the button.
     */
    getButtonHtml(id, text, fn, props) {
        const name = this.constructor.name.charAt(0).toLowerCase() + this.constructor.name.slice(1);
        props = isNaN(parseInt(props)) ? `'${props}'` : props;
        const click = `window.modernBot.${name}.${fn.name}(${props || ''})`;

        return `
      <div id="${id}" style="cursor: pointer" class="button_new" onclick="${click}">
        <div class="left"></div>
        <div class="right"></div>
        <div class="caption js-caption"> ${text} <div class="effect js-effect"></div></div>
      </div>`;
    }

    /**
     * Returns the HTML for a game title with a clickable header that toggles a function.
     *
     * @param {string} id - The ID for the HTML element.
     * @param {string} text - The text to display in the title.
     * @param {function} fn - The function to toggle.
     * @param {string|number} props - The properties to pass to the function.
     * @param {boolean} enable - Whether the title is enabled or not.
     * @param {string} [desc='(click to toggle)'] - The description to display.
     * @returns {string} The HTML for the game title.
     */
    getTitleHtml(id, text, fn, props, enable, desc = '(click to toggle)') {
        const name = this.constructor.name.charAt(0).toLowerCase() + this.constructor.name.slice(1);
        props = isNaN(parseInt(props)) && props ? `"${props}"` : props;
        const click = `window.modernBot.${name}.${fn.name}(${props || ''})`;
        const filter = 'brightness(100%) saturate(186%) hue-rotate(241deg)';

        return `
        <div class="game_border_top"></div>
        <div class="game_border_bottom"></div>
        <div class="game_border_left"></div>
        <div class="game_border_right"></div>
        <div class="game_border_corner corner1"></div>
        <div class="game_border_corner corner2"></div>
        <div class="game_border_corner corner3"></div>
        <div class="game_border_corner corner4"></div>
        <div id="${id}" style="cursor: pointer; filter: ${enable ? filter : ''}" class="game_header bold" onclick="${click}">
            ${text}
            <span class="command_count"></span>
            <div style="position: absolute; right: 10px; top: 4px; font-size: 10px;"> ${desc} </div>
        </div>`;
    }

    /**
     * Calculates the total population of a collection of units.
     *
     * @param {Object} units - The collection of units to count population for.
     * @returns {number} - The total population of all units in the collection.
     */
    countPopulation(obj) {
        const data = GameData.units;
        let total = 0;
        for (let key in obj) {
            total += data[key].population * obj[key];
        }
        return total;
    }

    isActive(type) {
        return uw.GameDataPremium.isAdvisorActivated(type);
    }


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


    createActivity = (background) => {
        const $activity_wrap = $('<div class="activity_wrap"></div>');
        const $activity = $('<div class="activity"></div>');
        const $icon = $('<div class="icon"></div>').css({
            "background": background,
            "position": "absolute",
            "top": "-1px",
            "left": "-1px",
        });
        const $count = $('<div class="count js-caption"></div>').text(0);
        $icon.append($count);
        $activity.append($icon);
        $activity_wrap.append($activity);
        return { $activity, $count };
    }


    createPopup = (left, width, height, $content) => {
        const $box = $('<div class="sandy-box js-dropdown-list" id="toolbar_activity_recruits_list"></div>').css({
            "left": `${left}px`,
            "position": "absolute",
            "width": `${width}px`,
            "height": `${height}px`,
            "top": "29px",
            "margin-left": "0px",
            "display": "none",
        });

        // Make all the corners
        const $corner_tl = $('<div class="corner_tl"></div>');
        const $corner_tr = $('<div class="corner_tr"></div>');
        const $corner_bl = $('<div class="corner_bl"></div>');
        const $corner_br = $('<div class="corner_br"></div>');
        // Make all the borders
        const $border_t = $('<div class="border_t"></div>');
        const $border_b = $('<div class="border_b"></div>');
        const $border_l = $('<div class="border_l"></div>');
        const $border_r = $('<div class="border_r"></div>');
        // Make the middle
        const $middle = $('<div class="middle"></div>').css({
            "left": "10px",
            "right": "20px",
            "top": "14px",
            "bottom": "20px",
        });

        const $middle_content = $('<div class="content js-dropdown-item-list"></div>').append($content);
        $middle.append($middle_content);

        $box.append($corner_tl, $corner_tr, $corner_bl, $corner_br, $border_t, $border_b, $border_l, $border_r, $middle);
        return $box;
    }

}
