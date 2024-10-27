// Entry path

// Loop over all the components
// Check that the user has not moved the mouse, if so the bot is stopped
// Check if the bot check is not active, if so the bot is stopped
// Random stop, 

class ModernBot {
    STOP_TIME = 1000 * 5;
    ACTION_DELAY = 1000 * 0;

    constructor() {
        this.lastInteraction = Date.now();
        this.lastAction = Date.now();
        this.loopActive = false;

        this.autoFarm = new AutoFarm();

        new ModernMenu([
            {
                title: 'Farm',
                id: 'farm',
                render: () => this.autoFarm.render(),
            },
            // {
            //     title: 'Build',
            //     id: 'build',
            //     render: () => { },
            // }
        ]);


    }

    enableListeners() {
        $(document).on('mousemove', () => {
            this.lastInteraction = Date.now();
            $("#modern_settings").removeClass("rotate-forever")
        });

        $(document).on('keydown', (e) => {
            this.lastInteraction = Date.now();
            $("#modern_settings").removeClass("rotate-forever")
        });
    }

    async loop() {
        // Check if the captcha is active or the user has interacted with the page
        if (Date.now() - this.lastInteraction < this.STOP_TIME) return;
        if ($('.botcheck').length || $('#recaptcha_window').length) return;
        if (Date.now() - this.lastAction < this.ACTION_DELAY) return;
        // recaptcha_window / g-recaptcha / recaptcha_container / captcha_curtain

        if (this.loopActive) return;
        this.loopActive = true;

        // The bot is active, ensure the settings icon is rotating
        $("#modern_settings").addClass("rotate-forever")

        // After each action, wait for the delay to pass

        // Check if the farm is available
        const hasFarm = await this.autoFarm.execute();
        if (hasFarm) {
            console.log("Farm was executed");
            this.lastAction = Date.now();
            this.loopActive = false;
            return;
        };

        this.loopActive = false;
    }


}


const loader = setInterval(() => {
    if ($("#loader").length > 0) return;
    clearInterval(loader);

    const modernBot = new ModernBot();
    modernBot.enableListeners();

    setInterval(() => {
        modernBot.loop();
    }, 250);

}, 100);
