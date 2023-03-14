class ModernUtil {
	/* Usage async this.sleep(ms) -> stop the code for ms */
	sleep = (ms) => {
		return new Promise((resolve) => setTimeout(resolve, ms));
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

	/* generate list with 1 polis per island */
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

	/* Return html of the button */
	getButtonHtml(id, text, fn, props) {
		let name = this.constructor.name.charAt(0).toLowerCase() + this.constructor.name.slice(1);
		if (isNaN(parseInt(props))) {
			props = `'${props}'`;
		}
		let click = `window.modernBot.${name}.${fn.name}(${props ? props : ''})`;

		return `
        <div id="${id}" style="cursor: pointer" class="button_new" onclick="${click}">
            <div class="left"></div>
            <div class="right"></div>
            <div class="caption js-caption"> ${text} <div class="effect js-effect"></div></div>
        </div>`;
	}

	/* Return html of the title */
	getTitleHtml(id, text, fn, props, enable, desc = '(click to toggle)') {
		let name = this.constructor.name.charAt(0).toLowerCase() + this.constructor.name.slice(1);
		if (isNaN(parseInt(props)) && props) {
			props = `"${props}"`;
		}
		let click = `window.modernBot.${name}.${fn.name}(${props ? props : ''})`;
		let filter = 'brightness(100%) saturate(186%) hue-rotate(241deg)';

		return `
        <div class="game_border_top"></div>
        <div class="game_border_bottom"></div>
        <div class="game_border_left"></div>
        <div class="game_border_right"></div>
        <div class="game_border_corner corner1"></div>
        <div class="game_border_corner corner2"></div>
        <div class="game_border_corner corner3"></div>
        <div class="game_border_corner corner4"></div>
        <div id="${id}" style="cursor: pointer; filter: ${
			enable ? filter : ''
		}" class="game_header bold" onclick="${click}"> ${text} <span class="command_count"></span>
            <div style="position: absolute; right: 10px; top: 4px; font-size: 10px;"> ${desc} </div>
        </div>
        `;
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
