class AutoTrain extends ModernUtil {
	REQUIREMENTS = {
		sword: {},
		archer: { research: 'archer' },
		hoplite: { research: 'hoplite' },
		slinger: { research: 'slinger' },
		catapult: { research: 'catapult' },
		rider: { research: 'rider', building: 'barracks', level: 10 },
		chariot: { research: 'chariot', building: 'barracks', level: 15 },
		big_transporter: { building: 'docks', level: 1 },
		small_transporter: { research: 'small_transporter', building: 'docks', level: 1 },
		bireme: { research: 'bireme', building: 'docks', level: 1 },
		attack_ship: { research: 'attack_ship', building: 'docks', level: 1 },
		trireme: { research: 'trireme', building: 'docks', level: 1 },
		colonize_ship: { research: 'colonize_ship', building: 'docks', level: 10 },
	};

	constructor(console) {
		super();
		this.console = console;

		this.city_troops = this.load('city_troops', {});
		this.single_cicle = this.load('autotrain_single_cicle', []);
		this.multiple_cicle = this.load('autotrain_multiple_cicle', []);

		this.shiftHeld = false;
	}

	settings = () => {
		requestAnimationFrame(() => {
			this.setPolisInSettings(uw.ITowns.getCurrentTown().id);
			this.updatePolisInSettings(uw.ITowns.getCurrentTown().id);
			/*this.updateTitle();*/

			uw.$.Observer(uw.GameEvents.town.town_switch).subscribe(() => {
				this.setPolisInSettings(uw.ITowns.getCurrentTown().id);
				this.updatePolisInSettings(uw.ITowns.getCurrentTown().id);
				/*this.updateTitle();*/
			});

			uw.$('#troops_lvl_buttons').on('mousedown', e => {
				this.shiftHeld = e.shiftKey;
			});
		});

		return `
        <div class="game_border">
            <div class="game_border_top"></div>
            <div class="game_border_bottom"></div>
            <div class="game_border_left"></div>
            <div class="game_border_right"></div>
            <div class="game_border_corner corner1"></div>
            <div class="game_border_corner corner2"></div>
            <div class="game_border_corner corner3"></div>
            <div class="game_border_corner corner4"></div>
            <div id="auto_train_title" class="game_header bold" style="position: relative; cursor: pointer" onclick="window.modernBot.autoTrain.trigger()"> 
            <span style="z-index: 10; position: relative;">Auto Train </span>
            <div style="position: absolute; right: 10px; top: 4px; font-size: 10px; z-index: 10"> (click to toggle) </div>
            <span class="command_count"></span></div>

            <div id="troops_lvl_buttons"></div>    
        </div>
    `;
	};

	/**
	 * Calculates the total population of a town, taking into account the available population, the units in the town, the units outside the town, and the units in orders.
	 *
	 * @param {string} town_id - The ID of the town to calculate the population for.
	 * @returns {number} - The total population of the town.
	 */
	getTotalPopulation = town_id => {
		const town = uw.ITowns.towns[town_id];
		const data = GameData.units;
		const { models: orders } = town.getUnitOrdersCollection();

		const used = Object.entries({ ...town.units(), ...town.unitsOuter(), ...orders }).reduce((acc, [unit, count]) => acc + (data[unit]?.population ?? 0) * count, 0);

		return town.getAvailablePopulation() + used;
	};

