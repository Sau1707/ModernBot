class AutoParty extends ModernUtil {
    constructor(c, s) {
        super(c, s);

        this.active_types = this.storage.load('autoparty_types', { festival: false, procession: false });
        this.single = this.storage.load('autoparty_single', true);
        if (this.storage.load('enable_autoparty', false)) this.toggle();
    }

    // ${this.getButtonHtml('autoparty_lvl_1', 'Olympic', this.setRuralLevel, 1)}

    settings = () => {
        requestAnimationFrame(() => {
            this.active_types['festival'] = !this.active_types['festival'];
            this.active_types['procession'] = !this.active_types['procession'];
            this.trigger('festival');
            this.trigger('procession');

            this.triggerSingle(this.single.toString());
        });

        return `
        <div class="game_border" style="margin-bottom: 20px">
            <div class="game_border_top"></div>
            <div class="game_border_bottom"></div>
            <div class="game_border_left"></div>
            <div class="game_border_right"></div>
            <div class="game_border_corner corner1"></div>
            <div class="game_border_corner corner2"></div>
            <div class="game_border_corner corner3"></div>
            <div class="game_border_corner corner4"></div>
            <div id="auto_party_title" style="cursor: pointer; filter: ${this.autoparty ? 'brightness(100%) saturate(186%) hue-rotate(241deg)' : ''
            }" class="game_header bold" onclick="window.modernBot.autoParty.toggle()"> Auto Party <span class="command_count"></span>
                <div style="position: absolute; right: 10px; top: 4px; font-size: 10px;"> (click to toggle) </div>
            </div>

            <div id="autoparty_types" class="split_content">
            <div style="padding: 5px;">
            ${this.getButtonHtml('autoparty_festival', 'Party', this.trigger, 'festival')}
            ${this.getButtonHtml('autoparty_procession', 'Parade', this.trigger, 'procession')}
            </div>

            <div style="padding: 5px;">
            ${this.getButtonHtml('autoparty_single', 'Single', this.triggerSingle, 'true')}
            ${this.getButtonHtml('autoparty_multiple', 'All', this.triggerSingle, 'false')}
            </div>
            </div>
        </div>
        `;
    };

    trigger = (type) => {
        if (this.active_types[type]) {
            uw.$(`#autoparty_${type}`).addClass('disabled');
        } else {
            uw.$(`#autoparty_${type}`).removeClass('disabled');
        }
        this.active_types[type] = !this.active_types[type];
        this.storage.save('autoparty_types', this.active_types);
    };

    triggerSingle = (type) => {
        if (type === 'false') {
            uw.$(`#autoparty_single`).addClass('disabled');
            uw.$(`#autoparty_multiple`).removeClass('disabled');
            this.single = false;
        } else {
            uw.$(`#autoparty_multiple`).addClass('disabled');
            uw.$(`#autoparty_single`).removeClass('disabled');
            this.single = true;
        }
        this.storage.save('autoparty_single', this.single);
    };

    toggle = () => {
        if (!this.autoparty) {
            uw.$('#auto_party_title').css(
                'filter',
                'brightness(100%) saturate(186%) hue-rotate(241deg)',
            );
            this.autoparty = setInterval(this.main, 30000);
            this.console.log('Auto Party -> On');
        } else {
            uw.$('#auto_party_title').css('filter', '');
            clearInterval(this.autoparty);
            this.autoparty = null;
            this.console.log('Auto Party -> Off');
        }
        this.storage.save('enable_autoparty', !!this.autoparty);
    };

    /* Return list of town with active celebration */
    getCelebrationsList = (type) => {
        const celebrationModels = uw.MM.getModels().Celebration;
        if (typeof celebrationModels === 'undefined') return [];
        const triumphs = Object.values(celebrationModels)
            .filter((celebration) => celebration.attributes.celebration_type === type)
            .map((triumph) => triumph.attributes.town_id);
        return triumphs;
    };

    checkParty = async () => {
        let max = 10;
        let party = this.getCelebrationsList('party');
        if (this.single) {
            for (let town_id in uw.ITowns.towns) {
                if (party.includes(parseInt(town_id))) continue;
                let town = uw.ITowns.towns[town_id];
                if (town.getBuildings().attributes.academy < 30) continue;
                let { wood, stone, iron } = town.resources();
                if (wood < 15000 || stone < 18000 || iron < 15000) continue;
                this.makeCelebration('party', town_id);
                await this.sleep(750);
                max -= 1;
                /* Prevent that the promise it's to long */
                if (max <= 0) return;
            }
        } else {
            if (party.length > 1) return;
            this.makeCelebration('party');
        }
    };

    checkTriumph = async () => {
        let max = 10;
        let killpoints = uw.MM.getModelByNameAndPlayerId('PlayerKillpoints').attributes;
        let available = killpoints.att + killpoints.def - killpoints.used;
        if (available < 300) return;

        let triumph = this.getCelebrationsList('triumph');
        if (this.single) {
            for (let town_id in uw.ITowns.towns) {
                if (triumph.includes(parseInt(town_id))) continue;
                console.log(town_id);
                this.makeCelebration('triumph', town_id);
                await this.sleep(500);
                available -= 300;
                if (available < 300) return;
                max -= 1;
                /* Prevent that the promise it's to long */
                if (max <= 0) return;
            }
        } else {
            if (triumph.length > 1) return;
            this.makeCelebration('triumph');
        }
    };

    main = async () => {
        if (this.active_types['procession']) await this.checkTriumph();
        if (this.active_types['festival']) await this.checkParty();
    };

    makeCelebration = (type, town_id) => {
        if (typeof town_id === 'undefined') {
            let data = {
                celebration_type: type,
            };
            uw.gpAjax.ajaxPost('town_overviews', 'start_all_celebrations', data);
        } else {
            let data = {
                celebration_type: type,
                town_id: town_id,
            };
            uw.gpAjax.ajaxPost('building_place', 'start_celebration', data);
        }
    };
}
