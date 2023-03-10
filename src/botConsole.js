/* 
    botConsole.log(message);
    ideas:
        - add colors  
*/

class BotConsole {
	constructor() {
		this.string = [];
		this.updateSettings();
	}

	renderSettings = () => {
		setTimeout(() => {
			this.updateSettings();
			let interval = setInterval(() => {
				this.updateSettings();
				if (!uw.$('#modern_console').length) clearInterval(interval);
			}, 1000);
		}, 100);
		return `<div class="console_modernbot" id="modern_console"><div>`;
	};

	log = (string) => {
		const date = new Date();
		const time = date.toLocaleTimeString();
		this.string.push(`[${time}] ${string}`);
	};

	updateSettings = () => {
		let console = uw.$('#modern_console');
		this.string.forEach((e, i) => {
			if (uw.$(`#log_id_${i}`).length) return;
			console.prepend(`<p id="log_id_${i}">${e}</p>`);
		});
	};
}
