class AntiRage extends ModernUtil {
	GOODS_ICONS = {
		athena: 'js-power-icon.animated_power_icon.animated_power_icon_45x45.power_icon45x45.power.strength_of_heroes',
		zeus: 'js-power-icon.animated_power_icon.animated_power_icon_45x45.power_icon45x45.power.fair_wind',
		artemis: 'js-power-icon.animated_power_icon.animated_power_icon_45x45.power_icon45x45.power.effort_of_the_huntress',
	};

	constructor(c, s) {
		super(c, s);

		this.loop_funct = null;
		this.active_god_el = null;

		let commandId;
		const oldCreate = GPWindowMgr.Create;
		GPWindowMgr.Create = function (type, title, params, id) {
			if (type === GPWindowMgr.TYPE_ATK_COMMAND && id) commandId = id;
			return oldCreate.apply(this, arguments);
		};

		/* Attach event to attack opening */
		uw.$.Observer(uw.GameEvents.window.open).subscribe((e, data) => {
			if (data.context != 'atk_command') return;
			//const id = data.wnd.getID();

			let max = 10;
			const addSpell = () => {
				let spellMenu = $('#command_info-god')[0];
				if (!spellMenu) {
					if (max > 0) {
						max -= 1;
						setTimeout(addSpell, 50);
					}
					return;
				}
				$(spellMenu).on('click', this.trigger);

				this.command_id = commandId;
			};

			setTimeout(addSpell, 50);
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
				this.setColor(this.active_god_el.get(0), false);
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

			$('.js-god-box[data-god_id="zeus"]').find('.powers').append(`
            <div id="enchanted_rage" class="js-power-icon animated_power_icon animated_power_icon_45x45 power_icon45x45 power transformation" style="filter: brightness(70%) sepia(104%) hue-rotate(14deg) saturate(1642%) contrast(0.8)">
                <div class="extend_spell">
                    <div class="gold"></div>
                </div>
                <div class="js-caption"></div>
            </div>
            `);

			const html = `
            <table class="popup" id="popup_div" cellpadding="0" cellspacing="0" style="display: block; left: 243px; top: 461px; opacity: 1; position: absolute; z-index: 6001; width: auto; max-width: 400px;">
                <tbody>
                    <tr class="popup_top">
                        <td class="popup_top_left"></td>
                        <td class="popup_top_middle"></td>
                        <td class="popup_top_right"></td>
                    </tr>
                    <tr>
                        <td class="popup_middle_left">&nbsp;</td>
                        <td class="popup_middle_middle" id="popup_content" style="width: auto;">
                            <div class="temple_power_popup ">
                                <div class="temple_power_popup_image power_icon86x86 transformation" style="filter: brightness(70%) sepia(104%) hue-rotate(14deg) saturate(1642%) contrast(0.8)"></div>
                                <div class="temple_power_popup_info">
                                    <h4>Enchanted Rage</h4>
                                    <p> An Enchanted version of the normal rage </p> 
                                    <p> Made for who try to troll with the autoclick </p>
                                    <p><b> Cast Purification and Rage at the same time </b></p>
                                    <div class="favor_cost_info">
                                        <div class="resource_icon favor"></div>
                                        <span>300 zeus + 200 artemis</span>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="popup_middle_right">&nbsp;</td>
                    </tr>
                    <tr class="popup_bottom">
                        <td class="popup_bottom_left"></td>
                        <td class="popup_bottom_middle"></td>
                        <td class="popup_bottom_right"></td>
                    </tr>
                </tbody>
            </table>`;

			const default_popup = `
            <table class="popup" id="popup_div" cellpadding="0" cellspacing="0" style="display: none; opacity: 0;">
	    	    <tbody><tr class="popup_top">
	    	    	<td class="popup_top_left"></td>
	    	    	<td class="popup_top_middle"></td>
	    	    	<td class="popup_top_right"></td>
	    	    </tr>
	    	    <tr>
	    	    	<td class="popup_middle_left">&nbsp;</td>
	    	    	<td class="popup_middle_middle" id="popup_content"></td>
	    	    	<td class="popup_middle_right">&nbsp;</td>
	    	    </tr>
	    	    <tr class="popup_bottom">
	    	    	<td class="popup_bottom_left"></td>
	    	    	<td class="popup_bottom_middle"></td>
	    	    	<td class="popup_bottom_right"></td>
	    	    </tr>
 	            </tbody>
            </table>`;

			const { artemis_favor, zeus_favor } = uw.ITowns.player_gods.attributes;
			console.log(artemis_favor, zeus_favor);
			const enable = artemis_favor >= 200 && zeus_favor >= 300;
			if (!enable) $('#enchanted_rage').css('filter', 'grayscale(1)');

			// TODO: disable if not enable
			$('#enchanted_rage').on({
				click: () => {
					if (!enable) return;
					this.enchanted('zeus');
				},
				mouseenter: event => {
					$('#popup_div_curtain').html(html);
					const $popupDiv = $('#popup_div');
					const offset = $popupDiv.offset();
					const height = $popupDiv.outerHeight();
					const width = $popupDiv.outerWidth();
					const left = event.pageX + 10;
					const top = event.pageY + 10;
					if (left + width > $(window).width()) {
						offset.left -= width;
					} else {
						offset.left = left;
					}
					if (top + height > $(window).height()) {
						offset.top -= height;
					} else {
						offset.top = top;
					}
					$popupDiv.css({
						left: offset.left + 'px',
						top: offset.top + 'px',
						display: 'block',
					});
				},
				mousemove: event => {
					const $popupDiv = $('#popup_div');
					if ($popupDiv.is(':visible')) {
						const offset = $popupDiv.offset();
						const height = $popupDiv.outerHeight();
						const width = $popupDiv.outerWidth();
						const left = event.pageX + 10;
						const top = event.pageY + 10;
						if (left + width > $(window).width()) {
							offset.left -= width;
						} else {
							offset.left = left;
						}
						if (top + height > $(window).height()) {
							offset.top -= height;
						} else {
							offset.top = top;
						}
						$popupDiv.css({
							left: offset.left + 'px',
							top: offset.top + 'px',
						});
					}
				},
				mouseleave: () => {
					$('#popup_div_curtain').html(default_popup);
				},
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
			//await this.sleep(1);
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

/* 

<div id="popup_div_curtain">
    <table class="popup" id="popup_div" cellpadding="0" cellspacing="0" style="display: block; left: 243px; top: 461px; opacity: 1; position: absolute; z-index: 6001; width: auto; max-width: 400px;">
        <tbody><tr class="popup_top">
            <td class="popup_top_left"></td>
            <td class="popup_top_middle"></td>
            <td class="popup_top_right"></td>
        </tr>
        <tr>
            <td class="popup_middle_left">&nbsp;</td>
            <td class="popup_middle_middle" id="popup_content" style="width: auto;"><div>

<div class="temple_power_popup ">
	
    <div class="temple_power_popup_image power_icon86x86 fair_wind"></div>

    <div class="temple_power_popup_info">
        <h4>Vento favorevole</h4>
        <p>La voce di Zeus risuona nell'aria, il vento fa gonfiare le vele delle navi e frecce e dardi sibilanti vengono lanciati con precisione verso il nemico.</p>
    	
            <p><b>Le forze navali attaccanti ottengono un bonus del 10% alla loro forza durante il loro prossimo attacco.</b></p>
                    <div class="favor_cost_info">
                        <div class="resource_icon favor"></div>
                        <span>250 favore</span>
                    </div>
    </div>
</div>
</div></td>
            <td class="popup_middle_right">&nbsp;</td>
        </tr>
        <tr class="popup_bottom">
            <td class="popup_bottom_left"></td>
            <td class="popup_bottom_middle"></td>
            <td class="popup_bottom_right"></td>
        </tr>
      </tbody></table>
</div>

*/
