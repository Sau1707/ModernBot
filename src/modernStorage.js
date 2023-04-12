// TODO:
// - disable note notifiation
// - add logs in console

class ModernStorage extends Compressor {
	constructor() {
		super();
		/* The active or disactive it's saved locally */
		this.active = localStorage.getItem('modernStorage') || false;
		this.check_done = 0;

		/* Try to load the data from the note */
		if (this.active) {
			this.loadNote().then(e => {
				if (!e) this.createNote();
				try {
					let storage = this.decode(JSON.parse(e.text));
					this.saveStorage(storage);
					this.lastUpdateTime = null;
				} catch (error) {
					console.log(error);
				}
			});
		}

		/* Save the data before the user close the window */
		window.addEventListener('beforeunload', () => {
			if (!this.lastUpdateTime) return;
			this.saveSettingsNote();
		});

		/* After an entry it's saved start a countdown of 30 seconds */
		this.lastUpdateTime = Date.now();
		setInterval(() => {
			if (!this.lastUpdateTime) return;
			const now = Date.now();
			const timeSinceLastUpdate = now - this.lastUpdateTime;
			if (timeSinceLastUpdate > 30000) {
				this.saveSettingsNote();
				this.lastUpdateTime = null;
			}
		}, 1000);

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

	saveSettingsNote = () => {
		if (!this.note_id) return;
		const storage = this.encode(this.getStorage());

		uw.temp = storage;

		const data = {
			model_url: `PlayerNote/${this.note_id}`,
			action_name: 'save',
			arguments: {
				id: this.note_id,
				text: JSON.stringify(storage),
			},
		};
		uw.gpAjax.ajaxPost('frontend_bridge', 'execute', data);
	};

	loadNote = () => {
		return new Promise((resolve, reject) => {
			const data = {
				window_type: 'notes',
				tab_type: 'note1',
				known_data: {
					models: [],
					collections: [],
				},
			};
			uw.gpAjax.ajaxGet('frontend_bridge', 'fetch', data, false, (...data) => {
				const playerNotes = data[0].collections.PlayerNotes.data;
				for (let model of playerNotes) {
					if (model.d.title === 'settings') {
						this.note_id = model.d.id;
						resolve(model.d);
					}
				}
				resolve(null);
			});
		});
	};

	addButton = () => {
		this.check_done += 1;
		if ($('#modern_storage').length) return;
		const modern_settings = $('<div/>', {
			class: 'button_new',
			id: 'modern_storage',
			style: 'position: absolute; bottom: 5px; left: 6px; ',
			onclick: 'modernBot.storage.trigger()',
			html: '<div class="left"></div><div class="right"></div><div class="caption js-caption" id="modern_storage_text"> ModernStorage <div class="effect js-effect"></div></div>',
		});

		const box = $('.notes_container');
		if (box.length) {
			$('.notes_container').append(modern_settings);
			setTimeout(() => this.trigger(false), 10);
		} else {
			if (this.check_done > 10) {
				this.check_done = 0;
				return;
			}
			setTimeout(this.addButton, 100);
		}
	};

	/* Call to trigger the notes */
	trigger(s = true) {
		if (s) {
			this.active = !this.active;
			localStorage.setItem('modernStorage', this.active);

			if (this.active) {
				this.createNote();
				setTimeout(this.saveSettingsNote, 1000);
			}
		}

		$('#modern_storage_text').css({
			color: this.active ? '#00d910' : 'rgb(255 35 35)',
		});
	}

	createNote() {
		if (this.getNoteId()) return;

		/* Create note if not found */
		const data = {
			model_url: 'PlayerNote',
			action_name: 'create',
			arguments: {
				title: 'settings',
				text: '{}',
			},
		};

		gpAjax.ajaxPost('frontend_bridge', 'execute', data, false, (e, i) => {
			$('.btn_save').trigger('click');
			setTimeout(this.addButton, 100);
			setTimeout(() => {
				this.note_id = this.getNoteId();
			}, 101);
		});
	}

	getNoteId() {
		const collection = MM.getOnlyCollectionByName('PlayerNote');
		if (!collection) return null;
		let { models } = collection;
		if (models) {
			for (let model of models) {
				let { attributes } = model;
				if (attributes.title == 'settings') return model;
			}
		}
		return null;
	}
}