	setPolisInSettings = town_id => {
		let town = uw.ITowns.towns[town_id];
		let researches = town.researches().attributes;
		let buildings = town.buildings().attributes;

		const isGray = troop => {
			if (!this.REQUIREMENTS.hasOwnProperty(troop)) {
				return true; // Troop type not recognized
			}

			const { research, building, level } = this.REQUIREMENTS[troop];
			if (research && !researches[research]) return true;
			if (building && buildings[building] < level) return true;
			return false;
		};

		const getTroopHtml = (troop, bg) => {
			let gray = isGray(troop, researches, buildings);
			let color = 'red';

			if (gray) {
				return `
                <div class="auto_build_box">
                    <div class="item_icon auto_trade_troop" style="background-position: -${bg[0]}px -${bg[1]}px; filter: grayscale(1);"></div>
                </div>
                `;
			}
			return `
                <div class="auto_build_box">
                <div class="item_icon auto_trade_troop" style="background-position: -${bg[0]}px -${bg[1]}px;">
                    <div class="auto_build_up_arrow" onclick="window.modernBot.autoTrain.editTroopCount(${town_id}, '${troop}', 1)" ></div>
                    <div class="auto_build_down_arrow" onclick="window.modernBot.autoTrain.editTroopCount(${town_id}, '${troop}', -1)"></div>
                    <p style="color: ${color}" id="troop_lvl_${troop}" class="auto_build_lvl"> 0 <p>
                </div>
            </div>`;
		};

		uw.$('#troops_lvl_buttons').html(`
        <div id="troops_settings_${town_id}">
            <div style="width: 600px; margin-bottom: 3px; display: inline-flex">
            <a class="gp_town_link" href="${town.getLinkFragment()}">${town.getName()}</a> 
            <p style="font-weight: bold; margin: 0px 5px"> [${town.getPoints()} pts] </p>
            <p style="font-weight: bold; margin: 0px 5px"> </p>
            <div class="population_icon">
                <p id="troops_lvl_population"> ${this.getTotalPopulation(town_id)} <p>
            </div>
            </div>
            <div style="width: 831px; display: inline-flex; gap: 1px;">
            ${getTroopHtml('sword', [400, 0])}
            ${getTroopHtml('archer', [50, 100])}
            ${getTroopHtml('hoplite', [300, 50])}
            ${getTroopHtml('slinger', [250, 350])}
            ${getTroopHtml('rider', [50, 350])}
            ${getTroopHtml('chariot', [200, 100])}
            ${getTroopHtml('catapult', [150, 150])}

            ${getTroopHtml('big_transporter', [0, 150])}
            ${getTroopHtml('small_transporter', [300, 350])}
            ${getTroopHtml('bireme', [50, 150])}
            ${getTroopHtml('demolition_ship', [250, 0])}
            ${getTroopHtml('attack_ship', [150, 100])}
            ${getTroopHtml('trireme', [400, 250])}
            ${getTroopHtml('colonize_ship', [50, 200])}
            </div>
        </div>`);
	};

	editTroopCount = (town_id, troop, count) => {
		const { units } = GameData;
		const { city_troops } = this;
		// Modify count based on whether the shift key is held down
		count = this.shiftHeld ? count * 50 : count;

		// Add the town to the city_troops object if it doesn't already exist
		if (!city_troops.hasOwnProperty(town_id)) city_troops[town_id] = {};

		// Check if the troop count can be increased without exceeding population capacity
		const total_pop = this.getTotalPopulation(town_id);
		const used_pop = this.countPopulation(this.city_troops[town_id]);
		const unit_pop = units[troop].population;
		if (total_pop - used_pop < unit_pop * count) count = parseInt((total_pop - used_pop) / unit_pop);

		// Update the troop count for the specified town and troop type
		if (troop in city_troops[town_id]) city_troops[town_id][troop] += count;
		else city_troops[town_id][troop] = count;

		/* Clenaup */
		if (city_troops[town_id][troop] <= 0) delete city_troops[town_id][troop];
		if (uw.$.isEmptyObject(city_troops[town_id])) delete this.city_troops[town_id];

		this.updatePolisInSettings(town_id);
		this.save('city_troops', this.city_troops);
	};

	updatePolisInSettings = town_id => {
		const { units } = GameData;
		const cityTroops = this.city_troops[town_id];

		Object.keys(units).forEach(troop => {
			const color = 'orange';
			const guiCount = cityTroops && cityTroops[troop] ? cityTroops[troop] : 0;
			const selector = `#troops_settings_${town_id} #troop_lvl_${troop}`;

			uw.$(selector).css('color', color).text(guiCount);
		});
	};

	/* return status of the give polis */
	getPolisStatus = town_id => {
		if (!this.city_troops.hasOwnProperty(town_id)) return 'inactive';
		if (this.single_cicle.includes(town_id)) return 'single';
		if (this.multiple_cicle.includes(town_id)) return 'multiple';
		return 'inactive';
	};

	setPolisStatus = (town_id, status) => {
		const { single_cicle, multiple_cicle } = this;

		switch (status) {
			case 'inactive':
				this.single_cicle = single_cicle.filter(id => id !== town_id);
				this.multiple_cicle = multiple_cicle.filter(id => id !== town_id);
				break;
			case 'single':
				this.single_cicle = [...new Set([...single_cicle, town_id])];
				this.multiple_cicle = multiple_cicle.filter(id => id !== town_id);
				break;
			case 'multiple':
				this.single_cicle = single_cicle.filter(id => id !== town_id);
				this.multiple_cicle = [...new Set([...multiple_cicle, town_id])];
				break;
			default:
				throw new Error(`Invalid status: ${status}`);
		}
	};

