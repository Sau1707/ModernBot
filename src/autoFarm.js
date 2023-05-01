/* 
    TODO:   
    - Autotrade: fix rurali non ti appartiene, materie prime che possiedi + log in console
    - AutoRuralLevel: still to implement
    - AutoFarm: check for time to start
*/
class AutoFarm extends ModernUtil {
	BUTTONHTML =
		'<div class="divider"id="autofarm_timer_divider" ></div><div onclick="window.modernBot.autoFarm.toggle()" class="activity" id="autofarm_timer" style="filter: brightness(110%) sepia(100%) hue-rotate(100deg) saturate(1500%) contrast(0.8); background: url(https://i.ibb.co/gm8NDFS/backgound-timer.png); height: 26px; width: 40px"><p id="autofarm_timer_p" style="z-index: 6; top: -8px; position: relative; font-weight: bold;"></p></div>';

	YELLOW = 'brightness(294%) sepia(100%) hue-rotate(15deg) saturate(1000%) contrast(0.8)';
	GREEN = 'brightness(110%) sepia(100%) hue-rotate(100deg) saturate(1500%) contrast(0.8)';

	TIMINGS = {
		1: 300000,
		2: 600000,
		3: 1200000,
		4: 2400000,
	};

	constructor(c, s) {
		super(c, s);

		this.delta_time = 10000;
		this.timing = this.storage.load('af_level', 1);
		this.percentual = this.storage.load('af_percentuals', 3);
		if (this.storage.load('af', false)) {
			this.lastTime = Date.now();
			this.timer = 0; // TODO: check if it's really 0
			this.active = setInterval(this.main, 1000);
		}

		this.polislist = this.generateList();
	}

	settings = () => {
		requestAnimationFrame(() => {
			this.setAutoFarmLevel(this.timing);
			this.setAutoFarmPercentual(this.percentual);
			if (this.active) {
				uw.$('#auto_farm').css('filter', 'brightness(100%) saturate(186%) hue-rotate(241deg)');
			}
		});

		return `
            <div class="game_border" style="margin-bottom: 20px">
                ${this.getTitleHtml('auto_farm', 'Auto Farm', this.toggle, '', this.enable_auto_farming)}
                <div class="split_content">
                <div id="farming_lvl_buttons" style="padding: 5px;">
                    ${this.getButtonHtml('farming_lvl_1', '5 min', this.setAutoFarmLevel, 1)}
                    ${this.getButtonHtml('farming_lvl_2', '10 min', this.setAutoFarmLevel, 2)}
                    ${this.getButtonHtml('farming_lvl_3', '20 min', this.setAutoFarmLevel, 3)}
                    ${this.getButtonHtml('farming_lvl_4', '40 min', this.setAutoFarmLevel, 4)}
                </div>
                <div id="rural_lvl_percentuals" style="padding: 5px">
                    ${this.getButtonHtml('percentuals_1', '80%', this.setAutoFarmPercentual, 1)}
                    ${this.getButtonHtml('percentuals_2', '90%', this.setAutoFarmPercentual, 2)}
                    ${this.getButtonHtml('percentuals_3', '100%', this.setAutoFarmPercentual, 3)}
                </div>
                </div>    
            </div> 
        `;
	};

	/* generate the list containing 1 polis per island */
	generateList = () => {
		const islandsList = new Set();
		const polisList = [];

		const towns = uw.MM.getOnlyCollectionByName('Town').models;
		for (const town of towns) {
			const { on_small_island, island_id, id } = town.attributes;
			if (on_small_island) continue;
			if (islandsList.has(island_id)) continue;
			islandsList.add(island_id);
			polisList.push(id);
		}

		return polisList;
	};

	toggle = () => {
		if (this.active) {
			uw.$('#autofarm_timer').remove();
			uw.$('#autofarm_timer_divider').remove();
			uw.$('#auto_farm').css('filter', '');
			clearInterval(this.active);
			this.active = null;
		} else {
			uw.$('#auto_farm').css('filter', 'brightness(100%) saturate(186%) hue-rotate(241deg)');
			this.lastTime = Date.now();
			this.timer = 0; // TODO: check if it's really 0
			this.active = setInterval(this.main, 1000);
		}
		this.storage.save('af', !!this.active);
	};

	setAutoFarmLevel = n => {
		uw.$('#farming_lvl_buttons .button_new').addClass('disabled');
		uw.$(`#farming_lvl_${n}`).removeClass('disabled');
		if (this.timing != n) {
			this.timing = n;
			this.storage.save('af_level', n);
			const rand = Math.floor(Math.random() * this.delta_time);
			this.timer = this.TIMINGS[this.timing] + rand;
		}
	};

	setAutoFarmPercentual = n => {
		const box = uw.$('#rural_lvl_percentuals');
		box.find('.button_new').addClass('disabled');
		uw.$(`#percentuals_${n}`).removeClass('disabled');
		if (this.percentual != n) {
			this.percentual = n;
			this.storage.save('af_percentuals', n);
		}
	};

