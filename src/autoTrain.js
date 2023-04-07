class AutoTrain extends ModernUtil {
    constructor(c, s) {
        super(c, s);

        this.city_troops = this.storage.load('city_troops', {});
        this.active = this.storage.load('autotrain_active', []);

        this.shiftHeld = false;

        setInterval(this.main, 10000);
    }

    settings = () => {
        requestAnimationFrame(() => {
            this.setPolisInSettings(uw.ITowns.getCurrentTown().id);
            this.updatePolisInSettings(uw.ITowns.getCurrentTown().id);

            uw.$.Observer(uw.GameEvents.town.town_switch).subscribe(() => {
                this.setPolisInSettings(uw.ITowns.getCurrentTown().id);
                this.updatePolisInSettings(uw.ITowns.getCurrentTown().id);
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

        let used = 0;
        for (let order of orders) {
            used += data[order.attributes.unit_type].population * order.attributes.count;
        }
        let units = town.units();
        for (let unit of Object.keys(units)) {
            used += data[unit].population * units[unit];
        }
        let outher = town.unitsOuter();
        for (let out of Object.keys(outher)) {
            used += data[out].population * outher[out];
        }
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
        this.storage.save('city_troops', this.city_troops);
    };

    /**
     * Updates the display of troop counts for a given town in the settings panel.
     * Also updates the display of the autotrain status indicator based on whether the town is active or inactive.
     * @param {number} town_id - The id of the town to update the display for.
     * @returns {void}
     */
    updatePolisInSettings = town_id => {
        const { units } = GameData;
        const cityTroops = this.city_troops[town_id];

        Object.keys(units).forEach(troop => {
            const guiCount = cityTroops?.[troop] ?? 0;
            const selector = `#troops_settings_${town_id} #troop_lvl_${troop}`;

            if (guiCount > 0) {
                uw.$(selector).css('color', 'orange').text(guiCount);
            } else {
                uw.$(selector).css('color', '').text('-');
            }
        });

        const isTownActive = this.active.includes(town_id);
        uw.$('#auto_train_title').css('filter', isTownActive ? 'brightness(100%) saturate(186%) hue-rotate(241deg)' : '');
    };

    /* return status of the give polis */
    getPolisStatus = town_id => {
        if (!this.city_troops.hasOwnProperty(town_id)) return 'inactive';
        if (this.active.includes(town_id)) return 'active';
        return 'inactive';
    };

    /**
     * Sets the auto-train status for a given town.
     * @param {number} townId - The ID of the town to set the status for.
     * @param {string} status - The status to set ('active' or 'inactive').
     * @throws {Error} If an invalid status is provided.
     */
    setPolisStatus = (townId, status) => {
        if (!['active', 'inactive'].includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }
        const activeTowns = new Set(this.active);
        if (status === 'active') {
            activeTowns.add(townId);
        } else {
            activeTowns.delete(townId);
        }
        this.active = [...activeTowns];
    };

    /**
     * Toggles the auto-train status for the current town between 'active' and 'inactive'.
     */
    trigger = () => {
        const town = uw.ITowns.getCurrentTown();
        const townId = town.getId();
        const status = this.getPolisStatus(townId);
        if (!this.city_troops[townId]) return;
        const newStatus = status === 'active' ? 'inactive' : 'active';
        this.setPolisStatus(townId, newStatus);
        const filterValue = newStatus === 'active' ? 'brightness(100%) saturate(186%) hue-rotate(241deg)' : '';
        uw.$('#auto_train_title').css('filter', filterValue);
        this.storage.save('autotrain_active', this.active);
    };

    /**
     * Returns the number of pending unit orders of the given type for the specified town or the current town.
     * @param {string} type - The type of unit orders to count (e.g. 'attack', 'support', 'transport').
     * @param {number} [townId] - Optional. The ID of the town to check. If omitted, the current town is used.
     * @returns {number} The number of pending unit orders of the given type.
     */
    getUnitOrdersCount = (type, townId = null) => {
        const town = townId ? uw.ITowns.getTown(townId) : uw.ITowns.getCurrentTown();
        const orders = town.getUnitOrdersCollection().where({ kind: type });
        return orders.length;
    };

    /**
     * Returns the next available troop type for the given town ID and unit type.
     * @param {string} unitType - The type of units ('naval' or 'ground').
     * @param {string} townId - The ID of the town.
     * @returns {string|null} The next available troop type, or null if none are available.
     */
    getNextInList = (unitType, townId) => {
        const troops = this.city_troops[townId];
        if (!troops) {
            return null;
        }

        const naval_order = ['small_transporter', 'bireme', 'trireme', 'attack_ship', 'big_transporter', 'demolition_ship', 'colonize_ship'];
        const ground_order = ['catapult', 'sword', 'archer', 'hoplite', 'slinger', 'rider', 'chariot'];
        const unitOrder = unitType === 'naval' ? naval_order : ground_order;

        for (const unit of unitOrder) {
            if (troops[unit] && this.getTroopCount(unit, townId) !== 0) {
                return unit;
            }
        }

        return null;
    };

    getTroopCount = (troop, town_id) => {
        let town = town_id ? uw.ITowns.towns[town_id] : uw.ITowns.getCurrentTown();
        if (!this.city_troops[town_id]) return 0;
        if (!this.city_troops[town_id][troop]) return 0;
        let count = this.city_troops[town_id][troop];
        for (let order of town.getUnitOrdersCollection().models) {
            if (order.attributes.unit_type === troop) count -= order.attributes.count;
        }
        let townUnits = town.units();
        if (townUnits.hasOwnProperty(troop)) count -= townUnits[troop];
        let outerUnits = town.unitsOuter();
        if (outerUnits.hasOwnProperty(troop)) count -= outerUnits[troop];
        //TODO: in viaggio
        if (count < 0) return 0;

        /* Get the duable ammount with the current resouces of the polis */
        let resources = town.resources();
        let discount = uw.GeneralModifications.getUnitBuildResourcesModification(town_id, uw.GameData.units[troop]);
        let { wood, stone, iron } = uw.GameData.units[troop].resources;
        let w = resources.wood / Math.round(wood * discount);
        let s = resources.stone / Math.round(stone * discount);
        let i = resources.iron / Math.round(iron * discount);
        let current = parseInt(Math.min(w, s, i));

        /* Check for free population */
        let duable_with_pop = parseInt(resources.population / uw.GameData.units[troop].population); // for each troop

        /* Get the max duable */
        let w_max = resources.storage / (wood * discount);
        let s_max = resources.storage / (stone * discount);
        let i_max = resources.storage / (iron * discount);
        let max = parseInt(Math.min(w_max, s_max, i_max) * 0.85); // 0.8 it's the full percentual -> 80%
        max = max > duable_with_pop ? duable_with_pop : max;

        if (max > count) {
            return count > current ? -1 : count;
        } else {
            if (current >= max && current < duable_with_pop) return current;
            if (current >= max && current > duable_with_pop) return duable_with_pop;
            return -1;
        }
    };

    checkPolis = (type, town_id) => {
        let order_count = this.getUnitOrdersCount(type, town_id);
        if (order_count > 6) return 0;
        let count = 1;
        while (count >= 0) {
            let next = this.getNextInList(type, town_id);
            if (!next) return 0;
            count = this.getTroopCount(next, town_id);
            if (count < 0) return 0;
            if (count === 0) continue;
            this.buildPost(town_id, next, count);
            return true;
        }
    };

    main = () => {
        if (this.active.length == 0) return;
        for (let town_id of this.active) {
            if (this.checkPolis('naval', town_id)) return;
            if (this.checkPolis('ground', town_id)) return;
        }
    };

    buildPost = (town_id, unit, count) => {
        let town = uw.ITowns.towns[town_id];
        let data = { unit_id: unit, amount: count, town_id: town_id };
        uw.gpAjax.ajaxPost('building_barracks', 'build', data);
        uw.HumanMessage.success('Truppato ' + count + ' su ' + town.name);
    };
}
