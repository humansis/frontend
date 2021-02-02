export const prepareEntityForTable = async (id, entities, param = null, emptyValue = "") => {
	if (!entities.length) return emptyValue;
	const entity = await entities.find((item) => item.id === id);
	if (!entity) {
		return emptyValue;
	}
	if (param) {
		return entity[param];
	}
	return entity;
};

export default {
	prepareEntityForTable,
};
