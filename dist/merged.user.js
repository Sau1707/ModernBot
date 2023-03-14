
// ==UserScript==
// @name         ModernBot
// @author       Sau1707
// @description  A modern grepolis bot
// @version      1.11.6
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @updateURL    https://github.com/Sau1707/ModernBot/blob/main/dist/merged.user.js
// @downloadURL  https://github.com/Sau1707/ModernBot/blob/main/dist/merged.user.js
// @icon         https://raw.githubusercontent.com/Sau1707/ModernBot/main/img/gear.png
// @require		 http://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

var uw;
if (typeof unsafeWindow == 'undefined') {
	uw = window;
} else {
	uw = unsafeWindow;
}

var style = document.createElement("style");
style.textContent = `.auto_build_up_arrow{background:url(https://gpit.innogamescdn.com/images/game/academy/up.png) no-repeat -2px -2px;width:18px;height:18px;position:absolute;right:-2px;bottom:12px;transform:scale(.8);cursor:pointer}.auto_build_down_arrow{background:url(https://gpit.innogamescdn.com/images/game/academy/up.png) no-repeat -2px -2px;width:18px;height:18px;position:absolute;right:-2px;bottom:-3px;transform:scale(.8) rotate(180deg);cursor:pointer}.auto_build_box{background:url(https://gpit.innogamescdn.com/images/game/academy/tech_frame.png) no-repeat 0 0;width:58px;height:59px;position:relative;overflow:hidden;display:inline-block;vertical-align:middle}.auto_build_building{position:absolute;top:4px;left:4px;width:50px;height:50px;background:url(https://gpit.innogamescdn.com/images/game/main/buildings_sprite_50x50.png) no-repeat 0 0}.auto_build_lvl{position:absolute;bottom:3px;left:3px;margin:0;font-weight:700;font-size:12px;color:#fff;text-shadow:0 0 2px #000,1px 1px 2px #000,0 2px 2px #000}#buildings_lvl_buttons{padding:5px;max-height:400px;user-select:none}.progress_bar_auto{position:absolute;z-index:1;height:100%;left:0;top:0;background-image:url(https://gpit.innogamescdn.com/images/game/border/header.png);background-position:0 -1px;filter:brightness(100%) saturate(186%) hue-rotate(241deg)}.modern_bot_settings{z-index:10;position:absolute;top:52px!important;right:116px!important}.console_modernbot{width:100%;height:100%;background-color:#000;color:#fff;font-family:monospace;font-size:16px;padding:20px;box-sizing:border-box;overflow-y:scroll;display:flex;flex-direction:column-reverse}#MODERN_BOT_content{height:100%}.console_modernbot p{margin:1px}`;
document.head.appendChild(style);

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

