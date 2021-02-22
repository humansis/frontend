export default {
	methods: {
		prepareEntityForTable(id, entities, param = null, emptyValue = "") {
			if (!entities?.length) return emptyValue;
			const entity = entities.find((item) => item.id === id);
			if (!entity) {
				return emptyValue;
			}
			if (param) {
				return entity[param];
			}
			return entity;
		},

		prepareName(localName, enName) {
			let preparedName = localName;
			if (enName) {
				preparedName += ` (${enName})`;
			}
			return preparedName;
		},
	},
};
