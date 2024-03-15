import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfCountries() {
		const { data: { data, totalCount } } = await fetcher({ uri: "countries" });
		return { data, totalCount };
	},

	async getListOfUsersCountries(userId) {
		const { data: { data, totalCount } } = await fetcher({ uri: `users/${userId}/countries` });
		return { data, totalCount };
	},

	async getDetailOfCountry(iso3) {
		const { data: { data, totalCount } } = await fetcher({ uri: `countries/${iso3}` });
		return { data, totalCount };
	},

};
