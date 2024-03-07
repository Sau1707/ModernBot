class AutoRuralLevel extends ModernUtil {
	constructor(c, s) {
		super(c, s);

		this.rural_level = this.storage.load('enable_autorural_level', 1);
		if (this.storage.load('enable_autorural_level_active')) {
			this.enable = setInterval(this.main, 2000);
		}

		// Add observer to change the look of the island
		$.Observer(GameEvents.window.open).subscribe('modernSenate', this.updateIsland);
	}

	settings = () => {
		requestAnimationFrame(() => {
			this.setRuralLevel(this.rural_level);
		});

		return `
        <div class="game_border" style="margin-bottom: 20px;">
            ${this.getTitleHtml('auto_rural_level', 'Auto Rural level', this.toggle, '', this.enable)}

            <div id="rural_lvl_buttons" style="padding: 5px">
                ${this.getButtonHtml('rural_lvl_1', 'lvl 1', this.setRuralLevel, 1)}
                ${this.getButtonHtml('rural_lvl_2', 'lvl 2', this.setRuralLevel, 2)}
                ${this.getButtonHtml('rural_lvl_3', 'lvl 3', this.setRuralLevel, 3)}
                ${this.getButtonHtml('rural_lvl_4', 'lvl 4', this.setRuralLevel, 4)}
                ${this.getButtonHtml('rural_lvl_5', 'lvl 5', this.setRuralLevel, 5)}
                ${this.getButtonHtml('rural_lvl_6', 'lvl 6', this.setRuralLevel, 6)}
            </div>
        </div>`;
	};

	/* Change the look of the island */
	updateIsland = (event, handler) => {
		if (handler.context !== 'island') return;

		// Compute the id of the window
		const id = `gpwnd_${handler.wnd.getID()}`;

		const updateView = () => {
			const interval = setInterval(() => {
				const $window = $('#' + id);
				if ($window.length === 0) return;

				// Hide the commander if it's there
				const $commander = $window.find('.center1');
				if ($commander.length > 0) $commander.hide();

				// Add the setting for the rural level
				let $newElement = $('<div></div>').append(this.settings());
				$newElement.css({
					position: $commander.css('position'),
					left: $commander.css('left') - 20,
					top: $commander.css('top'),
				});
				$commander.after($newElement);

				// Add the buttons for the quick trade
				//const $rurals = $window.find(".island_info_towns.island_info_right")

				// $("[class*='farm_town_el_']").each(function() {
				//     // Get the class name
				//     var classNames = $(this).attr('class').split(/\s+/);
				//     // Find the specific class and extract the numeric part
				//     $.each(classNames, function(i, className) {
				//         if (className.startsWith('farm_town_el_')) {
				//             var numericID = className.match(/\d+/)[0]; // Extract the numeric part
				//             console.log(numericID); // Print the numeric ID
				//         }
				//     });
				// });

				clearInterval(interval);
			}, 100);
		};

		updateView();
	};

	/* generate the list containing 1 polis per island */
	generateList = () => {
		let islands_list = [];
		let polis_list = [];

		let town_list = uw.MM.getOnlyCollectionByName('Town').models;

		for (let town of town_list) {
			if (town.attributes.on_small_island) continue;
			let { island_id, id } = town.attributes;
			if (!islands_list.includes(island_id)) {
				islands_list.push(island_id);
				polis_list.push(id);
			}
		}

		return polis_list;
	};

	setRuralLevel = n => {
		// Disable all buttons and enable the selected one
		uw.$('[id="rural_lvl_buttons"] .button_new').addClass('disabled');
		uw.$(`[id="rural_lvl_${n}"]`).removeClass('disabled');

		// Save the setting
		if (this.rural_level != n) {
			this.rural_level = n;
			this.storage.save('enable_autorural_level', this.rural_level);
		}
	};

	toggle = () => {
		if (!this.enable) {
			uw.$('[id="auto_rural_level"]').css('filter', 'brightness(100%) saturate(186%) hue-rotate(241deg)');
			this.enable = setInterval(this.main, 20000);
		} else {
			uw.$('[id="auto_rural_level"]').css('filter', '');
			clearInterval(this.enable);
			this.enable = null;
		}
		this.storage.save('enable_autorural_level_active', !!this.enable);
	};

	main = async () => {
		let player_relation_models = uw.MM.getOnlyCollectionByName('FarmTownPlayerRelation').models;
		let farm_town_models = uw.MM.getOnlyCollectionByName('FarmTown').models;
		let killpoints = uw.MM.getModelByNameAndPlayerId('PlayerKillpoints').attributes;

		/* Get array with all locked rurals */
		const locked = player_relation_models.filter(model => model.attributes.relation_status === 0);

		/* Get killpoints */
		let available = killpoints.att + killpoints.def - killpoints.used;
		let unlocked = player_relation_models.length - locked.length;

		/* If some rurals still have to be unlocked */
		if (locked.length > 0) {
			/* The first 5 rurals have discount */
			const discounts = [2, 8, 10, 30, 50, 100];
			if (unlocked < discounts.length && available < discounts[unlocked]) return;
			if (unlocked > discounts.length && available < 100) return;

			let towns = this.generateList();
			for (let town_id of towns) {
				let town = uw.ITowns.towns[town_id];
				let x = town.getIslandCoordinateX(),
					y = town.getIslandCoordinateY();

				for (let farmtown of farm_town_models) {
					if (farmtown.attributes.island_x != x || farmtown.attributes.island_y != y) continue;

					for (let relation of locked) {
						if (farmtown.attributes.id != relation.attributes.farm_town_id) continue;
						this.unlockRural(town_id, relation.attributes.farm_town_id, relation.id);
						return;
					}
				}
			}
		} else {
			/* else check each level once at the time */
			let towns = this.generateList();
			let expansion = false;
			const levelCosts = [1, 5, 25, 50, 100];
			for (let level = 1; level < this.rural_level; level++) {
				if (available < levelCosts[level - 1]) return;

				for (let town_id of towns) {
					let town = uw.ITowns.towns[town_id];
					let x = town.getIslandCoordinateX();
					let y = town.getIslandCoordinateY();

					for (let farmtown of farm_town_models) {
						if (farmtown.attributes.island_x != x) continue;
						if (farmtown.attributes.island_y != y) continue;

						for (let relation of player_relation_models) {
							if (farmtown.attributes.id != relation.attributes.farm_town_id) {
								continue;
							}
							if (relation.attributes.expansion_at) {
								expansion = true;
								continue;
							}
							if (relation.attributes.expansion_stage > level) continue;
							this.upgradeRural(town_id, relation.attributes.farm_town_id, relation.attributes.id);
							this.console.log(`Island ${farmtown.attributes.island_xy}: upgraded ${farmtown.attributes.name}`);
							return;
						}
					}
				}
			}

			if (expansion) return;
		}

		/* Auto turn off when the level is reached */
		this.toggle();
	};

	/* Post requests */
	unlockRural = (town_id, farm_town_id, relation_id) => {
		let data = {
			model_url: `FarmTownPlayerRelation/${relation_id}`,
			action_name: 'unlock',
			arguments: {
				farm_town_id: farm_town_id,
			},
			town_id: town_id,
		};
		modernBot.taskQueue.enqueue(events.farm.unlock, data);
		// uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
	};

	upgradeRural = (town_id, farm_town_id, relation_id) => {
		let data = {
			model_url: `FarmTownPlayerRelation/${relation_id}`,
			action_name: 'upgrade',
			arguments: {
				farm_town_id: farm_town_id,
			},
			town_id: town_id,
		};
		modernBot.taskQueue.enqueue(events.farm.upgrade, data);
		// uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
	};
}
