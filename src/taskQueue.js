class TaskQueue {
	#queue = [];
	#isProcessing = false;
	#isStopped = false;

	constructor() {}

	enqueue(command, data, ...args) {
		this.#queue.push({ command, data, ...args });

		if (!this.#isProcessing && !this.#isStopped) {
			this.processQueue();
		}
	}

	async processQueue() {
		if (this.#queue.length > 0) {
			this.#isProcessing = true;
			const { command, data, ...args } = this.#queue.shift();

			if (eventCommands[command].type === funcType.async) {
				await eventCommands[command].function(data, args);

				this.processQueue();

				return;
			}

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
