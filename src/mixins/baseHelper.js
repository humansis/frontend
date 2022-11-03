import i18n from "@/plugins/i18n";

export default {
	methods: {
		prepareEntityForTable(ids, entities, returnedParam = null, emptyValue = "") {
			if (!entities?.length) return emptyValue;
			const finalEntity = [];

			if (Array.isArray((ids))) {
				ids.forEach((id) => {
					const entity = entities.find((item) => item.id === id);

					if (returnedParam) {
						finalEntity.push(entity[returnedParam]);
					} else {
						finalEntity.push(entity);
					}
				});
			} else {
				const entity = entities.find((item) => item.id === ids);
				if (returnedParam) return entity[returnedParam];
			}

			if (!finalEntity.length) return (emptyValue === "None") ? i18n.t("None") : emptyValue;

			return finalEntity;
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
			if (!id || !entities?.length) return "";
			const entity = entities.find((item) => item.locationId === id);

			return returnedParam ? entity[returnedParam] : entity;
		},
	},
};
