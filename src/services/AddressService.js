import { fetcher } from "@/utils/fetcher";

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
};
