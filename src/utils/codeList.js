export const getArrayOfIdsByParam = (items, param, number = false) => {
	const result = [];
	if (!Array.isArray(items)) {
		if (number) {
			return [Number(items[param])];
		}
		return [items[param]];
	}
	items.forEach((item) => {
		if (number) {
			result.push(Number(item[param]));
		} else {
			result.push(item[param]);
		}
	});
	return result;
};

export const getArrayOfCodeListByKey = (codes, array, key, toInt = false, toString = false) => {
	const result = [];
	codes.forEach((code) => {
		let codeToFind = code;
		if (toInt) {
			codeToFind = Number(code);
		} else if (toString) {
			codeToFind = String(code);
		}
		const field = array.find((item) => codeToFind === item[key]);
		if (field) {
			result.push(field);
		}
	});
	if (result.length === 1) {
		return result[0];
	}
	return result;
};

export const getArrayOfCodeListByParams = (codes, array, codeParam, keyParam) => {
	const result = [];
	if (codes.length) {
		codes.forEach((code) => {
			const field = array.find((item) => code[codeParam] === item[keyParam]);
			if (field) {
				result.push(field);
			}
		});
	} else {
		const field = array.find((item) => codes[codeParam] === item[keyParam]);
		if (field) {
			result.push(field);
		}
	}
	if (result.length === 1) {
		return result[0];
	}
	return result;
};

export const getObjectForCheckboxes = (codes, array, key) => {
	const result = {};
	codes.forEach((code) => {
		const field = array.find((item) => code === item[key]);
		if (field) {
			result[field.code] = true;
		}
	});
	return result;
};
