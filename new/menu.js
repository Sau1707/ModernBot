// Handle the creation of the menu

// Title + toggle
// Button plus text
// Image plus action

class ModernMenu {
    constructor(tabs) {
        this.settingsFactory = new createGrepoWindow({
            id: 'MODERN_BOT',
            title: 'ModernBot',
            size: [845, 300],
            tabs: tabs,
            start_tab: 0,
        });
        this.settingsFactory.activate();

        this.addIcon();
    }

    addIcon() {
        // this.settingsFactory.activate();
        const $gods_area_buttons = $('.gods_area_buttons')

        const $circle_button = $('<div class="circle_button modern_bot_settings"></div>');
        $circle_button.click(() => { this.settingsFactory.openWindow() });
        const $icon = $('<div style="width: 27px; height: 27px; background: url(https://raw.githubusercontent.com/Sau1707/ModernBot/main/img/gear.png) no-repeat 6px 5px" class="icon js-caption"></div>');
        $icon.attr("id", "modern_settings");

        $circle_button.append($icon);
        $gods_area_buttons.append($circle_button);
    }
}