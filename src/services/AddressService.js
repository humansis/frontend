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
		const { data } = await fetcher({ uri: `addresses/temporary-settlements/${id}` });
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

		const { data } = await fetcher({ uri: `addresses/temporary-settlements?${idsText}` });
		return data;
	},

	async getAddress(id) {
		if (!id) return null;
		const { data } = await fetcher({ uri: `addresses/${id}` });
		return data;
	},

	async getAddresses(ids) {
		const idsText = ids.length ? idsToUri(ids) : "";

		const { data } = await fetcher({ uri: `addresses?${idsText}` });
		return data;
	},

	async getCamps() {
		const { data: { data, totalCount } } = await fetcher({ uri: `camps` });
		return { data, totalCount };
	},

	async getCampsByLocation(id) {
		const { data: { data, totalCount } } = await fetcher({ uri: `locations/${id}/camps` });
		return { data, totalCount };
	},

	async getCamp(id) {
		const { data } = await fetcher({ uri: `camps/${id}` });
		return data;
	},

	async getCampsByIds(ids, param) {
		const idsText = ids.length ? idsToUri(ids, param) : "";

		const { data } = await fetcher({ uri: `camps?${idsText}` });
		return data;
	},
};
