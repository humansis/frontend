import consts from "@/utils/assistanceConst";
import { splitBySpace } from "@/utils/helpers";

/**
 * Check whether IDs list has certain length
 * @param {String} idsList string of IDS separated by a white space
 * @returns {Boolean}
 */
export const isIdsListLengthValid = (idsList) => (
	splitBySpace(idsList).length <= consts.INPUT_DISTRIBUTED.IDS_LIST_MAX_LENGTH
);

export default {
	isIdsListLengthValid,
};
