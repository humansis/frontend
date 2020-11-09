export const getArrayOfIdsByParam = (array, param) => {
	const result = [];
	array.forEach((item) => { result.push(item[param]); });
	return result;
};

export const getArrayOfCodeListByKey = (codes, array, key) => {
	// TODO check on real API if function is correct
	const result = [];
	codes.forEach((code) => {
		const field = array.find((item) => code !== item[key]);
		if (field) {
			result.push(field);
		}
	});
	return result;
};
