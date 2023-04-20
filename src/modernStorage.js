// TODO:
// - disable note notifiation
// - add logs in console

class ModernStorage extends Compressor {
	constructor() {
		super();
		this.check_done = 0;

		/* Add event to add the button in the notes */
		uw.$.Observer(uw.GameEvents.window.open).subscribe((e, i) => {
			if (!i.attributes) return;
			if (i.attributes.window_type != 'notes') return;
			setTimeout(this.addButton, 100);
		});
		uw.$.Observer(uw.GameEvents.window.tab.rendered).subscribe((e, i) => {
			const { attributes } = i.window_model;
			if (!attributes) return;
			if (attributes.window_type !== 'notes') return;
			requestAnimationFrame(this.addButton);
		});
	}

	getStorage = () => {
		const worldId = uw.Game.world_id;
		const savedValue = localStorage.getItem(`${worldId}_modernBot`);
		let storage = {};

		if (savedValue !== null && savedValue !== undefined) {
			try {
				storage = JSON.parse(savedValue);
			} catch (error) {
				console.error(`Error parsing localStorage data: ${error}`);
			}
		}

		return storage;
	};

	saveStorage = storage => {
		try {
			const worldId = uw.Game.world_id;
			localStorage.setItem(`${worldId}_modernBot`, JSON.stringify(storage));
			this.lastUpdateTime = Date.now();
			return true;
		} catch (error) {
			console.error(`Error saving data to localStorage: ${error}`);
			return false;
		}
	};

	save = (key, content) => {
		const storage = this.getStorage();
		storage[key] = content;
		return this.saveStorage(storage);
	};

	load = (key, defaultValue = null) => {
		const storage = this.getStorage();
		const savedValue = storage[key];
		return savedValue !== undefined ? savedValue : defaultValue;
	};

	/* Call to save the setting to the given note id */
	saveSettingsNote = note_id => {
		const storage = JSON.stringify(this.encode(this.getStorage()));
		const data = {
			model_url: `PlayerNote/${note_id}`,
			action_name: 'save',
			arguments: {
				id: note_id,
				text: storage,
			},
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
		return storage;
	};

	/* Call to add the buttons */
	addButton = () => {
		this.check_done += 1;
		if ($('#modern_storage_load').length) return;

		const modern_settings_load = $('<div/>', {
			class: 'button_new',
			id: 'modern_storage_load',
			style: 'position: absolute; bottom: 5px; left: 6px; ',
			onclick: 'modernBot.storage.loadSettings()',
			html: '<div class="left"></div><div class="right"></div><div class="caption js-caption"> Load <div class="effect js-effect"></div></div>',
		});

		const modern_settings_save = $('<div/>', {
			class: 'button_new',
			id: 'modern_storage_save',
			style: 'position: absolute; bottom: 5px; left: 75px; ',
			onclick: 'modernBot.storage.saveSettings()',
			html: '<div class="left"></div><div class="right"></div><div class="caption js-caption"> Save <div class="effect js-effect"></div></div>',
		});

		const box = $('.notes_container');
		if (box.length) {
			$('.notes_container').append(modern_settings_load, modern_settings_save);
		} else {
			if (this.check_done > 10) {
				this.check_done = 0;
				return;
			}
			setTimeout(this.addButton, 100);
		}
	};

	saveSettings = () => {
		uw.ConfirmationWindowFactory.openSimpleConfirmation(
			'ModernStorage',
			'This operation will overwrite the current note with the local settings of the ModernBot',
			() => {
				// trigged when user press yes
				const note = this.getActiveNote();
				if (!note) return; // TODO: display an error
				const content = this.saveSettingsNote(note.id);
				$('.preview_box').text(content);
			},
			() => {}
		);
	};

	loadSettings = () => {
		// TODO: check that the current note has settimhs
		uw.ConfirmationWindowFactory.openSimpleConfirmation(
			'ModernStorage',
			'This operation will load the settings of the current note and overwrite the local settings',
			() => {
				// Trigged when the user press yes
				const note = this.getActiveNote();
				const { text } = note.attributes;
				let decoded;
				try {
					decoded = this.decode(JSON.parse(text));
				} catch {
					HumanMessage.error("This note don't contains the settings");
					return;
				}

				this.saveStorage(decoded);
				location.reload();
			},
			() => {}
		);
	};

	/* Return the current active note */
	getActiveNote() {
		const noteClass = $('.tab.selected').attr('class');
		if (!noteClass) return null;
		const noteX = noteClass.match(/note(\d+)/)[1];
		const note_index = parseInt(noteX) - 1;

		const collection = MM.getOnlyCollectionByName('PlayerNote');
		if (!collection) return null;
		let { models } = collection;

		return models[note_index];
	}
}
