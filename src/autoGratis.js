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
			}" class="game_header bold" onclick="window.modernBot.autoGratis.toggle()"> Auto Gratis <span class="command_count"></span>
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
