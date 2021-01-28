import { fetcher, idsToUri } from "@/utils/fetcher";

export default {

	async getCampAddress(id) {
		const { data } = await fetcher({ uri: `beneficiaries/addresses/camps/${id}` });
		return data;
	},

	async getResidenceAddress(id) {
		const { data } = await fetcher({ uri: `beneficiaries/addresses/residencies/${id}` });
		return data;
	},

	async getTemporarySettlementAddress(id) {
		const { data } = await fetcher({ uri: `beneficiaries/addresses/temporary-settlement/${id}` });
		return data;
	},

	async getCampAddresses(ids) {
		const idsText = ids.length ? idsToUri(ids) : "";

		const { data } = await fetcher({ uri: `beneficiaries/addresses/camps?${idsText}` });
		return data;
	},

	async getResidenceAddresses(ids) {
		const idsText = ids ? idsToUri(ids) : "";

		const { data } = await fetcher({ uri: `beneficiaries/addresses/residencies?${idsText}` });
		return data;
	},

	async getTemporarySettlementAddresses(ids) {
		const idsText = ids.length ? idsToUri(ids) : "";

		const { data } = await fetcher({ uri: `beneficiaries/addresses/temporary-settlement?${idsText}` });
		return data;
	},
};
