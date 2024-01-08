import { fetcher, idsToUri } from "@/utils/fetcher";

export default {
	async getResidenceAddress(id) {
		const { data } = await fetcher({ uri: `addresses/residencies/${id}` });
		return data;
	},

	async getResidenceAddresses(ids) {
		const idsText = ids ? idsToUri(ids) : "";

		const { data } = await fetcher({ uri: `addresses/residencies?${idsText}` });
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

	async getCampsByIds(ids, param = null) {
		const idsText = ids.length ? idsToUri(ids, param) : "";

		const { data } = await fetcher({ uri: `camps?${idsText}` });
		return data;
	},
};
