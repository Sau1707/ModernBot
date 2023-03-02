/* Setup autofarm in the window object */

setTimeout(() => {
	let uw;
	if (typeof unsafeWindow === 'undefined') {
		uw = window;
	} else {
		uw = unsafeWindow;
	}

	uw.modernBot = true;
	uw.botConsole = new BotConsole();
	uw.autoFarm = new AutoFarm();
	uw.autoBuild = new AutoBuild();
	uw.mixedBot = new MixedBot();

	let tabs = [
		{
			title: 'Farm',
			id: 'farm',
			render: uw.autoFarm.renderSettings,
		},
		{
			title: 'Build',
			id: 'build',
			render: uw.autoBuild.renderSettings,
		},
		{
			title: 'Train',
			id: 'train',
			render: () => `
            <ul>
                <li> todo: list polis + troops count </li>
                <li> todo: usa richiamo </li>
                <li> todo: move hero </li>
            </ul>
            `,
		},
		{
			title: 'Trade',
			id: 'trade',
			render: () => `
            `,
		},
		{
			title: 'Mix',
			id: 'mix',
			render: uw.mixedBot.renderSettings,
		},
		{
			title: 'Console',
			id: 'console',
			render: uw.botConsole.renderSettings,
		},
	];

	uw.modernWindow = new createGrepoWindow({
		id: 'MODERN_BOT',
		title: 'ModernBot',
		size: [800, 300],
		tabs: tabs,
		start_tab: 0,
	});

	uw.modernWindow.activate();

	$('.gods_area_buttons').append(
		"<div class='btn_settings circle_button settings modern_bot_settings' onclick='window.modernWindow.openWindow()'><div style='filter: grayscale(100%)' class='icon js-caption'></div></div>",
	);

	setTimeout(() => uw.modernWindow.openWindow(), 500);
}, 1000);
