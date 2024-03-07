const getEventName =
	(...args) =>
	prefix =>
		`modernBot:${prefix}:${args.join(':')}`;

const getBuildEventName = getEventName('build');
const getFarmEventName = getEventName('farm');
const getCultureEventName = getEventName('culture');
const getCaveEventName = getEventName('cave');
const getBanditEventName = getEventName('bandit');
const getSpellEventName = getEventName('spell');

const funcType = {
	async: 'async',
	sync: 'sync',
};

const events = {
	build: {
		building: getBuildEventName('building'),
		troops: getBuildEventName('troops'),
		finish: getBuildEventName('finish'),
	},
	farm: {
		unlock: getFarmEventName('unlock'),
		upgrade: getFarmEventName('upgrade'),
		trade: getFarmEventName('trade'),
		single: getFarmEventName('single'),
		multiple: getFarmEventName('multiple'),
	},
	culture: {
		singleCelebration: getCultureEventName('singleCelebration'),
		multipleCelebrations: getCultureEventName('multipleCelebrations'),
	},
	cave: {
		stash: getCaveEventName('stash'),
	},
	bandit: {
		attack: getBanditEventName('attack'),
		useReward: getBanditEventName('useReward'),
		stashReward: getBanditEventName('stashReward'),
	},
	spell: {
		cast: getSpellEventName('cast'),
	},
};

const eventCommands = {
	/* Building events */
	[events.build.building]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, ...args),
		type: funcType.async,
	},
	[events.build.troops]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('building_barracks', 'build', data, ...args),
		type: funcType.async,
	},
	[events.build.finish]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, ...args),
		type: funcType.async,
	},

	/* Farming events */
	[events.farm.unlock]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, ...args),
		type: funcType.async,
	},
	[events.farm.upgrade]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, ...args),
		type: funcType.async,
	},
	[events.farm.trade]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, ...args),
		type: funcType.async,
	},
	[events.farm.single]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, ...args),
		type: funcType.async,
	},
	[events.farm.multiple]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, ...args),
		type: funcType.async,
	},

	/* Culture events */
	[events.culture.singleCelebration]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('building_place', 'start_celebration', data, ...args),
		type: funcType.async,
	},
	[events.culture.multipleCelebrations]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('town_overviews', 'start_all_celebrations', data, ...args),
		type: funcType.async,
	},

	/* Cave events */
	[events.cave.stash]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, ...args),
		type: funcType.async,
	},

	/* Bandit events */
	[events.bandit.attack]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, ...args),
		type: funcType.async,
	},
	[events.bandit.useReward]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, ...args),
		type: funcType.async,
	},
	[events.bandit.stashReward]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, ...args),
		type: funcType.async,
	},

	/* Spell events */
	[events.spell.cast]: {
		function: (data, ...args) => uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data, ...args),
		type: funcType.async,
	},
};

/** Priority from 1-5, 1 indicates higest priority and will be taken from queue first */
const priority = {
	1: 1,
	2: 2,
	3: 3,
	4: 4,
	5: 5,
};
