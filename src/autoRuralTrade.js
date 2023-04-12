class AutoRuralTrade extends ModernUtil {
	constructor(c, s) {
		super(c, s);

		this.ratio = this.storage.load('rt_ratio', 5);
	}

	settings = () => {
		requestAnimationFrame(() => {
			this.setMinRatioLevel(this.ratio);
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

            <div class="split_content">
                <div id="autotrade_lvl_buttons" style="padding: 5px;">
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

	setMinRatioLevel = n => {
		uw.$('#min_rural_ratio .button_new').addClass('disabled');
		uw.$(`#min_rural_ratio_${n}`).removeClass('disabled');
		if (this.ratio != n) {
			this.ratio = n;
			this.storage.save('rt_ratio', n);
		}
	};

	/*  Trade with all rurals*/
	main = async resouce => {
		if (resouce) {
			/* Set button disabled */
			[1, 2, 3, 4].forEach(i => {
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
			[1, 2, 3, 4].forEach(i => {
				uw.$(`#autotrade_lvl_${i}`).removeClass('disabled').css('cursor', 'pointer');
			});
		}
	};

	tradeWithRural = async polis_id => {
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
				this.tradeRuralPost(relation.attributes.farm_town_id, relation.attributes.id, town.getAvailableTradeCapacity(), town.id);
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

	tradeRuralPost = (farm_town_id, relation_id, count, town_id) => {
		if (count < 100) return;
		const data = {
			model_url: `FarmTownPlayerRelation/${relation_id}`,
			action_name: 'trade',
			arguments: { farm_town_id: farm_town_id, amount: count > 3000 ? 3000 : count },
			town_id: town_id,
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
	};
}
