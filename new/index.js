// Entry path

// Loop over all the components
// Check that the user has not moved the mouse, if so the bot is stopped
// Check if the bot check is not active, if so the bot is stopped
// Random stop, 

class ModernBot {

    constructor() {
        console.log("ModernBot loadedeeeee");
    }

}


const loader = setInterval(() => {
    if ($("#loader").length > 0) return;
    uw.modernBot = new ModernBot();
    clearInterval(loader);
}, 100);
