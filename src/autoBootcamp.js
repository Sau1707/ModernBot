class AutoBootcamp extends ModernUtil {
    constructor(console, storage) {
        super(console, storage);

        // Create the buttons for the settings
        this.$title = this.createTitle('auto_autobootcamp', 'Auto Bootcamp', this.toggle, '(click to toggle)');
        this.$button_only_off = this.createButton('autobootcamp_off', 'Only off', this.triggerUseDef);
        this.$button_off_def = this.createButton('autobootcamp_def', 'Off & Def', this.triggerUseDef);
        this.$settings = this.createSettingsHtml();

        // Save the state of the auto bootcamp
        if (this.storage.load('ab_active', false)) this.toggle();
        if (this.storage.load('bootcamp_use_def', false)) this.triggerUseDef();

        // Attach the observer to the window open event
        uw.$.Observer(GameEvents.window.open).subscribe("modernAttackSpot", this.updateWindow);
    }

    updateWindow = (event, handler) => {
        if (!handler.attributes || handler.attributes.window_type !== 'attack_spot') return

        const cid = handler.cid;
        const $window = $(`#window_${cid}`);

        // Add height to the window
        $window.css('height', '660px');

        // Wait for the content to be loaded
        const interval = setInterval(() => {
            const $content = $window.find('.window_content');
            if ($content.length === 0) return;
            clearInterval(interval);
            $content.append(this.$settings);
        }, 100);
    }

    // Add the settings to the window, keep this for backwards compatibility
    settings = () => {
        return ""
    }

    createSettingsHtml = () => {
        // Create the settings box
        const $div = $('<div>')
        $div.css({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px',
        });

        // Add the buttons to the settings box
        $div.append(this.$button_only_off);
        $div.append(this.$button_off_def);

        // Create the box
        const $box = $('<div>')
        $box.addClass('game_border')
        $box.css({
            margin: '20px',
        });
        $box.append(this.$title)
        $box.append($div);

        return $box;
    };

    /* Update the settings title and buttons */
    updateSettings = () => {
        if (this.use_def) {
            this.$button_only_off.addClass('disabled');
            this.$button_off_def.removeClass('disabled');
        } else {
            this.$button_off_def.addClass('disabled');
            this.$button_only_off.removeClass('disabled');
        }

        if (this.enable_auto_bootcamp) this.$title.addClass('enabled');
        else this.$title.removeClass('enabled');
    }

    // Toggle the use of def units
    triggerUseDef = () => {
        this.use_def = !this.use_def;
        this.storage.save('bootcamp_use_def', this.use_def);
        this.updateSettings();
    };

    toggle = () => {
        if (!this.enable_auto_bootcamp) {
            this.enable_auto_bootcamp = setInterval(this.main, 4000);
        } else {
            clearInterval(this.enable_auto_bootcamp);
            this.enable_auto_bootcamp = null;
        }
        this.storage.save('ab_active', !!this.enable_auto_bootcamp);
        this.updateSettings();
    };

    attackBootcamp = () => {
        let cooldown = uw.MM.getModelByNameAndPlayerId('PlayerAttackSpot').getCooldownDuration();
        if (cooldown > 0) return false;

        let { MovementsUnits } = uw.MM.getModels();

        // Check if there is already an active attack
        if (MovementsUnits != null) {
            if (Object.keys(MovementsUnits).length > 0) {
                var attack_list = Object.keys(MovementsUnits);
                for (var i = 0; i < Object.keys(MovementsUnits).length; i++) {
                    if (MovementsUnits[attack_list[i]].attributes.destination_is_attack_spot) return false;
                    if (MovementsUnits[attack_list[i]].attributes.origin_is_attack_spot) return false;
                }
            }
        }

        // Get the units
        var units = { ...uw.ITowns.towns[uw.Game.townId].units() };
        delete units.militia;

        // Remove naval units
        for (let unit in units) {
            if (uw.GameData.units[unit].is_naval) delete units[unit];
        }

        // Remove def units if the setting is off
        if (!this.use_def) {
            delete units.sword;
            delete units.archer;
        }

        // If there are not enough units, return
        // TODO: here check if the units are enough to attack
        if (Object.keys(units).length === 0) return false;

        // Send the attack
        this.postAttackBootcamp(units);

        return true;
    };

    rewardBootcamp = () => {
        let model = uw.MM.getModelByNameAndPlayerId('PlayerAttackSpot');

        // Stop if level is not found
        if (typeof model.getLevel() == 'undefined') {
            this.toggle();
            return true;
        }

        // Check if there is a reward
        let hasReward = model.hasReward();
        if (!hasReward) return false;

        // Check if the reward is instant
        let reward = model.getReward();
        if (reward.power_id.includes('instant') && !reward.power_id.includes('favor')) {
            this.useBootcampReward();
            return true;
        }

        // Check if the reward is stashable
        if (reward.stashable) this.stashBootcampReward();
        else this.useBootcampReward();

        return true;
    };

    /* Main function, call in loop */
    main = () => {
        if (this.rewardBootcamp()) return;
        if (this.attackBootcamp()) return;
    };

    /* Send post request to attack with the given units */
    postAttackBootcamp = units => {
        const data = {
            model_url: `PlayerAttackSpot/${uw.Game.player_id}`,
            action_name: 'attack',
            arguments: units,
        };
        uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
    };

    /* Send requesto to the server to use the reward */
    useBootcampReward = () => {
        const data = {
            model_url: `PlayerAttackSpot/${uw.Game.player_id}`,
            action_name: 'useReward',
            arguments: {},
        };
        uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
    };

    /* Send request to the server to stash the reward */
    stashBootcampReward = () => {
        const data = {
            model_url: `PlayerAttackSpot/${uw.Game.player_id}`,
            action_name: 'stashReward',
            arguments: {},
        };
        uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, 0, {
            error: this.useBootcampReward,
        });
    };
}
