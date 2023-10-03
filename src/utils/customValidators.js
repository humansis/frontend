import consts from "@/consts/assistance";
import { splitBySpace } from "@/utils/helpers";

/**
 * Check whether IDs list has certain length
 * @param {String} idsList string of IDS separated by a white space
 * @returns {Boolean}
 */
export const isIdsListLengthValid = (idsList) => (
	splitBySpace(idsList).length <= consts.INPUT_DISTRIBUTED.IDS_LIST_MAX_LENGTH
);

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
};
