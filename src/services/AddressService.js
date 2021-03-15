import { fetcher, idsToUri } from "@/utils/fetcher";

export default {

	async getCampAddress(id) {
		const { data } = await fetcher({ uri: `addresses/camps/${id}` });
		return data;
	},

	async getResidenceAddress(id) {
		const { data } = await fetcher({ uri: `addresses/residencies/${id}` });
		return data;
	},

	async getTemporarySettlementAddress(id) {
		const { data } = await fetcher({ uri: `addresses/temporary-settlement/${id}` });
		return data;
	},

	async getCampAddresses(ids) {
		const idsText = ids.length ? idsToUri(ids) : "";

		const { data } = await fetcher({ uri: `addresses/camps?${idsText}` });
		return data;
	},

	async getResidenceAddresses(ids) {
		const idsText = ids ? idsToUri(ids) : "";

		const { data } = await fetcher({ uri: `addresses/residencies?${idsText}` });
		return data;
	},

	async getTemporarySettlementAddresses(ids) {
		const idsText = ids.length ? idsToUri(ids) : "";

		const { data } = await fetcher({ uri: `addresses/temporary-settlement?${idsText}` });
		return data;
	},

	async getAddress(id) {
		const { data } = await fetcher({ uri: `addresses/${id}` });
		return data;
	},

	async getAddresses(ids) {
		const idsText = ids.length ? idsToUri(ids) : "";

		const { data } = await fetcher({ uri: `addresses?${idsText}` });
		return data;
	},
};
