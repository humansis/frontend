export const getArrayOfIdsByParam = (items, param) => {
	const result = [];
	if (!Array.isArray(items)) {
		return [items[param]];
	}
	items.forEach((item) => { result.push(item[param]); });
	return result;
};

export const getArrayOfCodeListByKey = (codes, array, key) => {
	// TODO check on real API if function is correct
	const result = [];
	codes.forEach((code) => {
		const field = array.find((item) => code === item[key]);
		if (field) {
			result.push(field);
		}
	});
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
