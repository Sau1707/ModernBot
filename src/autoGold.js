class AutoGold extends ModernUtil {
    constructor(c, s) {
        super(c, s);
    }

    GetMarketValues = () => {   
        const town_id = uw.ITowns.getCurrentTownID();
        console.log(town_id);
        const values = getMarketData(town_id)
        if (values) {
            
        }
    }

    /* {"model_url":"PremiumExchange","action_name":"read","town_id":681,"nl_init":true} */

    getMarketData = (town_id) => {
		const data = {
			model_url: `PremiumExchange`,
			action_name: 'read',
			town_id: town_id,
            nl_init: true,
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
	};

	main = async () => {
		this.GetMarketValues();
	};

}
