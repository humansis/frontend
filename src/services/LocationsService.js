import { fetcher, idsToUri } from "@/utils/fetcher";

export default {
	async getListOfAdm1() {
		const { data: { data, totalCount } } = await fetcher({ uri: `adm1` });
		return { data, totalCount };
	},

	async getDetailOfAdm1(id) {
		const { data } = await fetcher({ uri: `adm1/${id}` });
		return { data };
	},

	async getDetailOfAdm2(id) {
		const { data } = await fetcher({ uri: `adm2/${id}` });
		return { data };
	},

	async getDetailOfAdm3(id) {
		const { data } = await fetcher({ uri: `adm3/${id}` });
		return { data };
	},

	async getDetailOfAdm4(id) {
		const { data } = await fetcher({ uri: `adm4/${id}` });
		return { data };
	},

	async getListOfAdm2(id) {
		const { data: { data, totalCount } } = await fetcher({ uri: `adm1/${id}/adm2` });
		return { data, totalCount };
	},

	async getListOfAdm3(id) {
		const { data: { data, totalCount } } = await fetcher({ uri: `adm2/${id}/adm3` });
		return { data, totalCount };
	},

	async getListOfAdm4(id) {
		const { data: { data, totalCount } } = await fetcher({ uri: `adm3/${id}/adm4` });
		return { data, totalCount };
	},

	async getLocation(id) {
		const { data } = await fetcher({ uri: `locations/${id}` });
		return data;
	},

	async getLocations(ids, param = null) {
		const idsText = ids ? idsToUri(ids, param) : "";

		const { data } = await fetcher({ uri: `locations?${idsText}` });
		return data;
	},
};