	trigger = () => {
		let town = uw.ITowns.getCurrentTown();
		let status = this.getPolisStatus(town.id);
		if (status == 'inactive' && this.city_troops.hasOwnProperty(town.id)) {
			this.setPolisStatus(town.id, 'single');
			uw.$('#auto_train_title').css('filter', 'brightness(100%) saturate(186%) hue-rotate(241deg)');
			return;
		}
		if (status == 'single') {
			this.setPolisStatus(town.id, 'multiple');
			uw.$('#auto_train_title').css('filter', 'brightness(100%) saturate(186%) hue-rotate(49deg)');
			return;
		}
		if (status == 'multiple') {
			this.setPolisStatus(town.id, 'inactive');
			uw.$('#auto_train_title').css('filter', '');
			return;
		}
	};

	// naval, ground
	getUnitOrdersCount = (type, town_id = 0) => {
		let town = town_id ? uw.ITowns.towns[town_id] : uw.ITowns.getCurrentTown();
		let count = 0;
		for (let model of town.getUnitOrdersCollection().models) {
			if (model.attributes.kind == type) count += 1;
		}
		return count;
	};

	/* Return the next troop that has to be trained */
	getNextInList = (type, town_id) => {
		if (!this.city_troops[town_id]) return null;
		if (type == 'naval') {
			if (this.city_troops[town_id].small_transporter) return 'small_transporter';
			if (this.city_troops[town_id].bireme) return 'bireme';
			if (this.city_troops[town_id].trireme) return 'trireme';
			if (this.city_troops[town_id].attack_ship) return 'attack_ship';
			if (this.city_troops[town_id].big_transporter) return 'big_transporter';
			if (this.city_troops[town_id].demolition_ship) return 'demolition_ship';
			if (this.city_troops[town_id].colonize_ship) return 'colonize_ship';
		} else {
			if (this.city_troops[town_id].catapult) return 'catapult';
			if (this.city_troops[town_id].sword) return 'sword';
			if (this.city_troops[town_id].archer) return 'archer';
			if (this.city_troops[town_id].hoplite) return 'hoplite';
			if (this.city_troops[town_id].slinger) return 'slinger';
			if (this.city_troops[town_id].rider) return 'rider';
			if (this.city_troops[town_id].chariot) return 'chariot';
		}
		return null;
	};

	getTroopCount = (troop, town_id) => {
		let town = town_id ? uw.ITowns.towns[town_id] : uw.ITowns.getCurrentTown();
		if (!this.city_troops[town_id]) return 0;
		if (!this.city_troops[town_id][troop]) return 0;
		let count = this.city_troops[town_id][troop];

		/* Get the duable ammount with the current resouces of the polis */
		let resouces = town.resources();
		let discount = uw.GeneralModifications.getUnitBuildResourcesModification(town_id, uw.GameData.units[troop]);
		let { wood, stone, iron } = uw.GameData.units[troop].resources;
		let w = resouces.wood / (wood * discount);
		let s = resouces.stone / (stone * discount);
		let i = resouces.iron / (iron * discount);
		let min = parseInt(Math.min(w, s, i));
		count = count > min ? min : count;

		/* Check for free population */
		let duable_with_pop = parseInt(resouces.population / uw.GameData.units[troop].population); // for each troop
		console.log(duable_with_pop);

		/* Get the max duable */
		let w_max = resouces.storage / (wood * discount);
		let s_max = resouces.storage / (stone * discount);
		let i_max = resouces.storage / (iron * discount);
		let max = parseInt(Math.min(w_max, s_max, i_max) * 0.8); // 0.8 it's the full percentual -> 80%
		console.log(max);
		max = max > duable_with_pop ? duable_with_pop : max;

		count = count >= max ? max : -1;
		console.log(max);
		console.log(count);
		return count;
	};

	checkPolis = (type, town_id) => {
		let order_count = this.getUnitOrdersCount(type, town_id);
		console.log(order_count);
		if (order_count > 6) return false;
		let next = this.getNextInList(type, town_id);
		console.log(next);
		if (!next) return false;
		let count = this.getTroopCount(next, town_id);
		console.log(count);
		if (!count) return false;
		this.buildPost(town_id, next, count);
		return true;
	};

	mainSingle = () => {
		if (this.single_cicle.length == 0) return;
		for (let town_id of this.single_cicle) {
			if (this.checkPolis('naval', town_id)) return;
			if (this.checkPolis('ground', town_id)) return;
		}
	};

	mainMultiple = () => {
		if (this.multiple_cicle.length == 0) return;
		for (let town_id of this.multiple_cicle) {
			if (this.checkPolis('naval', town_id)) return;
			if (this.checkPolis('ground', town_id)) return;
		}
	};

	buildPost = (polis, unit, count) => {
		let data = { unit_id: unit, amount: count, town_id: polis };
		//uw.gpAjax.ajaxPost('building_barracks', 'build', data)
		uw.HumanMessage.success('Truppato ' + count + ' su ' + polis);
	};
}
