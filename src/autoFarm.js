/* 
    TODO:   
    - Autotrade: fix rurali non ti appartiene, materie prime che possiedi + log in console
    - AutoRuralLevel: still to implement
    - AutoFarm: check for time to start
*/
class AutoFarm extends ModernUtil {
	constructor() {
		super();
		/* Settings Autofarm */
		this.delta_time = 5000;
		this.farm_timing = this.load('enable_autofarm_level', 1);
		if (this.load('enable_autofarm')) this.triggerAutoFarm();

		/* Settings auto_rurals */
		this.rural_level = this.load('enable_autorural_level', 1);
		this.rural_percentual = this.load('enable_autofarm_percentuals', 3);
		if (this.load('enable_autorural_level_active')) this.triggerAutoRuralLevel();
	}

	/* Called when the settings is fired, render the page */
	renderSettings = () => {
		requestAnimationFrame(() => {
			this.setRuralLevel(this.rural_level);
			this.setAutoFarmLevel(this.farm_timing);
			this.setAutoFarmPercentual(this.rural_percentual);
		});

		// ${this.getButtonHtml('farming_lvl_4', '20 min', this.setAutoFarmLevel, 4)}
		// ${this.getButtonHtml('farming_lvl_8', '40 min', this.setAutoFarmLevel, 8)}

		return `
        <div class="game_border" style="margin-bottom: 20px">
            ${this.getTitleHtml(
				'auto_farm',
				'Auto Farm',
				this.triggerAutoFarm,
				'',
				this.enable_auto_farming,
			)}

            <div style="display: inline-flex">
            <div id="farming_lvl_buttons" style="padding: 5px; margin-right: 398px">
                ${this.getButtonHtml('farming_lvl_1', '5 min', this.setAutoFarmLevel, 1)}
                ${this.getButtonHtml('farming_lvl_2', '10 min', this.setAutoFarmLevel, 2)}
            </div>
            <div id="rural_lvl_percentuals" style="padding: 5px">
                ${this.getButtonHtml('rural_percentuals_1', '80%', this.setAutoFarmPercentual, 1)}
                ${this.getButtonHtml('rural_percentuals_2', '90%', this.setAutoFarmPercentual, 2)}
                ${this.getButtonHtml('rural_percentuals_3', '100%', this.setAutoFarmPercentual, 3)}
            </div>
            </div>    
        </div> 

        <div class="game_border" style="margin-bottom: 20px;">
                ${this.getTitleHtml(
					'auto_rural_level',
					'Auto Rural level',
					this.triggerAutoRuralLevel,
					'',
					this.enable_auto_rural,
				)}
            
            <div id="rural_lvl_buttons" style="padding: 5px">
                ${this.getButtonHtml('rural_lvl_1', 'lvl 1', this.setRuralLevel, 1)}
                ${this.getButtonHtml('rural_lvl_2', 'lvl 2', this.setRuralLevel, 2)}
                ${this.getButtonHtml('rural_lvl_3', 'lvl 3', this.setRuralLevel, 3)}
                ${this.getButtonHtml('rural_lvl_4', 'lvl 4', this.setRuralLevel, 4)}
                ${this.getButtonHtml('rural_lvl_5', 'lvl 5', this.setRuralLevel, 5)}
                ${this.getButtonHtml('rural_lvl_6', 'lvl 6', this.setRuralLevel, 6)}
            </div>
        </div>

        <div class="game_border">
            <div class="game_border_top"></div>
            <div class="game_border_bottom"></div>
            <div class="game_border_left"></div>
            <div class="game_border_right"></div>
            <div class="game_border_corner corner1"></div>
            <div class="game_border_corner corner2"></div>
            <div class="game_border_corner corner3"></div>
            <div class="game_border_corner corner4"></div>
            <div class="game_header bold" style="position: relative; cursor: pointer" onclick="window.autoFarm.triggerTradeWithAllRurals()"> 
            <span style="z-index: 10; position: relative;">Auto Trade resouces </span>
            <div id="res_progress_bar" class="progress_bar_auto"></div>
            <div style="position: absolute; right: 10px; top: 4px; font-size: 10px; z-index: 10"> (click to stop) </div>
            <span class="command_count"></span></div>

            <div id="autotrade_lvl_buttons" style="padding: 5px">
                <!-- 1 -->
                ${this.getButtonHtml(
					'autotrade_lvl_1',
					'Iron',
					this.triggerTradeWithAllRurals,
					'iron',
				)}

                ${this.getButtonHtml(
					'autotrade_lvl_2',
					'Stone',
					this.triggerTradeWithAllRurals,
					'stone',
				)}

                ${this.getButtonHtml(
					'autotrade_lvl_3',
					'Wood',
					this.triggerTradeWithAllRurals,
					'wood',
				)}
            </div>
            
        </div>
        `;
	};

