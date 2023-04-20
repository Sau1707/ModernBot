class AutoTrade extends ModernUtil {
	constructor(c, s) {
		super(c, s);
	}

	settings = () => {
		return `
        <div class="game_border" style="margin-bottom: 20px">
            ${this.getTitleHtml('auto_trade', 'Auto Trade', '', '', this.enable_auto_farming)}
            <div class="split_content">
            <div id="trade_types" style="padding: 5px;">
                ${this.getButtonHtml('farming_lvl_1', '5 min', this.setAutoFarmLevel, 1)}
                ${this.getButtonHtml('farming_lvl_2', '10 min', this.setAutoFarmLevel, 2)}
                ${this.getButtonHtml('farming_lvl_3', '20 min', this.setAutoFarmLevel, 3)}
                ${this.getButtonHtml('farming_lvl_4', '40 min', this.setAutoFarmLevel, 4)}
            </div>
            </div>    
        </div> `;
	};
}

function autoTradeBot() {
	const uw = unsafeWindow;
	const unit_counnt = {
		bireme: 2.9,
		slinger: 28,
	};

	this.tradeUntilComplete = async (target = 'active', troop = 'bireme') => {
		console.log(troop);
		let ammount;
		if (target === 'active') target = uw.ITowns.getCurrentTown().id;
		do {
			console.log('Trade Loop');
			ammount = await this.trade(target, troop);
			await sleep(30000);
		} while (ammount > 0);
		console.log('Tradeing Done');
	};

	this.trade = async function (target = 'active', troop = 'bireme') {
		if (target === 'active') target = uw.ITowns.getCurrentTown().id;
		let ammount = await calculateAmmount(target, troop);
		let current_ammount;
		do {
			current_ammount = ammount;
			for (let town of Object.values(uw.ITowns.towns)) {
				if (town.id == target) continue;
				if (uw.stopBot) break;
				if (ammount <= 0) break;
				ammount = await sendBalance(town.id, target, troop, ammount);
			}
		} while (current_ammount > ammount);
		return ammount;
	};

	/* return all the trades */
	async function getAllTrades() {
		return new Promise(function (myResolve, myReject) {
			uw.gpAjax.ajaxGet('town_overviews', 'trade_overview', {}, !0, e => {
				myResolve(e.movements);
			});
		});
	}

	/* Return the ammount of toops duable with the current resouces */
	function getCount(targtet_id, troop) {
		let target_polis = uw.ITowns.towns[targtet_id];
		if (!target_polis) return {};
		let resources = target_polis.resources();
		let wood = resources.wood / uw.GameData.units[troop].resources.wood;
		let stone = resources.stone / uw.GameData.units[troop].resources.stone;
		let iron = resources.iron / uw.GameData.units[troop].resources.iron;
		let min = Math.min(wood, stone, iron);
		return min;
	}

	/* Return the id of the polis from the name */
	function getTradeTarget(html) {
		const element = document.createElement('div');
		element.innerHTML = html;
		let name = element.textContent;
		for (let town of Object.values(uw.ITowns.towns)) {
			if (town.name == name) return town.id;
		}
	}

	/* Return ammount of troops duable for resouces in a trade */
	function getCountFromTrade(trade, troop) {
		let wood = trade.res.wood / uw.GameData.units[troop].resources.wood;
		let stone = trade.res.stone / uw.GameData.units[troop].resources.stone;
		let iron = trade.res.iron / uw.GameData.units[troop].resources.iron;
		let min = Math.min(wood, stone, iron);
		return min;
	}

	/* Return ammount of resouces to be send */
	async function calculateAmmount(targtet_id, troop) {
		let target_polis = uw.ITowns.towns[targtet_id];
		if (!target_polis) return {};
		let current_count = {};

		let discount = uw.GeneralModifications.getUnitBuildResourcesModification(targtet_id, uw.GameData.units[troop]);
		let todo = parseInt(target_polis.getAvailablePopulation() / uw.GameData.units[troop].population) * discount;
		let in_polis = getCount(targtet_id, troop);

		/* If the polis has all the resouces -> no resouces has to be sent */
		todo -= in_polis;
		if (todo < 0) return 0;

		let trade = uw.MM.getCollections().Trade[0].models;
		let trades = await getAllTrades();
		for (let trade of trades) {
			if (getTradeTarget(trade.to.link) != targtet_id) continue;
			todo -= getCountFromTrade(trade, troop);
		}
		return todo;
	}

	function getCountWithTrade(targtet_id, troop) {
		let target_polis = uw.ITowns.towns[targtet_id];
		if (!target_polis) return {};
		let resources = target_polis.resources();
		let wood = resources.wood / uw.GameData.units[troop].resources.wood;
		let stone = resources.stone / uw.GameData.units[troop].resources.stone;
		let iron = resources.iron / uw.GameData.units[troop].resources.iron;
		let min_resouces = Math.min(wood, stone, iron); // min ammount
		let trade = target_polis.getAvailableTradeCapacity();
		let max_trade = trade / (uw.GameData.units[troop].resources.wood + uw.GameData.units[troop].resources.stone + uw.GameData.units[troop].resources.iron); // max tradable

		if (max_trade < min_resouces) return max_trade;
		else return min_resouces;
	}

	/* Set await and add promise */
	function sendTradeRequest(from_id, target_id, troop, count) {
		let data = {
			id: target_id,
			wood: uw.GameData.units[troop].resources.wood * count,
			stone: uw.GameData.units[troop].resources.stone * count,
			iron: uw.GameData.units[troop].resources.iron * count,
			town_id: from_id,
			nl_init: true,
		};

		return new Promise(function (myResolve, myReject) {
			uw.gpAjax.ajaxPost('town_info', 'trade', data, !0, () => {
				setTimeout(() => myResolve(), 500);
			});
		});
	}

	/* Send resouces from polis to target, balanced for that troop, return updated count*/
	async function sendBalance(polis_id, target_id, troop, count) {
		let troops_ammount = unit_counnt[troop];
		if (!troops_ammount) return 0;
		if (polis_id == target_id) return count;
		let sender_polis = uw.ITowns.towns[polis_id];
		let duable = getCount(polis_id, troop);
		if (duable < troops_ammount) return count;
		if (sender_polis.getAvailableTradeCapacity() < 500) return count;
		let duable_with_trade = getCountWithTrade(polis_id, troop);
		if (duable_with_trade < troops_ammount) return count;
		await sendTradeRequest(polis_id, target_id, troop, troops_ammount);
		return count - troops_ammount < 0 ? 0 : count - troops_ammount;
	}

	function sleep(time) {
		return new Promise(function (myResolve, myReject) {
			setTimeout(() => myResolve(), time);
		});
	}
}
