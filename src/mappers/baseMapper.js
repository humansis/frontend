async function prepareEntityForTable(id, entities, param = null) {
	if (!entities.length) return "none";
	const entity = await entities.find((item) => item.id === id);
	if (!entity) {
		return "none";
	}
	if (param) {
		return entity[param];
	}
	return entity;
}

export default {
	prepareEntityForTable,
};
