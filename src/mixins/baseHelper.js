import i18n from "@/plugins/i18n";

export default {
	methods: {
		prepareEntityForTable(id, entities, returnedParam = null, emptyValue = "") {
			if (!entities?.length) return emptyValue;
			const entity = entities.find((item) => item.id === id);

			if (!entity) return (emptyValue === "None") ? i18n.t("None") : emptyValue;
			if (returnedParam) return entity[returnedParam];

			return entity;
		},

		preparePhonesForTable(phoneIds, phones = null, emptyValue = "") {
			let number = "";

			phones.forEach(({ id }, key) => {
				if (phoneIds.includes(id)) {
					number += `${!number ? "" : ", "} ${phones[key].number}`;
				}
			});

			if (!number) return (emptyValue === "None") ? i18n.t("None") : emptyValue;

			return number;
		},

		prepareName(localName, enName) {
			let preparedName = localName;
			if (enName) preparedName += ` (${enName})`;

			return preparedName;
		},

		prepareLocationEntityForTable(id, entities, returnedParam = null) {
			if (!entities?.length) return "";
			const entity = entities.find((item) => item.locationId === id);

			return returnedParam ? entity[returnedParam] : entity;
		},
	},
};
