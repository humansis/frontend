import { fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {

	getCampAddress(id) {
		return fetcher({ uri: `addresses/camps/${id}` });
	},

	getResidenceAddress(id) {
		return fetcher({ uri: `addresses/residencies/${id}` });
	},

	getTemporarySettlementAddress(id) {
		return fetcher({ uri: `addresses/temporary-settlements/${id}` });
	},

	getCampAddresses(ids) {
		return fetcher({ uri: `addresses/camps?${queryBuilder({ ids })}` });
	},

	getResidenceAddresses(ids) {
		return fetcher({ uri: `addresses/residencies${queryBuilder({ ids })}` });
	},

	getTemporarySettlementAddresses(ids) {
		return fetcher({ uri: `addresses/temporary-settlements?${queryBuilder({ ids })}` });
	},

	getAddress(id) {
		return fetcher({ uri: `addresses/${queryBuilder({ id })}` });
	},

	getAddresses(ids) {
		return fetcher({ uri: `addresses?${queryBuilder({ ids })}` });
	},

	getCamps() {
		return fetcher({ uri: `camps` });
	},

	getCampsByLocation(id) {
		return fetcher({ uri: `locations/${id}/camps` });
	},

	getCamp(id) {
		return fetcher({ uri: `camps/${id}` });
	},

	async getCampsByIds(ids) {
		return fetcher({ uri: `camps${queryBuilder({ ids })}` });
	},
};
