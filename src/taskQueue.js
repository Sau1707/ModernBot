class TaskQueue {
	#queue = [];
	#taskIDs = new Map()
	#isProcessing = false;
	#isStopped = false;

	constructor() {}

	enqueue(command, data, ...args) {
		const id = generateTaskID(command, data);

		if (this.#taskIDs.get(id)) {
			return
		}
		
		this.#queue.push({ id, command, data, ...args });

		this.#taskIDs.set(id, true);

		if (!this.#isProcessing && !this.#isStopped) {
			this.processQueue();
		}
	}

	async processQueue() {
		if (this.#queue.length > 0) {
			this.#isProcessing = true;
			const { id, command, data, ...args } = this.#queue.shift();

			if (eventCommands[command].type === funcType.async) {
				await eventCommands[command].function(data, args);

				this.#taskIDs.delete(id);

				this.processQueue();

				return;
			}

			this.#taskIDs.delete(id);

			eventFunc[command](data);

			return;
		}

		this.#isProcessing = false;
	}

	stop() {
		this.#isStopped = true;
	}

	start() {
		if (this.#isStopped) {
			this.#isStopped = false;

			if (!this.#isProcessing) {
				this.processQueue();
			}
		}
	}

	get isStopped() {
		return this.#isStopped;
	}
}
