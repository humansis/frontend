import { splitBySpace } from "@/utils/helpers";
import { ASSISTANCE } from "@/consts";

/**
 * Check whether IDs list has certain length
 * @param {String} idsList string of IDS separated by a white space
 * @returns {Boolean}
 */
export const isIdsListLengthValid = (idsList) => (
	splitBySpace(idsList).length <= ASSISTANCE.INPUT_DISTRIBUTED.IDS_LIST_MAX_LENGTH
);

export const isDecimalPartLengthValid = (value) => {
	const floatValidation = /^-?\d+(\.\d{0,2})?$/;

	return typeof value === "number" && floatValidation.test(value.toString());
};

export const getUniqueIds = (data, param) => {
	const uniqueIds = [];

	if (Array.isArray(data) && data.length && param) {
		data.forEach((item) => {
			if (!uniqueIds.includes(item[param])) {
				uniqueIds.push(item[param]);
			}
		});
	}

	return uniqueIds;
};

export default {
	isIdsListLengthValid,
	getUniqueIds,
	isDecimalPartLengthValid,
};
