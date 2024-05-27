class AutoParty extends ModernUtil {
    constructor(c, s) {
        super(c, s);

        this.active_types = this.storage.load('ap_types', { festival: false, procession: false, theater: false });
        this.single = this.storage.load('ap_single', true);
        this.captchaActive = false;
        this.randomInterval = null;

        if (this.storage.load('ap_enable', false)) {
            this.startInterval();
        }

        this.simulateCaptcha = false;

        // Check for captcha every 300ms
        this.checkCaptchaInterval = setInterval(() => {
            if (this.simulateCaptcha || $('.botcheck').length || $('#recaptcha_window').length) {
                if (!this.captchaActive) {
                    this.console.log('Captcha active, autoparty stopped working');
                    clearInterval(this.enable); // Stop autoparty
                    this.captchaActive = true;
                }
            } else {
                if (this.captchaActive) {
                    this.console.log('Captcha resolved, autoparty resumed');
                    this.startInterval(); // Restart autoparty
                    this.captchaActive = false;
                }
            }
        }, 300);
    }

    startInterval() {
        const randomInterval = Math.floor(Math.random() * (50000 - 5000 + 1)) + 5000; // Random number between 5000 and 50000
        this.enable = setInterval(this.main.bind(this), randomInterval);
        this.randomInterval = randomInterval;
    }

    // ${this.getButtonHtml('autoparty_lvl_1', 'Olympic', this.setRuralLevel, 1)}

    settings = () => {
        requestAnimationFrame(() => {
            this.triggerType('festival', false);
            this.triggerType('procession', false);
            this.triggerType('theater', false); // Initialize theater toggle
            this.triggerSingle(this.single);
        });

        return `
            <div class="game_border" style="margin-bottom: 20px">
                ${this.getTitleHtml('auto_party_title', 'Auto Party', this.toggle, '', this.enable)}

                <div id="autoparty_types" class="split_content">
                    <div style="padding: 5px;">
                    ${this.getButtonHtml('autoparty_festival', 'Party', this.triggerType, 'festival')}
                    ${this.getButtonHtml('autoparty_procession', 'Parade', this.triggerType, 'procession')}
                    ${this.getButtonHtml('autoparty_theater', 'Theater', this.triggerType, 'theater')} <!-- Add theater button -->
                    </div>

                    <div style="padding: 5px;">
                    ${this.getButtonHtml('autoparty_single', 'Single', this.triggerSingle, 0)}
                    ${this.getButtonHtml('autoparty_multiple', 'All', this.triggerSingle, 1)}
                    </div>
                </div>
            </div>
        `;
    };

    triggerType = (type, swap = true) => {
        if (swap) {
            this.active_types[type] = !this.active_types[type];
            this.storage.save('ap_types', this.active_types);
        }

        if (!this.active_types[type]) uw.$(`#autoparty_${type}`).addClass('disabled');
        else uw.$(`#autoparty_${type}`).removeClass('disabled');

        // If theater type is toggled, save the state
        if (type === 'theater') {
            this.storage.save('ap_types', this.active_types);
        }
    };

    triggerSingle = type => {
        type = !!type;
        if (type) {
            uw.$(`#autoparty_single`).addClass('disabled');
            uw.$(`#autoparty_multiple`).removeClass('disabled');
        } else {
            uw.$(`#autoparty_multiple`).addClass('disabled');
            uw.$(`#autoparty_single`).removeClass('disabled');
        }

        if (this.single != type) {
            this.single = type;
            this.storage.save('ap_single', this.single);
        }
    };

    /* Call to toggle on/off */
    toggle = () => {
        if (!this.enable) {
            uw.$('#auto_party_title').css('filter', 'brightness(100%) saturate(186%) hue-rotate(241deg)');
            this.startInterval();
        } else {
            uw.$('#auto_party_title').css('filter', '');
            clearInterval(this.enable);
            this.enable = null;
        }
        this.storage.save('ap_enable', !!this.enable);
    };

    /* Return list of town with active celebration */
    getCelebrationsList = type => {
        const celebrationModels = uw.MM.getModels().Celebration;
        if (typeof celebrationModels === 'undefined') return [];
        const triumphs = Object.values(celebrationModels)
            .filter(celebration => celebration.attributes.celebration_type === type)
            .map(triumph => triumph.attributes.town_id);
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
        if (!this.single) {
            // single and multiple are swapped...
            for (let town_id in uw.ITowns.towns) {
                if (triumph.includes(parseInt(town_id))) continue;
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

    checkTheater = async () => {
        let max = 10;
        let theater = this.getCelebrationsList('theater');
        if (this.single) {
            for (let town_id in uw.ITowns.towns) {
                if (theater.includes(parseInt(town_id))) continue;
                let town = uw.ITowns.towns[town_id];
                if (town.getBuildings().attributes.theater !== 1) continue;
                let { wood, stone, iron } = town.resources();
                if (wood < 10000 || stone < 12000 || iron < 10000) continue;
                this.makeCelebration('theater', town_id);
                await this.sleep(500);
                max -= 1;
                /* Prevent that the promise is too long */
                if (max <= 0) return;
            }
        } else {
            if (theater.length > 1) return;
            this.makeCelebration('theater');
        }
    };

    main = async () => {
        if (this.active_types['procession']) await this.checkTriumph();
        if (this.active_types['festival']) await this.checkParty();
        if (this.active_types['theater']) await this.checkTheater(); // Check theater celebrations
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
