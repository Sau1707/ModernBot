// ==UserScript==
// @name         ModernBot
// @version      0.0.2
// @description  A modern grepolis bot
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @updateURL    https://github.com/Sau1707/ModernBot/blob/main/dist/merged.user.js
// @downloadURL  https://github.com/Sau1707/ModernBot/blob/main/dist/merged.user.js
// @icon         https://raw.githubusercontent.com/Sau1707/ModernBot/main/img/gear.png
// @require      http://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

(function () {
    'use strict';
    var uw;
    if (typeof unsafeWindow == 'undefined') {
        uw = window;
    } else {
        uw = unsafeWindow;
    }

    // Dynamically add CSS
    var style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = `.modern_bot_settings {
    z-index: 10;
    position: absolute;
    top: 52px !important;
    right: 116px !important;
}

.modern_active {
    position: relative;
    background-blend-mode: multiply;
    /* Or another blend mode that achieves your effect */
    background-color: rgba(0, 0, 0, 0.5);
    /* Adjust color for blending */
}


.modern_title_description {
    position: absolute;
    right: 10px;
    top: 4px;
    font-size: 10px
}

.game_border .game_header.active {
    filter: brightness(100%) saturate(186%) hue-rotate(241deg);
}

@keyframes rotateForever {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.rotate-forever {
    animation: rotateForever 5s linear infinite;
    transform-origin: 16px 15px;
    filter: hue-rotate(72deg) saturate(2.5);
}`;
    document.head.appendChild(style);


// File: utils.js
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



// File: window.js
class createGrepoWindow {
    constructor({ id, title, size, tabs, start_tab, minimizable = true }) {
        this.minimizable = minimizable;
        this.width = size[0];
        this.height = size[1];
        this.title = title;
        this.id = id;
        this.tabs = tabs;
        this.start_tab = start_tab;

        /* Private methods */
        const createWindowType = (name, title, width, height, minimizable) => {
            function WndHandler(wndhandle) {
                this.wnd = wndhandle;
            }
            Function.prototype.inherits.call(WndHandler, uw.WndHandlerDefault);
            WndHandler.prototype.getDefaultWindowOptions = function () {
                return {
                    position: ['center', 'center', 100, 100],
                    width: width,
                    height: height,
                    minimizable: minimizable,
                    title: title,
                };
            };
            uw.GPWindowMgr.addWndType(name, `${name}_75624`, WndHandler, 1);
        };

        const getTabById = (id) => {
            return this.tabs.filter((tab) => tab.id === id)[0];
        };

        this.activate = function () {
            createWindowType(this.id, this.title, this.width, this.height, this.minimizable); //
            uw.$(
                `<style id="${this.id}_custom_window_style">
                 #${this.id} .tab_icon { left: 23px;}
                 #${this.id} {top: -36px; right: 95px;}
                 #${this.id} .submenu_link {color: #000;}
                 #${this.id} .submenu_link:hover {text-decoration: none;}
                 #${this.id} li { float:left; min-width: 60px; }
                 </style>
                `,
            ).appendTo('head');
        };

        this.deactivate = function () {
            if (uw.Layout.wnd.getOpenFirst(uw.GPWindowMgr[`TYPE_${this.id}`])) {
                uw.Layout.wnd.getOpenFirst(uw.GPWindowMgr[`TYPE_${this.id}`]).close();
            }
            uw.$(`#${this.id}_custom_window_style`).remove();
        };

        /* open the window */
        this.openWindow = function () {
            let wn = uw.Layout.wnd.getOpenFirst(uw.GPWindowMgr[`TYPE_${this.id}`]);

            /* if open is called but window it's alreay open minimized, maximize that */
            if (wn) {
                if (wn.isMinimized()) {
                    wn.maximizeWindow();
                }
                return;
            }

            let content = `<ul id="${this.id}" class="menu_inner"></ul><div id="${this.id}_content"> </div>`;
            uw.Layout.wnd.Create(uw.GPWindowMgr[`TYPE_${this.id}`]).setContent(content);
            /* Add and reder tabs */
            console.log(this.tabs);
            this.tabs.forEach((e) => {
                let html = `
                    <li><a id="${e.id}" class="submenu_link" href="#"><span class="left"><span class="right"><span class="middle">
                    <span class="tab_label"> ${e.title} </span>
                    </span></span></span></a></li>
                `;
                uw.$(html).appendTo(`#${this.id}`);
            });

            /* Add events to tabs */
            let tabs = '';
            this.tabs.forEach((e) => {
                tabs += `#${this.id} #${e.id}, `;
            });
            tabs = tabs.slice(0, -2);
            let self = this;
            uw.$(tabs).click(function () {
                self.renderTab(this.id);
            });
            /* render default tab*/
            this.renderTab(this.tabs[this.start_tab].id);
        };

        this.closeWindow = function () {
            uw.Layout.wnd.getOpenFirst(uw.GPWindowMgr[`TYPE_${this.id}`]).close();
        };

        /* Handle active tab */
        this.renderTab = function (id) {
            let tab = getTabById(id);
            uw.$(`#${this.id}_content`).html(getTabById(id).render());
            uw.$(`#${this.id} .active`).removeClass('active');
            uw.$(`#${id}`).addClass('active');
            getTabById(id).afterRender ? getTabById(id).afterRender() : '';
        };
    }
}


// Module: autoBootcamp.js
class AutoBootcamp extends ModernUtils {

}

// Module: autoFarm.js
class AutoFarm extends ModernUtils {
    constructor() {
        super();

        this.active = this.loadSettings('farm_active', false);
        this.duration = this.loadSettings('farm_duration', 5);
    }

    render() {
        const { $container, $title } = this.getTitleElement('Auto Farm');
        this.$container = $container;
        this.$title = $title;

        this.$title.click(() => this.toggle());
        if (this.active) this.$title.addClass('active');

        this.$buttonBox = $('<div>').css({ "padding": "5px" })
        this.$container.append(this.$buttonBox);

        this.$button1 = this.getButtonElement("5 / 10 min")
        this.$button1.click(() => this.setDuration(1));
        this.$button2 = this.getButtonElement("20 / 40 min")
        this.$button2.click(() => this.setDuration(2));

        this.setDuration(this.duration);
        this.$buttonBox.append(this.$button1, this.$button2)

        return this.$container;
    }

    toggle() {
        this.active = !this.active;
        this.saveSettings('farm_active', this.active);
        this.$title.toggleClass('active');
    }

    setDuration(duration) {
        this.duration = duration;
        this.saveSettings('farm_duration', duration);

        this.$button1.removeClass('disabled');
        this.$button2.removeClass('disabled');

        if (duration === 1) this.$button1.addClass('disabled');
        if (duration === 2) this.$button2.addClass('disabled');
    }

    async execute() {
        if (!this.active) return false;

        const next_collection = this.getNextCollection();
        console.log('Next collection in', next_collection);
        if (next_collection > 0) return false;

        this.polis_list = this.generateList();
        await this.claim();

        return true;
    }

    // TODO: Ensure that this list has the right sorting
    generateList = () => {
        const islands_list = new Set();
        const polis_list = [];
        let minResource = 0;
        let min_percent = 0;

        const { models: towns } = uw.MM.getOnlyCollectionByName('Town');

        for (const town of towns) {
            const { on_small_island, island_id, id } = town.attributes;
            if (on_small_island || islands_list.has(island_id)) continue;

            // Check the min percent for each town
            const { wood, stone, iron, storage } = uw.ITowns.getTown(id).resources();
            minResource = Math.min(wood, stone, iron);
            min_percent = minResource / storage;

            islands_list.add(island_id);
            polis_list.push(town.id);
        }

        return polis_list;
    };


    getNextCollection = () => {
        const { models } = uw.MM.getCollections().FarmTownPlayerRelation[0];

        const lootCounts = {};
        for (const model of models) {
            const { lootable_at } = model.attributes;
            if (!lootable_at) continue;
            lootCounts[lootable_at] = (lootCounts[lootable_at] || 0) + 1;
        }

        let maxLootableTime = 0;
        let maxValue = 0;
        for (const lootableTime in lootCounts) {
            const value = lootCounts[lootableTime];
            if (value < maxValue) continue;
            maxLootableTime = lootableTime;
            maxValue = value;
        }

        const seconds = maxLootableTime - Math.floor(Date.now() / 1000);
        return seconds > 0 ? seconds * 1000 : 0;
    };


    async claim() {
        const isCaptainActive = uw.GameDataPremium.isAdvisorActivated('captain');

        // If the captain is active, claim all the resources at once and fake the opening
        if (isCaptainActive) {
            console.log('Claiming resources all at once');

            await this.fakeOpening();
            await this.sleep(Math.random() * 2000 + 1000);
            await this.fakeSelectAll();
            await this.sleep(Math.random() * 2000 + 1000);

            if (this.duration == 1) await this.claimMultiple(300, 600);
            if (this.duration == 2) await this.claimMultiple(1200, 2400);
            await this.fakeUpdate();

            setTimeout(() => uw.WMap.removeFarmTownLootCooldownIconAndRefreshLootTimers(), 2000);
            return;
        }

        console.log('Claiming resources one by one');

        // If the captain is not active, claim the resources one by one, but limit the number of claims
        // let max = 60;
        // const { models: player_relation_models } = uw.MM.getOnlyCollectionByName('FarmTownPlayerRelation');
        // const { models: farm_town_models } = uw.MM.getOnlyCollectionByName('FarmTown');
        // const now = Math.floor(Date.now() / 1000);
        // for (let town_id of polis_list) {
        //     let town = uw.ITowns.towns[town_id];
        //     let x = town.getIslandCoordinateX();
        //     let y = town.getIslandCoordinateY();
        //     for (let farm_town of farm_town_models) {
        //         if (farm_town.attributes.island_x != x) continue;
        //         if (farm_town.attributes.island_y != y) continue;
        //         for (let relation of player_relation_models) {
        //             if (farm_town.attributes.id != relation.attributes.farm_town_id) continue;
        //             if (relation.attributes.relation_status !== 1) continue;
        //             if (relation.attributes.lootable_at !== null && now < relation.attributes.lootable_at) continue;
        //             this.claimSingle(town_id, relation.attributes.farm_town_id, relation.id, Math.ceil(this.timing / 600_000));
        //             await this.sleep(500);
        //             if (!max) return;
        //             else max -= 1;
        //         }
        //     }
        // }

    }

    /* Claim resources from a single polis */
    claimSingle = (town_id, farm_town_id, relation_id, option = 1) => {
        const data = {
            model_url: `FarmTownPlayerRelation/${relation_id}`,
            action_name: 'claim',
            arguments: {
                farm_town_id: farm_town_id,
                type: 'resources',
                option: option,
            },
            town_id: town_id,
        };
        uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
    };

    /* Claim resources from multiple polis */
    claimMultiple = (base = 300, boost = 600) =>
        new Promise((myResolve, myReject) => {
            const polis_list = this.generateList();
            let data = {
                towns: polis_list,
                time_option_base: base,
                time_option_booty: boost,
                claim_factor: 'normal',
            };
            uw.gpAjax.ajaxPost('farm_town_overviews', 'claim_loads_multiple', data, false, () => myResolve());
        });

    /* Pretend that the window it's opening */
    fakeOpening = () =>
        new Promise((myResolve, myReject) => {
            uw.gpAjax.ajaxGet('farm_town_overviews', 'index', {}, false, async () => {
                await this.sleep(10);
                await this.fakeUpdate();
                myResolve();
            });
        });

    /* Fake the user selecting the list */
    fakeSelectAll = () =>
        new Promise((myResolve, myReject) => {
            const data = {
                town_ids: this.polislist,
            };
            uw.gpAjax.ajaxGet('farm_town_overviews', 'get_farm_towns_from_multiple_towns', data, false, () => myResolve());
        });

    /* Fake the window update*/
    fakeUpdate = () =>
        new Promise((myResolve, myReject) => {
            const town = uw.ITowns.getCurrentTown();
            const { attributes: booty } = town.getResearches();
            const { attributes: trade_office } = town.getBuildings();
            const data = {
                island_x: town.getIslandCoordinateX(),
                island_y: town.getIslandCoordinateY(),
                current_town_id: town.id,
                booty_researched: booty ? 1 : 0,
                diplomacy_researched: '',
                trade_office: trade_office ? 1 : 0,
            };
            uw.gpAjax.ajaxGet('farm_town_overviews', 'get_farm_towns_for_town', data, false, () => myResolve());
        });

}   

// Module: autoTrade.js
class AutoTrade {

}

// File: menu.js
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

// File: index.js
/*



*/


class ModernBot {
    STOP_TIME = 1000 * 5;
    ACTION_DELAY = 1000 * 0;

    constructor() {
        this.lastInteraction = Date.now();
        this.lastAction = Date.now();
        this.loopActive = false;

        this.autoFarm = new AutoFarm();

        new ModernMenu([
            {
                title: 'Farm',
                id: 'farm',
                render: () => this.autoFarm.render(),
            },
            // { 
            //     title: 'Build',
            //     id: 'build',
            //     render: () => { },
            // }
        ]);


    }

    enableListeners() {
        $(document).on('mousemove', () => {
            this.lastInteraction = Date.now();
            $("#modern_settings").removeClass("rotate-forever")
        });

        $(document).on('keydown', (e) => {
            this.lastInteraction = Date.now();
            $("#modern_settings").removeClass("rotate-forever")
        });
    }

    async loop() {
        // Check if the captcha is active or the user has interacted with the page
        if (Date.now() - this.lastInteraction < this.STOP_TIME) return;
        if ($('.botcheck').length || $('#recaptcha_window').length) return;
        if (Date.now() - this.lastAction < this.ACTION_DELAY) return;
        // recaptcha_window / g-recaptcha / recaptcha_container / captcha_curtain

        if (this.loopActive) return;
        this.loopActive = true;

        // The bot is active, ensure the settings icon is rotating
        $("#modern_settings").addClass("rotate-forever")

        // After each action, wait for the delay to pass
        // TODO: Add a ramdon delay that sometimes skips the action

        // Check if the farm is available
        // Farm can be done in every island / Current town
        const hasFarm = await this.autoFarm.execute();
        if (hasFarm) {
            console.log("Farm was executed");
            this.lastAction = Date.now();
            this.loopActive = false;
            return;
        };

        // TODO: Check for building upgrades
        // TODO: Check for research upgrades
        // TODO: Check for rural trades / upgrades
        // TODO: Check if the town has the bootcamp?
        // TODO: Check if the gratis can be claimed
        // TODO: Cave?
        // TODO: Train & Heros?
        this.loopActive = false;
    }


}


const loader = setInterval(() => {
    if ($("#loader").length > 0) return;
    clearInterval(loader);

    const modernBot = new ModernBot();
    modernBot.enableListeners();

    setInterval(() => {
        modernBot.loop();
    }, 250);

}, 100);

})();