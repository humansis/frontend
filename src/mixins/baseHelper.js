import i18n from "@/plugins/i18n";

export default {
	methods: {
		prepareEntityForTable(id, entities, returnedParam = null, emptyValue = "") {
			if (!entities?.length) return emptyValue;
			const entity = entities.find((item) => item.id === id);
			if (!entity) {
				return (emptyValue === "None") ? i18n.t("None") : emptyValue;
			}
			if (returnedParam) {
				return entity[returnedParam];
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

		prepareLocationEntityForTable(id, entities) {
			if (!entities?.length) return "";
			const entity = entities.find((item) => item.locationId === id);
			return entity.name;
		},
	},
};
