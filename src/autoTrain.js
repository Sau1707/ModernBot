class AutoTrain extends ModernUtil {
	constructor(console) {
		super();
		this.console = console;

		this.city_troops = this.load('city_troops', {});
	}

	settings = () => {
		// ''minotaur', 'manticore', 'zyklop', 'harpy', 'medusa', 'centaur', 'pegasus', 'cerberus', 'fury', 'griffin', 'calydonian_boar', 'satyr', 'spartoi', 'ladon', 'godsent',
		// '', '', 'attack_ship', 'demolition_ship', '', 'trireme', 'colonize_ship', 'sea_monster', 'siren'

		requestAnimationFrame(() => {
			this.setPolisInSettings(uw.ITowns.getCurrentTown().id);
			/*this.updateTitle();*/

			uw.$.Observer(uw.GameEvents.town.town_switch).subscribe(() => {
				this.setPolisInSettings(uw.ITowns.getCurrentTown().id);
				/*this.updateTitle();*/
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
            <div class="game_header bold" style="position: relative; cursor: pointer" onclick="window.modernBot.autoRuralTrade.main()"> 
            <span style="z-index: 10; position: relative;">Auto Train </span>
            <div id="res_progress_bar" class="progress_bar_auto"></div>
            <div style="position: absolute; right: 10px; top: 4px; font-size: 10px; z-index: 10"> (click to stop) </div>
            <span class="command_count"></span></div>

            <div id="troops_lvl_buttons"></div>    
        </div>
    `;
	};

	getTotalPopulation = (town_id) => {
		let town = uw.ITowns.towns[town_id];
		let free = town.getAvailablePopulation();
		let used = 0;

		const data = GameData.units;
		let units = town.units();
		for (let unit in units) {
			used += data[unit].population * units[unit];
		}

		let orders = town.getUnitOrdersCollection().models;
		for (let order of orders) {
			used += data[order.attributes.unit_type].population * order.attributes.units_left;
		}

		let outer = town.unitsOuter();
		for (let unit in outer) {
			used += data[unit].population * outer[unit];
		}
		// TODO add troops that are outside
		return free + used;
	};

	isGray = (troop, researches, buildings) => {
		const requirements = {
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

		if (!requirements.hasOwnProperty(troop)) {
			return true; // Troop type not recognized
		}

		const { research, building, level } = requirements[troop];
		if (research && !researches[research]) return true;
		if (building && buildings[building] < level) return true;

		return false;
	};

	setPolisInSettings = (town_id) => {
		let town = uw.ITowns.towns[town_id];
		let researches = town.researches().attributes;
		let buildings = town.buildings().attributes;

		const getTroopHtml = (troop, bg) => {
			let gray = this.isGray(troop, researches, buildings);

			let town_id = 0;
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
        <div id="build_settings_${town_id}">
            <div style="width: 600px; margin-bottom: 3px; display: inline-flex">
            <a class="gp_town_link" href="${town.getLinkFragment()}">${town.getName()}</a> 
            <p style="font-weight: bold; margin: 0px 5px"> [${town.getPoints()} pts] </p>
            <p style="font-weight: bold; margin: 0px 5px"> </p>
            <div class="population_icon">
                <p> ${this.getTotalPopulation(town_id)} <p>
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

	editTroopCount = (town_id, troop) => {};

	trigger = () => {};

	main = () => {};
}
