class AutoBootcamp extends ModernUtil {
	constructor(c, s) {
		super(c, s);

		if (this.storage.load('ab_active', false)) this.toggle();
		if (this.storage.load('bootcamp_use_def', false)) this.triggerUseDef();
	}

	settings = () => {
		requestAnimationFrame(() => {
			if (this.use_def) {
				uw.$('#autobootcamp_off').addClass('disabled');
				uw.$('#autobootcamp_def').removeClass('disabled');
			} else {
				uw.$('#autobootcamp_def').addClass('disabled');
				uw.$('#autobootcamp_off').removeClass('disabled');
			}
		});

		return `
        <div class="game_border" style="margin-bottom: 20px">
            ${this.getTitleHtml('auto_autobootcamp', 'Auto Bootcamp', this.toggle, '', this.enable_auto_bootcamp)}
        
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

	triggerUseDef = () => {
		this.use_def = !this.use_def;
		if (this.use_def) {
			uw.$('#autobootcamp_off').addClass('disabled');
			uw.$('#autobootcamp_def').removeClass('disabled');
		} else {
			uw.$('#autobootcamp_def').addClass('disabled');
			uw.$('#autobootcamp_off').removeClass('disabled');
		}
		this.storage.save('bootcamp_use_def', this.use_def);
	};

	toggle = () => {
		if (!this.enable_auto_bootcamp) {
			uw.$('#auto_autobootcamp').css('filter', 'brightness(100%) saturate(186%) hue-rotate(241deg)');
			this.enable_auto_bootcamp = setInterval(this.main, 4000);
			this.console.log('Auto Bootcamp -> On');
		} else {
			uw.$('#auto_autobootcamp').css('filter', '');
			clearInterval(this.enable_auto_bootcamp);
			this.enable_auto_bootcamp = null;
			this.console.log('Auto Bootcamp -> Off');
		}
		this.storage.save('ab_active', !!this.enable_auto_bootcamp);
	};

	attackBootcamp = () => {
		let cooldown = uw.MM.getModelByNameAndPlayerId('PlayerAttackSpot').getCooldownDuration();
		if (cooldown > 0) return false;

		let { MovementsUnits } = uw.MM.getModels();

		/* Check if there isn't already an active attack */
		if (MovementsUnits != null) {
			if (Object.keys(MovementsUnits).length > 0) {
				var attack_list = Object.keys(MovementsUnits);
				for (var i = 0; i < Object.keys(MovementsUnits).length; i++) {
					if (MovementsUnits[attack_list[i]].attributes.destination_is_attack_spot) {
						return false;
					}
					if (MovementsUnits[attack_list[i]].attributes.origin_is_attack_spot) {
						return false;
					}
				}
			}
		}

		var units = { ...uw.ITowns.towns[uw.Game.townId].units() };

		delete units.militia;
		for (let unit in units) {
			if (uw.GameData.units[unit].is_naval) delete units[unit];
		}

		if (!this.use_def) {
			delete units.sword;
			delete units.archer;
		}

		/* Stop if no units are avalable anymore */
		if (Object.keys(units).length === 0) {
			this.toggle();
			return;
		}

		this.postAttackBootcamp(units);
		return true;
	};

	rewardBootcamp = () => {
		let model = uw.MM.getModelByNameAndPlayerId('PlayerAttackSpot');

		/* Stop if level is not found */
		if (typeof model.getLevel() == 'undefined') {
			this.console.log('Auto Bootcamp not found');
			this.toggle();
			return true;
		}

		let hasReward = model.hasReward();
		if (!hasReward) return false;

		let reward = model.getReward();
		if (reward.power_id.includes('instant') && !reward.power_id.includes('favor')) {
			this.useBootcampReward();
			return true;
		}

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
		var data = {
			model_url: `PlayerAttackSpot/${uw.Game.player_id}`,
			action_name: 'attack',
			arguments: units,
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
	};

	/* Send requesto to the server to use the reward */
	useBootcampReward = () => {
		var data = {
			model_url: `PlayerAttackSpot/${uw.Game.player_id}`,
			action_name: 'useReward',
			arguments: {},
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
	};

	/* Send request to the server to stash the reward */
	stashBootcampReward = () => {
		var data = {
			model_url: `PlayerAttackSpot/${uw.Game.player_id}`,
			action_name: 'stashReward',
			arguments: {},
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, 0, {
			error: this.useBootcampReward,
		});
	};
}
