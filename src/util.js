class ModernUtil {
	/* CONSTANTS */
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

	/* Usage async this.sleep(ms) -> stop the code for ms */
	sleep = ms => {
		return new Promise(resolve => setTimeout(resolve, ms));
	};

	/* Save content in localstorage */
	save(id, content) {
		const key = `${id}_${uw.Game.world_id}`;

		try {
			localStorage.setItem(key, JSON.stringify(content));
			return true;
		} catch (error) {
			console.error(`Error saving data to localStorage for key "${key}": ${error}`);
			return false;
		}
	}

	/* Load from localstorage, return null if don't exist */
	load(id, defaultValue = null) {
		const key = `${id}_${uw.Game.world_id}`;
		const savedValue = localStorage.getItem(key);

		if (savedValue === null || savedValue === undefined) {
			return defaultValue;
		}

		try {
			const parsedValue = JSON.parse(savedValue);
			return parsedValue;
		} catch (error) {
			return defaultValue;
		}
	}

	/**
	 * Generate a list of town IDs that are located on large islands.
	 * A large island is defined as an island that has at least one town that is not on a small island.
	 * @returns {Array} - Array of town IDs.
	 */
	generateList = () => {
		const townList = uw.MM.getOnlyCollectionByName('Town').models;
		const islandsList = [];
		const polisList = [];

		for (const town of townList) {
			const { island_id, id, on_small_island } = town.attributes;

			if (on_small_island) continue; // Skip towns on small islands

			if (!islandsList.includes(island_id)) {
				islandsList.push(island_id);
				polisList.push(id);
			}
		}

		return polisList;
	};

	/**
	 * Returns HTML code for a button with a specified ID, text, function, and optional properties.
	 *
	 * @param {string} id - The ID for the button.
	 * @param {string} text - The text to display on the button.
	 * @param {Function} fn - The function to call when the button is clicked.
	 * @param {string} [props] - Optional properties to pass to the function.
	 * @returns {string} - The HTML code for the button.
	 */
	getButtonHtml(id, text, fn, props) {
		const name = this.constructor.name.charAt(0).toLowerCase() + this.constructor.name.slice(1);
		props = isNaN(parseInt(props)) ? `'${props}'` : props;
		const click = `window.modernBot.${name}.${fn.name}(${props || ''})`;

		return `
      <div id="${id}" style="cursor: pointer" class="button_new" onclick="${click}">
        <div class="left"></div>
        <div class="right"></div>
        <div class="caption js-caption"> ${text} <div class="effect js-effect"></div></div>
      </div>`;
	}

	/**
	 * Returns the HTML for a game title with a clickable header that toggles a function.
	 *
	 * @param {string} id - The ID for the HTML element.
	 * @param {string} text - The text to display in the title.
	 * @param {function} fn - The function to toggle.
	 * @param {string|number} props - The properties to pass to the function.
	 * @param {boolean} enable - Whether the title is enabled or not.
	 * @param {string} [desc='(click to toggle)'] - The description to display.
	 * @returns {string} The HTML for the game title.
	 */
	getTitleHtml(id, text, fn, props, enable, desc = '(click to toggle)') {
		const name = this.constructor.name.charAt(0).toLowerCase() + this.constructor.name.slice(1);
		props = isNaN(parseInt(props)) && props ? `"${props}"` : props;
		const click = `window.modernBot.${name}.${fn.name}(${props || ''})`;
		const filter = 'brightness(100%) saturate(186%) hue-rotate(241deg)';

		return `
        <div class="game_border_top"></div>
        <div class="game_border_bottom"></div>
        <div class="game_border_left"></div>
        <div class="game_border_right"></div>
        <div class="game_border_corner corner1"></div>
        <div class="game_border_corner corner2"></div>
        <div class="game_border_corner corner3"></div>
        <div class="game_border_corner corner4"></div>
        <div id="${id}" style="cursor: pointer; filter: ${enable ? filter : ''}" class="game_header bold" onclick="${click}">
            ${text}
            <span class="command_count"></span>
            <div style="position: absolute; right: 10px; top: 4px; font-size: 10px;"> ${desc} </div>
        </div>`;
	}

	/**
	 * Calculates the total population of a collection of units.
	 *
	 * @param {Object} units - The collection of units to count population for.
	 * @returns {number} - The total population of all units in the collection.
	 */
	countPopulation(obj) {
		const data = GameData.units;
		let total = 0;
		for (let key in obj) {
			total += data[key].population * obj[key];
		}
		return total;
	}

	isActive(type) {
		return uw.GameDataPremium.isAdvisorActivated(type);
	}
	/* 
        GET REQUEST TO THE SERVER
    */

	/* 
        POST REQUEST TO THE SERVER
    */
	/* Send post request to the server to get resourses */
	useBootcampReward() {
		var data = {
			model_url: `PlayerAttackSpot/${uw.Game.player_id}`,
			action_name: 'useReward',
			arguments: {},
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
	}

	stashBootcampReward() {
		var data = {
			model_url: `PlayerAttackSpot/${uw.Game.player_id}`,
			action_name: 'stashReward',
			arguments: {},
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, 0, {
			error: this.useBootcampReward,
		});
	}

	tradeRuralPost = (farm_town_id, relation_id, count, town_id) => {
		if (count < 100) return;
		let data = {
			model_url: `FarmTownPlayerRelation/${relation_id}`,
			action_name: 'trade',
			arguments: { farm_town_id: farm_town_id, amount: count > 3000 ? 3000 : count },
			town_id: town_id,
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
	};

	unlockRural = (town_id, farm_town_id, relation_id) => {
		let data = {
			model_url: `FarmTownPlayerRelation/${relation_id}`,
			action_name: 'unlock',
			arguments: {
				farm_town_id: farm_town_id,
			},
			town_id: town_id,
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
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
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
	};

	//
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
