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
		this.autoTrain = new AutoTrain(this.console);

		this.settingsFactory = new createGrepoWindow({
			id: 'MODERN_BOT',
			title: 'ModernBot',
			size: [845, 300],
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
					title: 'Train',
					id: 'train',
					render: this.settingsTrain,
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
			start_tab: 2,
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

	settingsTrain = () => {
		let html = '';
		html += this.autoTrain.settings();
		return html;
	};
}

setTimeout(() => {
	uw.modernBot = new ModernBot();
	setTimeout(() => uw.modernBot.settingsFactory.openWindow(), 500);
}, 1000);
