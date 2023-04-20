class Compressor {
	NUMBERS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	SYMBOLS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-./:;<=>?@[]^_`{|}~';

	ITEMS = {
		// Buildings
		academy: 'a',
		barracks: 'b',
		docks: 'd',
		farm: 'f',
		hide: 'h',
		ironer: 'i',
		lumber: 'l',
		main: 'm',
		market: 'k',
		stoner: 'c',
		storage: 's',
		temple: 't',
		wall: 'w',

		// Troops
		sword: 'A',
		archer: 'B',
		hoplite: 'C',
		slinger: 'D',
		rider: 'E',
		chariot: 'F',
		catapult: 'G',
		big_transporter: 'H',
		small_transporter: 'I',
		bireme: 'L',
		demolition_ship: 'M',
		attack_ship: 'N',
		trireme: 'O',
		colonize_ship: 'P',
	};

	constructor() {
		const swap = json => {
			var ret = {};
			for (var key in json) {
				ret[json[key]] = key;
			}
			return ret;
		};

		this.ITEMS_REV = swap(this.ITEMS);
	}

	/* Pass a storage object, return it encoded */
	encode(storage) {
		for (let item in storage) {
			if (typeof storage[item] !== 'object') continue;

			if (item == 'buildings') {
				for (let polis_id in storage[item]) {
					let obj = storage[item][polis_id];
					storage[item][polis_id] = this.encode_building(obj);
				}
			}

			if (item == 'troops') {
				for (let polis_id in storage[item]) {
					let obj = storage[item][polis_id];
					storage[item][polis_id] = this.encode_troops(obj);
				}
			}
		}

		return storage;
	}

	decode(storage) {
		for (let item in storage) {
			if (typeof storage[item] !== 'object') continue;

			if (item == 'buildings') {
				for (let polis_id in storage[item]) {
					let str = storage[item][polis_id];
					storage[item][polis_id] = this.decode_bulding(str);
				}
			}

			if (item === 'troops') {
				for (let polis_id in storage[item]) {
					let str = storage[item][polis_id];
					storage[item][polis_id] = this.decode_troops(str);
				}
			}
		}

		return storage;
	}

	compressNumber(num) {
		let base = this.SYMBOLS.length;
		let digits = [];
		while (num > 0) {
			digits.unshift(this.SYMBOLS[num % base]);
			num = Math.floor(num / base);
		}
		if (digits.length == 1) {
			digits.unshift('0');
		}
		return digits.slice(-2).join('');
	}

	decompressNumber(str) {
		let base = this.SYMBOLS.length;
		let digits = str.split('');
		let num = 0;
		for (let i = 0; i < digits.length; i++) {
			num += this.SYMBOLS.indexOf(digits[i]) * Math.pow(base, digits.length - i - 1);
		}
		return num;
	}

	/* Give the object of building, return the encoded string */
	encode_building(obj) {
		let str = '';
		for (let item in obj) {
			str += this.ITEMS[item] + this.NUMBERS[obj[item]];
		}
		return str;
	}

	/* Give an encoded string with building, return the correspong object */
	decode_bulding(str) {
		let json_str = '{';
		for (let item of str.match(/.{1,2}/g)) {
			json_str += `"${this.ITEMS_REV[item[0]]}"` + ':' + this.NUMBERS.indexOf(item[1]) + ',';
		}
		json_str = json_str.replace(/,$/, '}');
		return JSON.parse(json_str);
	}

	encode_troops(obj) {
		let str = '';
		for (let item in obj) {
			str += this.ITEMS[item] + this.compressNumber(obj[item]);
		}
		return str;
	}

	decode_troops(str) {
		let json_str = '{';
		for (let item of str.match(/.{1,3}/g)) {
			json_str += `"${this.ITEMS_REV[item[0]]}"` + ':' + this.decompressNumber(item.slice(-2)) + ',';
		}
		json_str = json_str.replace(/,$/, '}');
		return JSON.parse(json_str);
	}
}
