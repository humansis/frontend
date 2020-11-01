import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfAdm1() {
		const { data: { data, totalCount } } = await fetcher({ uri: `adm1` });
		return { data, totalCount };
	},

	async getDetailOfAdm1(id) {
		const { data: { data, totalCount } } = await fetcher({ uri: `adm1/${id}` });
		return { data, totalCount };
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

	async getListOfCountries() {
		const { data: { data, totalCount } } = await fetcher({ uri: "countries" });
		return { data, totalCount };
	},

	async getDetailOfCountry(iso3) {
		const { data: { data, totalCount } } = await fetcher({ uri: `countries/${iso3}` });
		return { data, totalCount };
	},
};
