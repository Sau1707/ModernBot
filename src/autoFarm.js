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

	toggle = () => {
		if (!this.enable_auto_farming) {
			$('#auto_farm').css('filter', 'brightness(100%) saturate(186%) hue-rotate(241deg)');
			let btbutton = document.getElementById('autofarm_timer');
			if (btbutton == null) {
				$('.tb_activities, .toolbar_activities').find('.middle').append(this.buttonHtml);
			}
			this.lastTime = Date.now();
			this.timer = 0; // TODO: check if it's really 0
			this.enable_auto_farming = setInterval(this.main, 1000);
			this.console.log('Auto Farm -> On');
		} else {
			$('#autofarm_timer').remove();
			$('#autofarm_timer_divider').remove();
			$('#auto_farm').css('filter', '');
			clearInterval(this.enable_auto_farming);
			this.enable_auto_farming = null;
			this.console.log('Auto Farm -> Off');
		}
		this.save('enable_autofarm', !!this.enable_auto_farming);
	};

	setAutoFarmLevel = (n) => {
		$('#farming_lvl_buttons .button_new').addClass('disabled');
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

		const timerDisplay = document.getElementById('autofarm_timer_p');
		if (timerDisplay == null) {
			$('.tb_activities, .toolbar_activities').find('.middle').append(this.buttonHtml);
		}
		if (this.timer > 0) {
			timerDisplay.innerHTML = Math.round(this.timer / 1000);
		} else {
			timerDisplay.innerHTML = '0';
		}
	};

	main = () => {
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
			this.console.log('Claimed all rurals');
			let rand = Math.floor(Math.random() * this.delta_time);
			this.timer = this.farm_timing * 300000 + rand;
			setTimeout(() => WMap.removeFarmTownLootCooldownIconAndRefreshLootTimers(), 2000);
		}

		/* update the timer */
		this.updateTimer();
	};
}
