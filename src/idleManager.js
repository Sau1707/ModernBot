class IdleManager extends ModernUtil {
	#idleTime = 0;
	#idleThreshold = 30 * 1000;
	#idleLogged = false;

	#taskQueue = null;

	/**
	 * Instance of queue performing our scheduled tasks.
	 * @param {TaskQueue} taskQueue
	 */
	constructor(taskQueue, c, s) {
		super(c, s);

		document.addEventListener('mousemove', () => this.resetIdleTime());
		document.addEventListener('click', () => this.resetIdleTime());

		this.#taskQueue = taskQueue;

		setInterval(() => this.checkIdleTime(), 1000);
	}

	resetIdleTime() {
		this.#idleTime = 0;
		this.#idleLogged = false;
	}

	checkIdleTime() {
		this.#idleTime += 1000;

		if (this.#idleTime > this.#idleThreshold && this.#taskQueue.isStopped) {
			this.#taskQueue.start();

			this.console.log('User idle, resuming queue.');

			this.#idleLogged = true;
		}

		if (!this.#taskQueue.isStopped && this.#idleTime < this.#idleThreshold) {
			this.console.log('User active, stopping queue.');

			this.#taskQueue.stop();
		}
	}
}