	/* return the time before the next collection */
	getNextCollection = () => {
		const { models } = uw.MM.getCollections().FarmTownPlayerRelation[0];

		const lootCounts = {};
		for (const model of models) {
			const { lootable_at } = model.attributes;
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

	/* Call to update the timer */
	updateTimer = () => {
		const currentTime = Date.now();
		this.timer -= currentTime - this.lastTime;
		this.lastTime = currentTime;

		/* Add timer of not there */
		const timerDisplay = uw.$('#autofarm_timer_p');
		if (!timerDisplay.length) uw.$('.tb_activities, .toolbar_activities').find('.middle').append(this.BUTTONHTML);
		else {
			timerDisplay.html(Math.round(Math.max(this.timer, 0) / 1000));
		}

		const isCaptainActive = uw.GameDataPremium.isAdvisorActivated('captain');
		uw.$('#autofarm_timer').css('filter', isCaptainActive ? this.GREEN : this.YELLOW);
	};

	claim = async () => {
		const isCaptainActive = uw.GameDataPremium.isAdvisorActivated('captain');
		if (isCaptainActive) {
			await this.fakeOpening();
			await this.sleep(Math.random() * 2000 + 1000); // random between 1 second and 3
			await this.fakeSelectAll();
			await this.sleep(Math.random() * 2000 + 1000);
			if (this.timing <= 2) await this.claimMultiple(300, 600);
			if (this.timing > 2) await this.claimMultiple(1200, 2400);
			await this.fakeUpdate();
		} else {
			const { models: player_relation_models } = uw.MM.getOnlyCollectionByName('FarmTownPlayerRelation');
			const { models: farm_town_models } = uw.MM.getOnlyCollectionByName('FarmTown');
			const now = Math.floor(Date.now() / 1000);
			let max = 60;
			for (let town_id of this.polislist) {
				let town = uw.ITowns.towns[town_id];
				let x = town.getIslandCoordinateX();
				let y = town.getIslandCoordinateY();

				for (let farmtown of farm_town_models) {
					if (farmtown.attributes.island_x != x) continue;
					if (farmtown.attributes.island_y != y) continue;

					for (let relation of player_relation_models) {
						if (farmtown.attributes.id != relation.attributes.farm_town_id) continue;
						if (relation.attributes.relation_status !== 1) continue;
						if (relation.attributes.lootable_at !== null && now < relation.attributes.lootable_at) continue;

						this.claimSingle(town_id, relation.attributes.farm_town_id, relation.id);
						await this.sleep(500);
						if (!max) return;
						else max -= 1;
					}
				}
			}
		}

		setTimeout(() => uw.WMap.removeFarmTownLootCooldownIconAndRefreshLootTimers(), 2000);
	};

	/* Return the total resouces of the polis in the list */
	getTotalResources = () => {
		let total = {
			wood: 0,
			stone: 0,
			iron: 0,
			storage: 0,
		};

		for (let town_id of this.polislist) {
			const town = uw.ITowns.getTown(town_id);
			const { wood, stone, iron, storage } = town.resources();
			total.wood += wood;
			total.stone += stone;
			total.iron += iron;
			total.storage += storage;
		}

		return total;
	};

	main = async () => {
		/* Claim resouces of timer has passed */
		if (this.timer < 1) {
			/* Check if the percentual has reach */
			const { wood, stone, iron, storage } = this.getTotalResources();
			const minResource = Math.min(wood, stone, iron);
			const min_percentual = minResource / storage;

			/* If the max percentual it's reached stop and wait for 30 seconds */
			if (this.percentual == 3 && min_percentual > 0.99) {
				this.timer = 30000;
				requestAnimationFrame(this.updateTimer);
				return;
			}
			if (this.percentual == 2 && min_percentual > 0.9) {
				this.timer = 30000;
				requestAnimationFrame(this.updateTimer);
				return;
			}
			if (this.percentual == 1 && min_percentual > 0.8) {
				this.timer = 30000;
				requestAnimationFrame(this.updateTimer);
				return;
			}

			const rand = Math.floor(Math.random() * this.delta_time);
			this.timer = this.TIMINGS[this.timing] + rand;

			await this.claim();
		}

		/* update the timer */
		this.updateTimer();
	};

	claimSingle = (town_id, farm_town_id, relation_id) => {
		const data = {
			model_url: `FarmTownPlayerRelation/${relation_id}`,
			action_name: 'claim',
			arguments: {
				farm_town_id: farm_town_id,
				type: 'resources',
				option: 1,
			},
			town_id: town_id,
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
	};

	claimMultiple = (base = 300, boost = 600) =>
		new Promise((myResolve, myReject) => {
			let data = {
				towns: this.polislist,
				time_option_base: base,
				time_option_booty: boost,
				claim_factor: 'normal',
			};
			uw.gpAjax.ajaxPost('farm_town_overviews', 'claim_loads_multiple', data, false, () => myResolve());
		});

	/* Pretent that the window it's opening */
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
			const { booty } = town.getResearches().attributes;
			const { trade_office } = town.getBuildings().attributes;
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
