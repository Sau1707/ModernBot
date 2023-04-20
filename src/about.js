// TO BE FINISCHED
class About {
	constructor() {
		this.checkVersion();
	}

	settings = () => {};

	checkVersion = async () => {
		if (!GM_info) return;

		/* Check that the version it's the current one */
		const installedVersion = GM_info.script.version;
		const file = await fetch('https://raw.githubusercontent.com/Sau1707/ModernBot/main/version.txt');
		const lastVersion = await file.text();

		if (lastVersion != installedVersion) {
			console.log('Versions differents');
		}
		console.log(lastVersion, installedVersion);
	};
}