class AutoBootcamp extends ModernUtil {
	constructor(console) {
		super();
		this.console = console;

		if (this.load('enable_autobootcamp')) this.toggle();
		if (this.load('bootcamp_use_def')) this.triggerUseDef();
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
            ${this.getTitleHtml(
				'auto_autobootcamp',
				'Auto Bootcamp',
				this.toggle,
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

	triggerUseDef = () => {
		this.use_def = !this.use_def;
		if (this.use_def) {
			uw.$('#autobootcamp_off').addClass('disabled');
			uw.$('#autobootcamp_def').removeClass('disabled');
		} else {
			uw.$('#autobootcamp_def').addClass('disabled');
			uw.$('#autobootcamp_off').removeClass('disabled');
		}
		this.save('bootcamp_use_def', this.use_def);
	};

	toggle = () => {
		if (!this.enable_auto_bootcamp) {
			uw.$('#auto_autobootcamp').css(
				'filter',
				'brightness(100%) saturate(186%) hue-rotate(241deg)',
			);
			this.enable_auto_bootcamp = setInterval(this.main, 4000);
			this.console.log('Auto Bootcamp -> On');
		} else {
			uw.$('#auto_autobootcamp').css('filter', '');
			clearInterval(this.enable_auto_bootcamp);
			this.enable_auto_bootcamp = null;
			this.console.log('Auto Bootcamp -> Off');
		}
		this.save('enable_autobootcamp', !!this.enable_auto_bootcamp);
	};

	attackBootcamp = () => {
		let cooldown = uw.MM.getModelByNameAndPlayerId('PlayerAttackSpot').getCooldownDuration();
		if (cooldown > 0) return false;

		let movements = uw.MM.getModels().MovementsUnits;

		/* Check if there isn't already an active attack */
		if (movements != null) {
			if (Object.keys(movements).length > 0) {
				var attack_list = Object.keys(movements);
				for (var i = 0; i < Object.keys(movements).length; i++) {
					if (movements[attack_list[i]].attributes.destination_is_attack_spot) {
						return false;
					}
					if (movements[attack_list[i]].attributes.origin_is_attack_spot) {
						return false;
					}
				}
			}
		}

		var units = { ...uw.ITowns.towns[uw.Game.townId].units() };

		/* Stop if no units are avalable anymore */
		if (Object.keys(units).length === 0) {
			this.toggle();
			return;
		}

		delete units.militia;
		for (let unit in units) {
			if (uw.GameData.units[unit].is_naval) delete units[unit];
		}

		if (!this.use_def) {
			delete units.sword;
			delete units.archer;
		}

		var model_url = 'PlayerAttackSpot/' + uw.Game.player_id;
		var data = {
			model_url: model_url,
			action_name: 'attack',
			arguments: units,
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
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

		if (reward.stashable) {
			this.stashBootcampReward();
		} else {
			this.useBootcampReward();
		}
		return true;
	};

	main = () => {
		if (this.rewardBootcamp()) return;
		if (this.attackBootcamp()) return;
	};
}

/* 
    Ideas:
    - show current status
        - done
        - missing resouces (why type)
        - missing population
        - queee full
    - pause a specific polis
    - show end point
    - special buildings 
*/

// var r = Math.round(e.building.points * Math.pow(e.building.points_factor, e.next_level)) - Math.round(e.building.points * Math.pow(e.building.points_factor, e.level))

class AutoBuild extends ModernUtil {
	constructor(console) {
		super();
		this.console = console;

		/* Load settings, the polis in the settins are the active */
		this.towns_buildings = this.load('auto_build_levels', {});

		/* Check if shift is pressed */
		this.shiftHeld = false;

		/* Active always, check if the towns are in the active list */
		this.enable = setInterval(this.main, 20000);

		/* Attach event to towns list */
		setTimeout(() => {
			const townController = uw.layout_main_controller.sub_controllers.find(
				(controller) => controller.name === 'town_name_area',
			);
			if (!townController) return;

			const oldRender = townController.controller.town_groups_list_view.render;
			townController.controller.town_groups_list_view.render = function () {
				oldRender.call(this);
				const townIds = Object.keys(uw.modernBot.autoBuild.towns_buildings);
				uw.$('.town_group_town').each(function () {
					const townId = parseInt(uw.$(this).attr('data-townid'));
					if (!townIds.includes(townId.toString())) return;
					const html = `<div style='background-image: url(https://i.ibb.co/G5DfgbZ/gear.png); scale: 0.9; background-repeat: no-repeat; position: relative; height: 20px; width: 25px; float: left;'></div>`;
					uw.$(this).append(html);
				});
			};
		}, 2500);
	}

	settings = () => {
		/* Apply event to shift */
		requestAnimationFrame(() => {
			uw.$('#buildings_lvl_buttons').on('mousedown', (e) => {
				this.shiftHeld = e.shiftKey;
			});

			this.setPolisInSettings(uw.ITowns.getCurrentTown().id);
			this.updateTitle();

			uw.$.Observer(uw.GameEvents.town.town_switch).subscribe(() => {
				this.setPolisInSettings(uw.ITowns.getCurrentTown().id);
				this.updateTitle();
			});
		});

		return `
        <div class="game_border" style="margin-bottom: 20px">
            <div class="game_border_top"></div>
            <div class="game_border_bottom"></div>
            <div class="game_border_left"></div>
            <div class="game_border_right"></div>
            <div class="game_border_corner corner1"></div>
            <div class="game_border_corner corner2"></div>
            <div class="game_border_corner corner3"></div>
            <div class="game_border_corner corner4"></div>
            <div id="auto_build_title" style="cursor: pointer; filter: ${
				this.enable ? 'brightness(100%) saturate(186%) hue-rotate(241deg)' : ''
			}" class="game_header bold" onclick="window.modernBot.autoBuild.toggle()"> Auto Build <span class="command_count"></span>
                <div style="position: absolute; right: 10px; top: 4px; font-size: 10px;"> (click to toggle) </div>
            </div>
            <div id="buildings_lvl_buttons"></div>    
        </div> `;
	};

	/* Given the town id, set the polis in the settings menu */
	setPolisInSettings = (town_id) => {
		let town = uw.ITowns.towns[town_id];

		/* If the town is in the active list set*/
		let town_buildings =
			this.towns_buildings?.[town_id] ?? { ...town.buildings()?.attributes } ?? {};
		let buildings = { ...town.buildings().attributes };

		const getBuildingHtml = (building, bg) => {
			let color = 'lime';
			if (buildings[building] > town_buildings[building]) color = 'red';
			else if (buildings[building] < town_buildings[building]) color = 'orange';

			return `
                <div class="auto_build_box">
                <div class="item_icon auto_build_building" style="background-position: -${bg[0]}px -${bg[1]}px;">
                    <div class="auto_build_up_arrow" onclick="window.modernBot.autoBuild.editBuildingLevel(${town_id}, '${building}', 1)" ></div>
                    <div class="auto_build_down_arrow" onclick="window.modernBot.autoBuild.editBuildingLevel(${town_id}, '${building}', -1)"></div>
                    <p style="color: ${color}" id="build_lvl_${building}" class="auto_build_lvl"> ${town_buildings[building]} <p>
                </div>
            </div>`;
		};

		/* If the town is in a group, the the groups */
		const groups =
			`(uw.${Object.values(uw.ITowns.getTownGroups())
				.filter((group) => group.id > 0 && group.id !== -1 && group.towns[town_id])
				.map((group) => group.name)
				.join(', ')})` || '';

		uw.$('#buildings_lvl_buttons').html(`
        <div id="build_settings_${town_id}">
            <div style="width: 600px; margin-bottom: 3px; display: inline-flex">
            <a class="gp_town_link" href="${town.getLinkFragment()}">${town.getName()}</a> 
            <p style="font-weight: bold; margin: 0px 5px"> [${town.getPoints()} pts] </p>
            <p style="font-weight: bold; margin: 0px 5px"> ${groups} </p>
            </div>
            <div style="width: 766px; display: inline-flex; gap: 1px;">
                ${getBuildingHtml('main', [450, 0])}
                ${getBuildingHtml('storage', [250, 50])}
                ${getBuildingHtml('farm', [150, 0])}
                ${getBuildingHtml('academy', [0, 0])}
                ${getBuildingHtml('temple', [300, 50])}
                ${getBuildingHtml('barracks', [50, 0])}
                ${getBuildingHtml('docks', [100, 0])}
                ${getBuildingHtml('market', [0, 50])}
                ${getBuildingHtml('hide', [200, 0])}
                ${getBuildingHtml('lumber', [400, 0])}
                ${getBuildingHtml('stoner', [200, 50])}
                ${getBuildingHtml('ironer', [250, 0])}
                ${getBuildingHtml('wall', [50, 100])}
            </div>
        </div>`);
	};

	/* call with town_id, building type and level to be added */
	editBuildingLevel = (town_id, name, d) => {
		/* if shift is pressed, add or remove 10 */
		const current_lvl = parseInt(uw.$(`#build_lvl_${name}`).text());
		d = this.shiftHeld ? d * 10 : d;

		const { max_level, min_level } = uw.GameData.buildings[name];

		const town = uw.ITowns.towns[town_id];

		const town_buildings =
			this.towns_buildings?.[town_id] ?? { ...town.buildings()?.attributes } ?? {};
		const townBuildings = town.buildings().attributes;

		/* Check if bottom or top overflow */
		town_buildings[name] = Math.min(Math.max(current_lvl + d, min_level), max_level);

		const color =
			town_buildings[name] > townBuildings[name]
				? 'orange'
				: town_buildings[name] < townBuildings[name]
				? 'red'
				: 'lime';

		uw.$(`#build_settings_${town_id} #build_lvl_${name}`)
			.css('color', color)
			.text(town_buildings[name]);

		if (town_id.toString() in this.towns_buildings) {
			this.towns_buildings[town_id] = town_buildings;
			this.save('auto_build_levels', this.towns_buildings);
		}
	};

	isActive = (town_id) => {
		let town = uw.ITowns.towns[town_id];
		return !this.towns_buildings?.[town.id];
	};

	updateTitle = () => {
		let town = uw.ITowns.getCurrentTown();
		if (town.id.toString() in this.towns_buildings) {
			uw.$('#auto_build_title').css(
				'filter',
				'brightness(100%) saturate(186%) hue-rotate(241deg)',
			);
		} else {
			uw.$('#auto_build_title').css('filter', '');
		}
	};

	/* Call to toggle on and off (trigger the current town) */
	toggle = () => {
		let town = uw.ITowns.getCurrentTown();

		if (!(town.id.toString() in this.towns_buildings)) {
			this.console.log(`${town.name}: Auto Build On`);
			this.towns_buildings[town.id] = {};
			let buildins = [
				'main',
				'storage',
				'farm',
				'academy',
				'temple',
				'barracks',
				'docks',
				'market',
				'hide',
				'lumber',
				'stoner',
				'ironer',
				'wall',
			];
			buildins.forEach((e) => {
				let lvl = parseInt(uw.$(`#build_lvl_${e}`).text());
				this.towns_buildings[town.id][e] = lvl;
			});
			this.save('auto_build_levels', this.towns_buildings);
		} else {
			delete this.towns_buildings[town.id];
			this.console.log(`${town.name}: Auto Build Off`);
		}

		this.updateTitle();
	};

	/* Main loop for building */
	main = async () => {
		for (let town_id of Object.keys(this.towns_buildings)) {
			/* If the town don't exists in list, remove it to prevent errors */
			if (!uw.ITowns.towns[town_id]) {
				delete this.towns_buildings[town_id];
				this.save('auto_build_levels', this.towns_buildings);
				continue;
			}

			if (this.isFullQueue(town_id)) continue;
			/* If town is done, remove from the list */
			if (this.isDone(town_id)) {
				delete this.towns_buildings[town_id];
				this.save('auto_build_levels', this.towns_buildings);
				this.updateTitle();
				const town = uw.ITowns.towns[town_id];
				this.console.log(`${town.name}: Auto Build Done`);
				continue;
			}
			await this.getNextBuild(town_id);
		}
	};

	/* Make post request to the server to buildup the building */
	postBuild = async (type, town_id) => {
		let town = uw.ITowns.towns[town_id];
		let { wood, stone, iron } = town.resources();
		let { resources_for, population_for } =
			uw.MM.getModels().BuildingBuildData[town_id].attributes.building_data[type];

		if (town.getAvailablePopulation() < population_for) return;
		if (wood < resources_for.wood || stone < resources_for.stone || iron < resources_for.iron) {
			return;
		}
		let data = {
			model_url: 'BuildingOrder',
			action_name: 'buildUp',
			arguments: { building_id: type },
			town_id: town_id,
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
		this.console.log(`${town.getName()}: buildUp ${type}`);
		await this.sleep(500);
	};

	/* Make post request to tear building down */
	postTearDown = async (type, town_id) => {
		let town = uw.ITowns.towns[town_id];
		let data = {
			model_url: 'BuildingOrder',
			action_name: 'tearDown',
			arguments: { building_id: type },
			town_id: town_id,
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
		await this.sleep(500);
	};

	/* return true if the quee is full */
	isFullQueue = (town_id) => {
		let town = uw.ITowns.towns[town_id];
		if (uw.GameDataPremium.isAdvisorActivated('curator') && town.buildingOrders().length >= 7) {
			return true;
		}
		if (
			!uw.GameDataPremium.isAdvisorActivated('curator') &&
			town.buildingOrders().length >= 2
		) {
			return true;
		}
		return false;
	};

	/* return true if building match polis */
	isDone = (town_id) => {
		let town = uw.ITowns.towns[town_id];
		let buildings = town.getBuildings().attributes;
		for (let build of Object.keys(this.towns_buildings[town_id])) {
			if (this.towns_buildings[town_id][build] != buildings[build]) {
				return false;
			}
		}
		return true;
	};

	/* */
	getNextBuild = async (town_id) => {
		let town = ITowns.towns[town_id];

		/* livello attuale */
		let buildings = { ...town.getBuildings().attributes };

		/* Add the the list the current building progress */
		for (let order of town.buildingOrders().models) {
			if (order.attributes.tear_down) {
				buildings[order.attributes.building_type] -= 1;
			} else {
				buildings[order.attributes.building_type] += 1;
			}
		}
		/* livello in cui deve arrivare */
		let target = this.towns_buildings[town_id];

		/* Check if the building is duable, if yes build it and return true, else false  */
		const check = async (build, level) => {
			/* if the given is an array, randomically try all of the array */
			if (Array.isArray(build)) {
				build.sort(() => Math.random() - 0.5);
				for (let el of build) {
					if (await check(el, level)) return true;
				}
				return false;
			}
			if (target[build] <= buildings[build]) return false;
			else if (buildings[build] < level) {
				await this.postBuild(build, town_id);
				return true;
			}
			return false;
		};

		const tearCheck = async (build) => {
			if (Array.isArray(build)) {
				build.sort(() => Math.random() - 0.5);
				for (let el of build) {
					if (await tearCheck(el)) return true;
				}
				return false;
			}
			if (target[build] < buildings[build]) {
				await this.postTearDown(build, town_id);
				return true;
			}
			return false;
		};

		/* IF the docks is not build yet, then follow the tutorial */
		if (buildings.docks < 1) {
			if (await check('lumber', 3)) return;
			if (await check('stoner', 3)) return;
			if (await check('farm', 4)) return;
			if (await check('ironer', 3)) return;
			if (await check('storage', 4)) return;
			if (await check('temple', 3)) return;
			if (await check('main', 5)) return;
			if (await check('barracks', 5)) return;
			if (await check('storage', 5)) return;
			if (await check('stoner', 6)) return;
			if (await check('lumber', 6)) return;
			if (await check('ironer', 6)) return;
			if (await check('main', 8)) return;
			if (await check('farm', 8)) return;
			if (await check('market', 6)) return;
			if (await check('storage', 8)) return;
			if (await check('academy', 7)) return;
			if (await check('temple', 5)) return;
			if (await check('farm', 12)) return;
			if (await check('main', 15)) return;
			if (await check('storage', 12)) return;
			if (await check('main', 25)) return;
			if (await check('hide', 10)) return;
		}

		/* Resouces */
		// WALLS!
		if (await check('farm', 15)) return;
		if (await check(['storage', 'main'], 25)) return;
		if (await check('market', 4)) return;
		if (await check('hide', 10)) return;
		if (await check(['lumber', 'stoner', 'ironer'], 15)) return;
		if (await check(['academy', 'farm'], 36)) return;
		if (await check(['docks', 'barracks'], 10)) return;
		if (await check('wall', 25)) return;
		// terme
		if (await check(['docks', 'barracks', 'market'], 20)) return;
		if (await check('farm', 45)) return;
		if (await check(['docks', 'barracks', 'market'], 30)) return;
		if (await check(['lumber', 'stoner', 'ironer'], 40)) return;
		if (await check('temple', 30)) return;
		if (await check('storage', 35)) return;

		/* Demolish */
		let lista = [
			'lumber',
			'stoner',
			'ironer',
			'docks',
			'barracks',
			'market',
			'temple',
			'academy',
			'farm',
			'hide',
			'storage',
			'wall',
		];
		if (await tearCheck(lista)) return;
		if (await tearCheck('main')) return;
	};
}

/* 
    TODO:   
    - Autotrade: fix rurali non ti appartiene, materie prime che possiedi + log in console
    - AutoRuralLevel: still to implement
    - AutoFarm: check for time to start
*/
class AutoFarm extends ModernUtil {
	constructor(console) {
		super();
		this.console = console;
		this.buttonHtml =
			'<div class="divider"id="autofarm_timer_divider" ></div><div onclick="window.modernBot.autoFarm.toggle()" class="activity" id="autofarm_timer" style="filter: brightness(110%) sepia(100%) hue-rotate(100deg) saturate(1500%) contrast(0.8); background: url(https://i.ibb.co/gm8NDFS/backgound-timer.png); height: 26px; width: 40px"><p id="autofarm_timer_p" style="z-index: 6; top: -8px; position: relative; font-weight: bold;"></p></div>';
		this.delta_time = 5000;
		this.farm_timing = this.load('enable_autofarm_level', 1);
		this.rural_percentual = this.load('enable_autofarm_percentuals', 3);
		if (this.load('enable_autofarm')) this.toggle();

		this.polislist = this.generateList();
	}

	settings = () => {
		requestAnimationFrame(() => {
			this.setAutoFarmLevel(this.farm_timing);
			this.setAutoFarmPercentual(this.rural_percentual);
		});
		return `
        <div class="game_border" style="margin-bottom: 20px">
            ${this.getTitleHtml(
				'auto_farm',
				'Auto Farm',
				this.toggle,
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
        `;
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

	toggle = () => {
		if (!this.enable_auto_farming) {
			uw.$('#auto_farm').css('filter', 'brightness(100%) saturate(186%) hue-rotate(241deg)');
			let btbutton = document.getElementById('autofarm_timer');
			if (btbutton == null) {
				uw.$('.tb_activities, .toolbar_activities').find('.middle').append(this.buttonHtml);
			}
			this.lastTime = Date.now();
			this.timer = 0; // TODO: check if it's really 0
			this.enable_auto_farming = setInterval(this.main, 1000);
			this.console.log('Auto Farm -> On');
		} else {
			uw.$('#autofarm_timer').remove();
			uw.$('#autofarm_timer_divider').remove();
			uw.$('#auto_farm').css('filter', '');
			clearInterval(this.enable_auto_farming);
			this.enable_auto_farming = null;
			this.console.log('Auto Farm -> Off');
		}
		this.save('enable_autofarm', !!this.enable_auto_farming);
	};

	setAutoFarmLevel = (n) => {
		uw.$('#farming_lvl_buttons .button_new').addClass('disabled');
		uw.$(`#farming_lvl_${n}`).removeClass('disabled');
		this.farm_timing = n;
		this.save('enable_autofarm_level', n);
	};

	setAutoFarmPercentual = (n) => {
		let box = document.getElementById('rural_lvl_percentuals');
		let buttons = box.getElementsByClassName('button_new');
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].classList.add('disabled');
		}
		uw.$(`#rural_percentuals_${n}`).removeClass('disabled');
		this.rural_percentual = n;
		this.save('enable_autofarm_percentuals', n);
	};

	getNextCollection = () => {
		let models = uw.MM.getCollections().FarmTownPlayerRelation[0].models;
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

		/* Add timer of not there */
		const timerDisplay = document.getElementById('autofarm_timer_p');
		if (timerDisplay == null) {
			uw.$('.tb_activities, .toolbar_activities').find('.middle').append(this.buttonHtml);
		} else {
			timerDisplay.innerHTML = Math.round(Math.max(this.timer, 0) / 1000);
		}

		let yellow = 'brightness(294%) sepia(100%) hue-rotate(15deg) saturate(1000%) contrast(0.8)';
		let green = 'brightness(110%) sepia(100%) hue-rotate(100deg) saturate(1500%) contrast(0.8)';
		const isCaptainActive = uw.GameDataPremium.isAdvisorActivated('captain');
		/* Check for curator -> if not active set yellow */
		uw.$('#autofarm_timer').css('filter', isCaptainActive ? green : yellow);
	};

	claim = async () => {
		const isCaptainActive = uw.GameDataPremium.isAdvisorActivated('captain');
		if (isCaptainActive) {
			let data = {
				towns: this.polislist,
				time_option_base: 300,
				time_option_booty: 600,
				claim_factor: 'normal',
			};
			uw.gpAjax.ajaxPost('farm_town_overviews', 'claim_loads_multiple', data);
		} else {
			const claimSingle = (town_id, farm_town_id, relation_id) => {
				let data = {
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

			const player_relation_models =
				uw.MM.getOnlyCollectionByName('FarmTownPlayerRelation').models;
			const farm_town_models = uw.MM.getOnlyCollectionByName('FarmTown').models;
			const now = Math.floor(Date.now() / 1000);
			const max = 20;
			for (let town_id of this.polislist) {
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

						if (relation.attributes.relation_status === 0) continue;
						if (
							!relation.attributes.lootable_at ||
							now < relation.attributes.lootable_at
						) {
							continue;
						}
						claimSingle(town_id, relation.attributes.farm_town_id, relation.id);
						await this.sleep(500);
						if (!max) return;
						else max -= 1;
					}
				}
			}
		}

		setTimeout(() => uw.WMap.removeFarmTownLootCooldownIconAndRefreshLootTimers(), 2000);
	};

	main = async () => {
		/* Claim resouces of timer has passed */
		if (this.timer < 1) {
			/* Check if the percentual has reach */
			let total = {
				wood: 0,
				stone: 0,
				iron: 0,
				storage: 0,
			};

			for (let town_id of this.polislist) {
				let town = uw.ITowns.towns[town_id];
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
				requestAnimationFrame(this.updateTimer);
				return;
			}
			if (this.rural_percentual == 2 && min_percentual > 0.9) {
				this.timer = 30000;
				requestAnimationFrame(this.updateTimer);
				return;
			}
			if (this.rural_percentual == 1 && min_percentual > 0.8) {
				this.timer = 30000;
				requestAnimationFrame(this.updateTimer);
				return;
			}

			await this.claim();
			this.console.log('Claimed all rurals');
			let rand = Math.floor(Math.random() * this.delta_time);
			this.timer = this.farm_timing * 300000 + rand;
		}

		/* update the timer */
		this.updateTimer();
	};
}

class AutoGratis extends ModernUtil {
	constructor(console) {
		super();
		this.console = console;

		if (this.load('enable_autogratis', false)) this.toggle();
	}

	settings = () => {
		return `
        <div class="game_border" style="margin-bottom: 20px">
            <div class="game_border_top"></div>
            <div class="game_border_bottom"></div>
            <div class="game_border_left"></div>
            <div class="game_border_right"></div>
            <div class="game_border_corner corner1"></div>
            <div class="game_border_corner corner2"></div>
            <div class="game_border_corner corner3"></div>
            <div class="game_border_corner corner4"></div>
            <div id="auto_gratis_title" style="cursor: pointer; filter: ${
				this.autogratis ? 'brightness(100%) saturate(186%) hue-rotate(241deg)' : ''
			}" class="game_header bold" onclick="window.modernBot.autoGratis.toggle()"> Auto Build <span class="command_count"></span>
                <div style="position: absolute; right: 10px; top: 4px; font-size: 10px;"> (click to toggle) </div>
            </div>
            <div style="padding: 5px; font-weight: 600">
                Trigger to automatically press the <div id="dummy_free" class="btn_time_reduction button_new js-item-btn-premium-action js-tutorial-queue-item-btn-premium-action type_building_queue type_instant_buy instant_buy type_free">
                <div class="left"></div>
                <div class="right"></div>
                <div class="caption js-caption">Gratis<div class="effect js-effect"></div></div>
            </div> button (try every 4 seconds)
            </div>    
        </div>
        `;
	};

	/* Call to trigger the autogratis */
	toggle = () => {
		if (!this.autogratis) {
			uw.$('#auto_gratis_title').css(
				'filter',
				'brightness(100%) saturate(186%) hue-rotate(241deg)',
			);
			this.autogratis = setInterval(this.main, 4000);
			this.console.log('Auto Gratis -> On');
		} else {
			uw.$('#auto_gratis_title').css('filter', '');
			clearInterval(this.autogratis);
			this.autogratis = null;
			this.console.log('Auto Gratis -> Off');
		}
		this.save('enable_autogratis', !!this.autogratis);
	};

	/* Main loop for the autogratis bot */
	main = () => {
		const el = uw.$('.type_building_queue.type_free').not('#dummy_free');
		if (!el.length) return;
		el.click();
		this.console.log('Clicked gratis button');
	};
}

class AutoParty extends ModernUtil {
	constructor(console) {
		super();
		this.console = console;

		this.active_types = this.load('autoparty_types', { festival: false, procession: false });
		this.single = this.load('autoparty_single', true);
		if (this.load('enable_autoparty', false)) this.toggle();
	}

	// ${this.getButtonHtml('autoparty_lvl_1', 'Olympic', this.setRuralLevel, 1)}

	settings = () => {
		requestAnimationFrame(() => {
			this.active_types['festival'] = !this.active_types['festival'];
			this.active_types['procession'] = !this.active_types['procession'];
			this.trigger('festival');
			this.trigger('procession');

			this.triggerSingle(this.single.toString());
		});

		return `
        <div class="game_border" style="margin-bottom: 20px">
            <div class="game_border_top"></div>
            <div class="game_border_bottom"></div>
            <div class="game_border_left"></div>
            <div class="game_border_right"></div>
            <div class="game_border_corner corner1"></div>
            <div class="game_border_corner corner2"></div>
            <div class="game_border_corner corner3"></div>
            <div class="game_border_corner corner4"></div>
            <div id="auto_party_title" style="cursor: pointer; filter: ${
				this.autoparty ? 'brightness(100%) saturate(186%) hue-rotate(241deg)' : ''
			}" class="game_header bold" onclick="window.modernBot.autoParty.toggle()"> Auto Party <span class="command_count"></span>
                <div style="position: absolute; right: 10px; top: 4px; font-size: 10px;"> (click to toggle) </div>
            </div>

            <div id="autoparty_types" style="padding: 5px; display: inline-flex">
            <div style="margin-right: 494px">
            ${this.getButtonHtml('autoparty_festival', 'Party', this.trigger, 'festival')}
            ${this.getButtonHtml('autoparty_procession', 'Parade', this.trigger, 'procession')}
            </div>

            <div>
            ${this.getButtonHtml('autoparty_single', 'Single', this.triggerSingle, 'true')}
            ${this.getButtonHtml('autoparty_multiple', 'All', this.triggerSingle, 'false')}
            </div>
            </div>
        </div>
        `;
	};

	trigger = (type) => {
		if (this.active_types[type]) {
			uw.$(`#autoparty_${type}`).addClass('disabled');
		} else {
			uw.$(`#autoparty_${type}`).removeClass('disabled');
		}
		this.active_types[type] = !this.active_types[type];
		this.save('autoparty_types', this.active_types);
	};

	triggerSingle = (type) => {
		if (type === 'false') {
			uw.$(`#autoparty_single`).addClass('disabled');
			uw.$(`#autoparty_multiple`).removeClass('disabled');
			this.single = false;
		} else {
			uw.$(`#autoparty_multiple`).addClass('disabled');
			uw.$(`#autoparty_single`).removeClass('disabled');
			this.single = true;
		}
		this.save('autoparty_single', this.single);
	};

	toggle = () => {
		if (!this.autoparty) {
			uw.$('#auto_party_title').css(
				'filter',
				'brightness(100%) saturate(186%) hue-rotate(241deg)',
			);
			this.autoparty = setInterval(this.main, 30000);
			this.console.log('Auto Party -> On');
		} else {
			uw.$('#auto_party_title').css('filter', '');
			clearInterval(this.autoparty);
			this.autoparty = null;
			this.console.log('Auto Party -> Off');
		}
		this.save('enable_autoparty', !!this.autoparty);
	};

	/* Return list of town with active celebration */
	getCelebrationsList = (type) => {
		const celebrationModels = uw.MM.getModels().Celebration;
		if (typeof celebrationModels === 'undefined') return [];
		const triumphs = Object.values(celebrationModels)
			.filter((celebration) => celebration.attributes.celebration_type === type)
			.map((triumph) => triumph.attributes.town_id);
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
		if (this.single) {
			for (let town_id in uw.ITowns.towns) {
				if (triumph.includes(parseInt(town_id))) continue;
				console.log(town_id);
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

	main = async () => {
		if (this.active_types['procession']) await this.checkTriumph();
		if (this.active_types['festival']) await this.checkParty();
	};
}

class AutoRuralLevel extends ModernUtil {
	constructor(console) {
		super();
		this.console = console;

		this.rural_level = this.load('enable_autorural_level', 1);
		if (this.load('enable_autorural_level_active')) this.toggle();
	}

	settings = () => {
		requestAnimationFrame(() => {
			this.setRuralLevel(this.rural_level);
		});

		return `
        <div class="game_border" style="margin-bottom: 20px;">
                ${this.getTitleHtml(
					'auto_rural_level',
					'Auto Rural level',
					this.toggle,
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
        </div>`;
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

	setRuralLevel = (n) => {
		uw.$('#rural_lvl_buttons .button_new').addClass('disabled');
		uw.$(`#rural_lvl_${n}`).removeClass('disabled');
		this.rural_level = n;
		this.save('enable_autorural_level', this.rural_level);
	};

	toggle = () => {
		if (!this.enable_auto_rural) {
			uw.$('#auto_rural_level').css(
				'filter',
				'brightness(100%) saturate(186%) hue-rotate(241deg)',
			);
			this.enable_auto_rural = setInterval(this.main, 20000);
			this.console.log('Auto Rural Level -> On');
		} else {
			uw.$('#auto_rural_level').css('filter', '');
			this.console.log('Auto Rural Level -> Off');
			clearInterval(this.enable_auto_rural);
			this.enable_auto_rural = null;
		}
		this.save('enable_autorural_level_active', !!this.enable_auto_rural);
	};

	main = async () => {
		let player_relation_models = uw.MM.getOnlyCollectionByName('FarmTownPlayerRelation').models;
		let farm_town_models = uw.MM.getOnlyCollectionByName('FarmTown').models;
		let killpoints = uw.MM.getModelByNameAndPlayerId('PlayerKillpoints').attributes;

		/* Get array with all locked rurals */
		const locked = player_relation_models.filter(
			(model) => model.attributes.relation_status === 0,
		);

		/* Get killpoints */

		let available = killpoints.att + killpoints.def - killpoints.used;
		let unlocked = player_relation_models.length - locked.length;

		/* If some rurals still have to be unlocked */
		if (locked.length > 0) {
			/* The first 5 rurals have discount */
			const discounts = [2, 8, 10, 30, 50, 100];
			if (unlocked < discounts.length && available < discounts[unlocked]) return;

			let towns = this.generateList();
			for (let town_id of towns) {
				let town = uw.ITowns.towns[town_id];
				let x = town.getIslandCoordinateX(),
					y = town.getIslandCoordinateY();

				for (let farmtown of farm_town_models) {
					if (farmtown.attributes.island_x != x || farmtown.attributes.island_y != y) {
						continue;
					}

					for (let relation of locked) {
						if (farmtown.attributes.id != relation.attributes.farm_town_id) continue;
						this.unlockRural(town_id, relation.attributes.farm_town_id, relation.id);
						this.console.log(
							`Island ${farmtown.attributes.island_xy}: unlocked ${farmtown.attributes.name}`,
						);
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
							this.upgradeRural(
								town_id,
								relation.attributes.farm_town_id,
								relation.attributes.id,
							);
							this.console.log(
								`Island ${farmtown.attributes.island_xy}: upgraded ${farmtown.attributes.name}`,
							);
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
}

class AutoRuralTrade extends ModernUtil {
	constructor(console) {
		super();
		this.console = console;

		this.min_rural_ratio = this.load('min_rural_ratio', 5);
	}

	settings = () => {
		requestAnimationFrame(() => {
			this.setMinRatioLevel(this.min_rural_ratio);
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
            <div class="game_header bold" style="position: relative; cursor: pointer" onclick="window.modernBot.autoRuralTrade.main()"> 
            <span style="z-index: 10; position: relative;">Auto Trade resouces </span>
            <div id="res_progress_bar" class="progress_bar_auto"></div>
            <div style="position: absolute; right: 10px; top: 4px; font-size: 10px; z-index: 10"> (click to stop) </div>
            <span class="command_count"></span></div>

            <div style="display: inline-flex">
                <div id="autotrade_lvl_buttons" style="padding: 5px; margin-right: 233px">
                    <!-- 1 -->
                    ${this.getButtonHtml('autotrade_lvl_1', 'Iron', this.main, 'iron')}

                    ${this.getButtonHtml('autotrade_lvl_2', 'Stone', this.main, 'stone')}

                    ${this.getButtonHtml('autotrade_lvl_3', 'Wood', this.main, 'wood')}
                </div>

                <div id="min_rural_ratio" style="padding: 5px">
                    ${this.getButtonHtml('min_rural_ratio_1', '0.25', this.setMinRatioLevel, 1)}
                    ${this.getButtonHtml('min_rural_ratio_2', '0.5', this.setMinRatioLevel, 2)}
                    ${this.getButtonHtml('min_rural_ratio_3', '0.75', this.setMinRatioLevel, 3)}
                    ${this.getButtonHtml('min_rural_ratio_4', '1.0', this.setMinRatioLevel, 4)}
                    ${this.getButtonHtml('min_rural_ratio_5', '1.25', this.setMinRatioLevel, 5)}
                </div>
            </div>
        </div>
        `;
	};

	setMinRatioLevel = (n) => {
		uw.$('#min_rural_ratio .button_new').addClass('disabled');
		uw.$(`#min_rural_ratio_${n}`).removeClass('disabled');
		this.min_rural_ratio = n;
		this.save('min_rural_ratio', n);
	};

	/*  Trade with all rurals*/
	main = async (resouce) => {
		if (resouce) {
			/* Set button disabled */
			// if (uw.$(`#autotrade_lvl_${i}`).hasClass('disabled')) return;
			[1, 2, 3, 4].forEach((i) => {
				uw.$(`#autotrade_lvl_${i}`).addClass('disabled').css('cursor', 'auto');
			});
			this.trade_resouce = resouce;

			/* Set the current trade to polis at index 0 */
			this.total_trade = Object.keys(uw.ITowns.towns).length;
			this.done_trade = 0;

			/* Set the interval */
			this.auto_trade_resouces_loop = setInterval(this.mainTradeLoop, 1500);
		} else {
			/* Clear the interval */
			clearInterval(this.auto_trade_resouces_loop);

			/* Re-enable buttons and set progress to 0 */
			uw.$('#res_progress_bar').css('width', 0);
			[1, 2, 3, 4].forEach((i) => {
				uw.$(`#autotrade_lvl_${i}`).removeClass('disabled').css('cursor', 'pointer');
			});
		}
	};

	tradeWithRural = async (polis_id) => {
		let town = uw.ITowns.towns[polis_id];
		if (!town) return;
		if (town.getAvailableTradeCapacity() < 3000) return;
		//if (this.check_for_hide && town.getBuildings().attributes.hide < 10) return;

		let farm_town_models = uw.MM.getOnlyCollectionByName('FarmTown').models;
		let player_relation_models = uw.MM.getOnlyCollectionByName('FarmTownPlayerRelation').models;

		/* Create list with all the farmtown in current island polis */
		let x = town.getIslandCoordinateX(),
			y = town.getIslandCoordinateY();
		let resources = town.resources();

		for (const farmtown of farm_town_models) {
			if (farmtown.attributes.island_x != x || farmtown.attributes.island_y != y) continue;
			if (farmtown.attributes.resource_offer != this.trade_resouce) continue;
			if (resources[farmtown.attributes.resource_demand] < 3000) continue;

			for (const relation of player_relation_models) {
				if (farmtown.attributes.id != relation.attributes.farm_town_id) continue;
				if (relation.attributes.current_trade_ratio < this.min_rural_ratio * 0.25) continue;
				if (town.getAvailableTradeCapacity() < 3000) continue;
				this.tradeRuralPost(
					relation.attributes.farm_town_id,
					relation.attributes.id,
					town.getAvailableTradeCapacity(),
					town.id,
				);
				await this.sleep(750);
			}
		}
	};

	mainTradeLoop = async () => {
		/* If last polis, then trigger to stop */
		if (this.done_trade >= this.total_trade) {
			this.main();
			return;
		}
		/* perform trade with current index */
		let towns = Object.keys(uw.ITowns.towns);
		await this.tradeWithRural(towns[this.done_trade]);

		/* update progress bar */
		uw.$('#res_progress_bar').css('width', `${(this.done_trade / this.total_trade) * 100}%`);

		this.done_trade += 1;
	};
}

/* 
    botConsole.log(message);
    ideas:
        - add colors  
*/

class BotConsole {
	constructor() {
		this.string = [];
		this.updateSettings();
	}

	renderSettings = () => {
		setTimeout(() => {
			this.updateSettings();
			let interval = setInterval(() => {
				this.updateSettings();
				if (!uw.$('#modern_console').length) clearInterval(interval);
			}, 1000);
		}, 100);
		return `<div class="console_modernbot" id="modern_console"><div>`;
	};

	log = (string) => {
		const date = new Date();
		const time = date.toLocaleTimeString();
		this.string.push(`[${time}] ${string}`);
	};

	updateSettings = () => {
		let console = uw.$('#modern_console');
		this.string.forEach((e, i) => {
			if (uw.$(`#log_id_${i}`).length) return;
			console.prepend(`<p id="log_id_${i}">${e}</p>`);
		});
	};
}

/* 
    Create a new window
 */
class createGrepoWindow {
	constructor({ id, title, size, tabs, start_tab, minimizable = true }) {
		this.minimizable = minimizable;
		this.width = size[0];
		this.height = size[1];
		this.title = title;
		this.id = id;
		this.tabs = tabs;
		this.start_tab = start_tab;

		/* Private methods */
		const createWindowType = (name, title, width, height, minimizable) => {
			function WndHandler(wndhandle) {
				this.wnd = wndhandle;
			}
			Function.prototype.inherits.call(WndHandler, uw.WndHandlerDefault);
			WndHandler.prototype.getDefaultWindowOptions = function () {
				return {
					position: ['center', 'center', 100, 100],
					width: width,
					height: height,
					minimizable: minimizable,
					title: title,
				};
			};
			uw.GPWindowMgr.addWndType(name, `${name}_75624`, WndHandler, 1);
		};

		const getTabById = (id) => {
			return this.tabs.filter((tab) => tab.id === id)[0];
		};

		this.activate = function () {
			createWindowType(this.id, this.title, this.width, this.height, this.minimizable); //
			uw.$(
				`<style id="${this.id}_custom_window_style">
                 #${this.id} .tab_icon { left: 23px;}
                 #${this.id} {top: -36px; right: 95px;}
                 #${this.id} .submenu_link {color: #000;}
                 #${this.id} .submenu_link:hover {text-decoration: none;}
                 #${this.id} li { float:left; min-width: 60px; }
                 </style>
                `,
			).appendTo('head');
		};

		this.deactivate = function () {
			if (uw.Layout.wnd.getOpenFirst(uw.GPWindowMgr[`TYPE_${this.id}`])) {
				uw.Layout.wnd.getOpenFirst(uw.GPWindowMgr[`TYPE_${this.id}`]).close();
			}
			uw.$(`#${this.id}_custom_window_style`).remove();
		};

		/* open the window */
		this.openWindow = function () {
			let wn = uw.Layout.wnd.getOpenFirst(uw.GPWindowMgr[`TYPE_${this.id}`]);

			/* if open is called but window it's alreay open minimized, maximize that */
			if (wn) {
				if (wn.isMinimized()) {
					wn.maximizeWindow();
				}
				return;
			}

			let content = `<ul id="${this.id}" class="menu_inner"></ul><div id="${this.id}_content"> </div>`;
			uw.Layout.wnd.Create(uw.GPWindowMgr[`TYPE_${this.id}`]).setContent(content);
			/* Add and reder tabs */
			this.tabs.forEach((e) => {
				let html = `
                    <li><a id="${e.id}" class="submenu_link" href="#"><span class="left"><span class="right"><span class="middle">
                    <span class="tab_label"> ${e.title} </span>
                    </span></span></span></a></li>
                `;
				uw.$(html).appendTo(`#${this.id}`);
			});

			/* Add events to tabs */
			let tabs = '';
			this.tabs.forEach((e) => {
				tabs += `#${this.id} #${e.id}, `;
			});
			tabs = tabs.slice(0, -2);
			let self = this;
			uw.$(tabs).click(function () {
				self.renderTab(this.id);
			});
			/* render default tab*/
			this.renderTab(this.tabs[this.start_tab].id);
		};

		this.closeWindow = function () {
			uw.Layout.wnd.getOpenFirst(uw.GPWindowMgr[`TYPE_${this.id}`]).close();
		};

		/* Handle active tab */
		this.renderTab = function (id) {
			let tab = getTabById(id);
			uw.$(`#${this.id}_content`).html(getTabById(id).render());
			uw.$(`#${this.id} .active`).removeClass('active');
			uw.$(`#${id}`).addClass('active');
			getTabById(id).afterRender ? getTabById(id).afterRender() : '';
		};
	}
}

/* Setup autofarm in the window object */

class ModernBot {
	constructor() {
		this.console = new BotConsole();
		this.autoGratis = new AutoGratis(this.console);
		this.autoFarm = new AutoFarm(this.console);
		this.autoRuralLevel = new AutoRuralLevel(this.console);
		this.autoBuild = new AutoBuild(this.console);
		this.autoRuralTrade = new AutoRuralTrade(this.console);
		this.autoBootcamp = new AutoBootcamp(this.console);
		this.autoParty = new AutoParty(this.console);

		this.settingsFactory = new createGrepoWindow({
			id: 'MODERN_BOT',
			title: 'ModernBot',
			size: [800, 300],
			tabs: [
				{
					title: 'Farm',
					id: 'farm',
					render: this.settingsFarm,
				},
				{
					title: 'Build',
					id: 'build',
					render: this.settingsBuild,
				},
				{
					title: 'Mix',
					id: 'mix',
					render: this.settingsMix,
				},
				{
					title: 'Console',
					id: 'console',
					render: this.console.renderSettings,
				},
			],
			start_tab: 0,
		});
		this.settingsFactory.activate();
		// TODO: Fix this button for the time attacch the settings event
		// TODO: change the icon with the one of the Modernbot
		uw.$('.gods_area_buttons').append(
			"<div class='circle_button modern_bot_settings' onclick='window.modernBot.settingsFactory.openWindow()'><div style='width: 27px; height: 27px; background: url(https://raw.githubusercontent.com/Sau1707/ModernBot/main/img/gear.png) no-repeat 6px 5px' class='icon js-caption'></div></div>",
		);
	}

	settingsFarm = () => {
		let html = '';
		html += this.autoFarm.settings();
		html += this.autoRuralLevel.settings();
		html += this.autoRuralTrade.settings();
		return html;
	};

	settingsBuild = () => {
		let html = '';
		html += this.autoGratis.settings();
		html += this.autoBuild.settings();
		return html;
	};

	settingsMix = () => {
		let html = '';
		html += this.autoBootcamp.settings();
		html += this.autoParty.settings();
		return html;
	};
}

setTimeout(() => {
	uw.modernBot = new ModernBot();
	setTimeout(() => uw.modernBot.settingsFactory.openWindow(), 500);
}, 1000);