	/* generate the list containing 1 polis per island */
	generateList = () => {
		let islands_list = [];
		let polis_list = [];

		let town_list = MM.getOnlyCollectionByName('Town').models;

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

	/* 
        Autofarm
    */
	triggerAutoFarm = () => {
		const buttonHtml =
			'<div class="divider"id="autofarm_timer_divider" ></div><div onclick="window.autoFarm.triggerAutoFarm()" class="activity" id="autofarm_timer" style="filter: brightness(110%) sepia(100%) hue-rotate(100deg) saturate(1500%) contrast(0.8); background: url(https://i.ibb.co/gm8NDFS/backgound-timer.png); height: 26px; width: 40px"><p id="autofarm_timer_p" style="z-index: 6; top: -8px; position: relative; font-weight: bold;"></p></div>';

		if (!this.enable_auto_farming) {
			$('#auto_farm').css('filter', 'brightness(100%) saturate(186%) hue-rotate(241deg)');
			let btbutton = document.getElementById('autofarm_timer');
			if (btbutton == null) {
				$('.tb_activities, .toolbar_activities').find('.middle').append(buttonHtml);
			}
			this.lastTime = Date.now();
			this.timer = 0; // TODO: check if it's really 0
			this.enable_auto_farming = setInterval(this.mainFarmBot, 1000);
			botConsole.log('Auto Farm -> On');
		} else {
			$('#autofarm_timer').remove();
			$('#autofarm_timer_divider').remove();
			$('#auto_farm').css('filter', '');
			clearInterval(this.enable_auto_farming);
			this.enable_auto_farming = null;
			botConsole.log('Auto Farm -> Off');
		}
		this.save('enable_autofarm', !!this.enable_auto_farming);
	};

	setAutoFarmLevel = (n) => {
		let box = document.getElementById('farming_lvl_buttons');
		let buttons = box.getElementsByClassName('button_new');
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].classList.add('disabled');
		}
		$(`#farming_lvl_${n}`).removeClass('disabled');
		this.farm_timing = n;
		this.save('enable_autofarm_level', n);
	};

	setAutoFarmPercentual = (n) => {
		let box = document.getElementById('rural_lvl_percentuals');
		let buttons = box.getElementsByClassName('button_new');
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].classList.add('disabled');
		}
		$(`#rural_percentuals_${n}`).removeClass('disabled');
		this.rural_percentual = n;
		this.save('enable_autofarm_percentuals', n);
	};

	getNextCollection = () => {
		let models = MM.getCollections().FarmTownPlayerRelation[0].models;
		let lootable_at_values = {};
		for (let model of models) {
			let lootable_time = model.attributes.lootable_at;
			if (lootable_at_values[lootable_time]) {
				lootable_at_values[lootable_time] += 1;
			} else {
				lootable_at_values[lootable_time] = 1;
			}
		}
		let max_value = 0;
		let max_lootable_time = 0;
		for (let lootable_time in lootable_at_values) {
			if (lootable_at_values[lootable_time] > max_value) {
				max_value = lootable_at_values[lootable_time];
				max_lootable_time = lootable_time;
			}
		}
		let seconds = max_lootable_time - Math.floor(Date.now() / 1000);
		if (seconds < 0) return 0;
		return seconds * 1000;
	};

	updateTimer = () => {
		const currentTime = Date.now();
		this.timer -= currentTime - this.lastTime;
		this.lastTime = currentTime;

		var bt = document.getElementById('autofarm_timer_p');
		if (this.timer > 0) bt.innerHTML = parseInt(this.timer / 1000);
		else bt.innerHTML = '0';
	};

	mainFarmBot = () => {
		/* Fix time if out ot timing */
		// let next = this.getNextCollection();
		// if (this.timer + 2 * this.delta_time < next) {
		// 	this.timer = next + Math.floor(Math.random() * this.delta_time);
		// }

		/* Claim resouces of timer has passed */
		if (this.timer < 1) {
			let Polislist = this.generateList();

			/* Check if the percentual has reach */
			let total = {
				wood: 0,
				stone: 0,
				iron: 0,
				storage: 0,
			};

			for (let town_id of Polislist) {
				let town = ITowns.towns[town_id];
				let resources = town.resources();
				total.wood += resources.wood;
				total.stone += resources.stone;
				total.iron += resources.iron;
				total.storage += resources.storage;
			}

			let minResource = Math.min(total.wood, total.stone, total.iron);
			let min_percentual = minResource / total.storage;
			/* If the max percentual it's reached stop and wait for 30 seconds */
			if (this.rural_percentual == 3 && min_percentual > 0.99) {
				this.timer = 30000;
				this.updateTimer();
				return;
			}
			if (this.rural_percentual == 2 && min_percentual > 0.9) {
				this.timer = 30000;
				this.updateTimer();
				return;
			}
			if (this.rural_percentual == 1 && min_percentual > 0.8) {
				this.timer = 30000;
				this.updateTimer();
				return;
			}

			this.claim(Polislist);
			botConsole.log('Claimed all rurals');
			let rand = Math.floor(Math.random() * this.delta_time);
			this.timer = this.farm_timing * 300000 + rand;
			setTimeout(() => WMap.removeFarmTownLootCooldownIconAndRefreshLootTimers(), 2000);
		}

		/* update the timer */
		this.updateTimer();
	};

	/* 
        Auto rural level
    */
	setRuralLevel = (n) => {
		let box = document.getElementById('rural_lvl_buttons');
		let buttons = box.getElementsByClassName('button_new');
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].classList.add('disabled');
		}
		$(`#rural_lvl_${n}`).removeClass('disabled');
		this.rural_level = n;
		this.save('enable_autorural_level', this.rural_level);
	};

	triggerAutoRuralLevel = () => {
		if (!this.enable_auto_rural) {
			$('#auto_rural_level').css(
				'filter',
				'brightness(100%) saturate(186%) hue-rotate(241deg)',
			);
			this.enable_auto_rural = setInterval(this.mainAutoRuralLevel, 20000);
			botConsole.log('Auto Rural Level -> On');
		} else {
			$('#auto_rural_level').css('filter', '');
			botConsole.log('Auto Rural Level -> Off');
			clearInterval(this.enable_auto_rural);
			this.enable_auto_rural = null;
		}
		this.save('enable_autorural_level_active', !!this.enable_auto_rural);
	};

	mainAutoRuralLevel = async () => {
		let player_relation_models = MM.getOnlyCollectionByName('FarmTownPlayerRelation').models;
		let farm_town_models = MM.getOnlyCollectionByName('FarmTown').models;

		/* Get array with all locked rurals */
		let locked = [];
		player_relation_models.forEach((model) => {
			if (model.attributes.relation_status == 0) locked.push(model.attributes);
		});

		/* Get killpoints */
		let killpoints = MM.getModelByNameAndPlayerId('PlayerKillpoints').attributes;
		let available = killpoints.att + killpoints.def - killpoints.used;
		let unlocked = player_relation_models.length - locked.length;

		/* If some rurals still have to be unlocked */
		if (locked.length > 0) {
			/* The first 5 rurals have discount */
			if (unlocked == 0 && available < 2) return;
			if (unlocked == 1 && available < 8) return;
			if (unlocked == 2 && available < 10) return;
			if (unlocked == 3 && available < 30) return;
			if (unlocked == 4 && available < 50) return;
			if (unlocked >= 5 && available < 100) return;

			let towns = this.generateList();
			for (let town_id of towns) {
				let town = ITowns.towns[town_id];
				let x = town.getIslandCoordinateX(),
					y = town.getIslandCoordinateY();

				for (let farmtown of farm_town_models) {
					if (farmtown.attributes.island_x != x || farmtown.attributes.island_y != y)
						continue;

					for (let relation of locked) {
						if (farmtown.attributes.id != relation.farm_town_id) continue;
						this.unlockRural(town_id, relation.farm_town_id, relation.id);
						botConsole.log(
							`Island ${farmtown.attributes.island_xy}: unlocked ${farmtown.attributes.name}`,
						);
						return;
					}
				}
			}
		} else {
			/* else check each level once at the time */
			let towns = this.generateList();

			for (let level = 1; level < this.rural_level; level++) {
				if (level == 1 && available < 1) return;
				if (level == 2 && available < 5) return;
				if (level == 3 && available < 25) return;
				if (level == 4 && available < 50) return;
				if (level == 5 && available < 100) return;

				for (let town_id of towns) {
					let town = ITowns.towns[town_id];
					let x = town.getIslandCoordinateX(),
						y = town.getIslandCoordinateY();

					for (let farmtown of farm_town_models) {
						if (farmtown.attributes.island_x != x || farmtown.attributes.island_y != y)
							continue;

						for (let relation of player_relation_models) {
							if (farmtown.attributes.id != relation.attributes.farm_town_id)
								continue;
							if (relation.attributes.expansion_at) continue;
							if (relation.attributes.expansion_stage > level) continue;
							this.upgradeRural(
								town_id,
								relation.attributes.farm_town_id,
								relation.attributes.id,
							);
							botConsole.log(
								`Island ${farmtown.attributes.island_xy}: upgraded ${farmtown.attributes.name}`,
							);
							return;
						}
					}
				}
			}
		}

		/* Auto turn off when the level is reached */
		this.triggerAutoRuralLevel();
	};

	/* 
        Trade with all rurals
    */
	triggerTradeWithAllRurals = async (resouce) => {
		if (resouce) {
			/* Set button disabled */
			if ($(`#autotrade_lvl_${i}`).hasClass('disabled')) return;
			[1, 2, 3, 4].forEach((i) => {
				$(`#autotrade_lvl_${i}`).addClass('disabled').css('cursor', 'auto');
			});
			this.trade_resouce = resouce;

			/* Set the current trade to polis at index 0 */
			this.total_trade = Object.keys(ITowns.towns).length;
			this.done_trade = 0;

			/* Set the interval */
			this.auto_trade_resouces_loop = setInterval(this.mainTradeLoop, 1500);
		} else {
			/* Clear the interval */
			clearInterval(this.auto_trade_resouces_loop);

			/* Re-enable buttons and set progress to 0 */
			$('#res_progress_bar').css('width', 0);
			[1, 2, 3, 4].forEach((i) => {
				$(`#autotrade_lvl_${i}`).removeClass('disabled').css('cursor', 'pointer');
			});
		}
	};

	tradeWithRural = async (polis_id) => {
		let town = ITowns.towns[polis_id];
		if (town.getAvailableTradeCapacity() < 3000) return;
		//if (this.check_for_hide && town.getBuildings().attributes.hide < 10) return;

		let farm_town_models = MM.getOnlyCollectionByName('FarmTown').models;
		let player_relation_models = MM.getOnlyCollectionByName('FarmTownPlayerRelation').models;

		/* Create list with all the farmtown in current island polis */
		let farmtown_in_island = [];
		let x = town.getIslandCoordinateX(),
			y = town.getIslandCoordinateY();
		let resources = town.resources();

		farm_town_models.forEach((farmtown) => {
			if (farmtown.attributes.island_x != x || farmtown.attributes.island_y != y) return;
			if (farmtown.attributes.resource_offer != this.trade_resouce) return;
			if (resources[farmtown.attributes.resource_demand] < 3000) return;

			player_relation_models.forEach((relation) => {
				if (farmtown.attributes.id != relation.attributes.farm_town_id) return;
				//if (relation.attributes.current_trade_ratio < 1.2) return;
				farmtown_in_island.push(relation);
				return;
			});
		});

		for (let tradable of farmtown_in_island) {
			if (town.getAvailableTradeCapacity() < 3000) return;

			this.tradeRuralPost(
				tradable.attributes.farm_town_id,
				tradable.attributes.id,
				town.getAvailableTradeCapacity(),
				town.id,
			);
			await this.sleep(750);
		}
	};

	mainTradeLoop = async () => {
		/* perform trade with current index */
		let towns = Object.keys(ITowns.towns);
		await this.tradeWithRural(towns[this.done_trade]);

		/* update progress bar */
		this.done_trade += 1;
		$('#res_progress_bar').css('width', `${(this.done_trade / this.total_trade) * 100}%`);

		/* If last polis, then trigger to stop */
		if (this.done_trade == this.total_trade) this.triggerTradeWithAllRurals();
	};
}
