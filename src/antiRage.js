class AntiRage extends ModernUtil {
	GOODS_ICONS = {
		athena: 'js-power-icon.animated_power_icon.animated_power_icon_45x45.power_icon45x45.power.strength_of_heroes',
		zeus: 'js-power-icon.animated_power_icon.animated_power_icon_45x45.power_icon45x45.power.fair_wind',
		artemis: 'js-power-icon.animated_power_icon.animated_power_icon_45x45.power_icon45x45.power.effort_of_the_huntress',
	};

	constructor(c) {
		super();
		this.console = c;
		this.loop_funct = null;
		this.active_god_el = null;

		//const old = uw.GPWindowMgr.Create;
		//uw.GPWindowMgr.Create = function (...props) {
		//	console.log(props);
		//	return old.call(this, props);
		//};
		let commandId;
		const oldCreate = GPWindowMgr.Create;
		GPWindowMgr.Create = function (type, title, params, id) {
			if (type === GPWindowMgr.TYPE_ATK_COMMAND && id) {
				commandId = id;
				console.log(commandId);
			}
			return oldCreate.apply(this, arguments);
		};

		/* Attach event to attack opening */
		uw.$.Observer(uw.GameEvents.window.open).subscribe((e, data) => {
			if (data.context != 'atk_command') return;
			const id = data.wnd.getID();

			setTimeout(() => {
				let spellMenu = $('#command_info-god')[0];
				if (!spellMenu) return;
				$(spellMenu).on('click', this.trigger);

				this.command_id = commandId;
			}, 100);
		});
	}

	handleGod = good => {
		const godEl = $(`.god_mini.${good}.${good}`).eq(0);
		if (!godEl.length) return;

		const powerClassName = this.GOODS_ICONS[good];

		godEl.css({
			zIndex: 10,
			cursor: 'pointer',
			borderRadius: '100%',
			outline: 'none',
			boxShadow: '0px 0px 10px 5px rgba(255, 215, 0, 0.5)',
		});

		const powerEl = $(`.${powerClassName}`).eq(0);
		if (!powerEl.length) return;

		godEl.click(() => {
			// deactivate the previously active god

			if (this.active_god_el && this.active_god_el.get(0) === godEl.get(0)) {
				clearInterval(this.loop_funct);
				this.loop_funct = null;
				this.setColor(active_god_el.get(0), false);
				this.active_god_el = null;
				return;
			}

			if (this.active_god_el && this.active_god_el.get(0) !== godEl.get(0)) {
				clearInterval(this.loop_funct);
				this.setColor(this.active_god_el.get(0), false);
			}

			this.loop_funct = setInterval(this.clicker, 1000, powerEl);
			this.active_god_el = godEl;
			this.setColor(godEl.get(0), true);
		});
	};

	setColor = (elm, apply) => {
		if (apply) {
			elm.style.filter = 'brightness(100%) sepia(100%) hue-rotate(90deg) saturate(1500%) contrast(0.8)';
		} else {
			elm.style.filter = '';
		}
	};

	trigger = () => {
		setTimeout(() => {
			this.handleGod('athena');
			this.handleGod('zeus');
			this.handleGod('artemis');

			console.log('here');
			$('.js-god-box[data-god_id="zeus"]').find('.powers').append(`
            <div id="enchanted_rage" class="js-power-icon animated_power_icon animated_power_icon_45x45 power_icon45x45 power transformation" style="filter: brightness(70%) sepia(104%) hue-rotate(14deg) saturate(1642%) contrast(0.8)">
                <div class="extend_spell">
                    <div class="gold"></div>
                    <div class="amount"><span class="value">1</span>x</div>
                </div>
                <div class="js-caption"></div>
            </div>
            `);

			// TODO: disable if not enable
			$('#enchanted_rage').on('click', () => {
				this.enchanted('zeus');
			});
		}, 100);
	};

	clicker = el => {
		let check = $('.js-power-icon.animated_power_icon.animated_power_icon_45x45.power_icon45x45.power').eq(0);
		if (!check.length) {
			clearInterval(this.loop_funct);
			this.loop_funct = null;
			this.active_god_el = null;
			return;
		}
		el.click();
		let delta_time = 500;
		let rand = 500 + Math.floor(Math.random() * delta_time);
		clearInterval(this.loop_funct);
		this.loop_funct = setInterval(this.clicker, rand, el);
	};

	enchanted = async type => {
		console.log(type);
		if (type === 'zeus') {
			this.cast(this.command_id, 'cleanse');
			await this.sleep(1);
			this.cast(this.command_id, 'transformation');
		}
	};

	cast = (id, type) => {
		let data = {
			model_url: 'Commands',
			action_name: 'cast',
			arguments: {
				id: id,
				power_id: type,
			},
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
	};
}
