class MixedBot extends ModernUtil {
    constructor() {
        super();

        if (this.load('enable_autobootcamp')) this.triggerAutoBootcamp();
        if (this.load('bootcamp_use_def')) this.triggerUseDef();
    }

    renderSettings = () => {
        requestAnimationFrame(() => {
            if (this.use_def) {
                $('#autobootcamp_off').addClass('disabled');
                $('#autobootcamp_def').removeClass('disabled');
            } else {
                $('#autobootcamp_def').addClass('disabled');
                $('#autobootcamp_off').removeClass('disabled');
            }
        });

        // ${this.getButtonHtml('autobootcamp_rewards_1', 'Use Rewards', this.triggerAutoBootcamp)}
        // ${this.getButtonHtml('autobootcamp_rewards_2', 'Store', this.triggerAutoBootcamp)}
        return `
        <div class="game_border" style="margin-bottom: 20px">
            ${this.getTitleHtml(
            'auto_autobootcamp',
            'Auto Bootcamp',
            this.triggerAutoBootcamp,
            '',
            this.enable_auto_bootcamp,
        )}
        
        <div id="autobootcamp_lvl_buttons" style="padding: 5px; display: inline-flex;">
            <!-- temp -->
            <div style="margin-right: 40px">
                ${this.getButtonHtml('autobootcamp_off', 'Only off', this.triggerUseDef)}
                ${this.getButtonHtml('autobootcamp_def', 'Off & Def', this.triggerUseDef)}
            </div>
        </div >    
    </div> 
        `;
    };



    /* Call to trigger the usage of the def */
    triggerUseDef = () => {
        this.use_def = !this.use_def;

        if (this.use_def) {
            $('#autobootcamp_off').addClass('disabled');
            $('#autobootcamp_def').removeClass('disabled');
        } else {
            $('#autobootcamp_def').addClass('disabled');
            $('#autobootcamp_off').removeClass('disabled');
        }
        this.save('bootcamp_use_def', this.use_def);
    };

    /* Call to trigger autobootcamp on/off */
    triggerAutoBootcamp = () => {
        if (!this.enable_auto_bootcamp) {
            $('#auto_autobootcamp').css(
                'filter',
                'brightness(100%) saturate(186%) hue-rotate(241deg)',
            );
            this.enable_auto_bootcamp = setInterval(this.mainAutoBootcamp, 4000);
            botConsole.log('Auto Bootcamp -> On');
        } else {
            $('#auto_autobootcamp').css('filter', '');
            clearInterval(this.enable_auto_bootcamp);
            this.enable_auto_bootcamp = null;
            botConsole.log('Auto Bootcamp -> Off');
        }
        this.save('enable_autobootcamp', !!this.enable_auto_bootcamp);
    };

    /* Main loop for autobootcamp */
    mainAutoBootcamp = () => {
        if (this.rewardBootcamp()) return;
        if (this.attackBootcamp()) return;
    };

    attackBootcamp = () => {
        let cooldown = MM.getModelByNameAndPlayerId('PlayerAttackSpot').getCooldownDuration();
        if (cooldown > 0) return false;

        let movements = MM.getModels().MovementsUnits;

        /* Check if there isn't already an active attack */
        if (movements != null) {
            if (Object.keys(movements).length > 0) {
                var attack_list = Object.keys(movements);
                for (var i = 0; i < Object.keys(movements).length; i++) {
                    if (movements[attack_list[i]].attributes.destination_is_attack_spot)
                        return false;
                    if (movements[attack_list[i]].attributes.origin_is_attack_spot) return false;
                }
            }
        }

        // else send the attack with everything in polis
        var units = { ...ITowns.towns[Game.townId].units() };
        delete units.militia;

        if (!this.use_def) {
            delete units.sword;
            delete units.archer;
        }

        var model_url = 'PlayerAttackSpot/' + Game.player_id;
        var data = {
            model_url: model_url,
            action_name: 'attack',
            arguments: units,
        };
        gpAjax.ajaxPost('frontend_bridge', 'execute', data);
        return true;
    };

    rewardBootcamp = () => {
        let model = MM.getModelByNameAndPlayerId('PlayerAttackSpot');

        /* Stop if level is not found */
        if (!model.getLevel()) {
            botConsole.log('Auto Bootcamp not found');
            this.triggerAutoBootcamp();
            return true;
        }

        let hasReward = model.hasReward();
        if (!hasReward) return false;

        let reward = model.getReward();
        if (reward.power_id.includes('instant') && !reward.power_id.includes('favor')) {
            this.useBootcampReward();
            return true;
        }

        if (reward.stashable) {
            this.stashBootcampReward();
        } else {
            this.useBootcampReward();
        }
        return true;
    };
}
