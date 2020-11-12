import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfCountrySpecificOptions(page, size, sort, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `country-specifics?page=${page}&size=${size}&sort=${sort + fulltext}`,
		});
		return { data, totalCount };
	},

	async createCountrySpecificOption(body) {
		const { data, status } = await fetcher({
			uri: "country_options", method: "POST", body,
		});
		return { data, status };
	},

	async getDetailOfCountrySpecificOption(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `country_options/${id}`,
		});
		return { data, totalCount };
	},

	async deleteCountryOption(id) {
		const { data, status } = await fetcher({
			uri: `country_options/${id}`, method: "DELETE",
		});
		return { data, status };
	},
};
