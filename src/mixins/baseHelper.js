export default {
	methods: {
		prepareEntityForTable(ids, entities, returnedParam = null, emptyValue = "") {
			if (!entities?.length) return emptyValue;
			const finalEntity = [];

			if (Array.isArray((ids))) {
				ids.forEach((id) => {
					const entity = entities.find((item) => item.id === id);

					if (entity) {
						finalEntity.push(returnedParam ? entity[returnedParam] : entity);
					}
				});
			} else {
				const entity = entities.find((item) => item.id === ids);

				if (entity) {
					return returnedParam ? entity[returnedParam] : entity;
				}
			}

			if (!finalEntity.length) return (emptyValue === "None") ? this.$t("None") : emptyValue;

			return finalEntity;
		},

		prepareName(localName, enName) {
			let preparedName = localName;
			if (enName) preparedName += ` (${enName})`;

			return preparedName;
		},

		prepareLocationEntityForTable(id, entities, returnedParam = null) {
			if (!id || !entities?.length) return "";
			const entity = entities.find((item) => item.locationId === id);

			return returnedParam ? entity[returnedParam] : entity;
		},
	},
};
