import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfCountryOptions(page, size, sort, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `country_options?page=${page}&size=${size}&sort=${sort + fulltext}`,
		});
		return { data, totalCount };
	},

	async createCountryOption(body) {
		const { data, status } = await fetcher({
			uri: "country_options", method: "POST", body,
		});
		return { data, status };
	},

	async getDetailOfCountryOption(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `country_options/${id}`,
		});
		return { data, totalCount };
	},

	async updateCountryOption(id, body) {
		const { data, status } = await fetcher({
			uri: `country_options/${id}`, method: "PUT", body,
		});
		return { data, status };
	},

	async removeCountryOption(id) {
		const { data, status } = await fetcher({
			uri: `country_options/${id}`, method: "DELETE",
		});
		return { data, status };
	},
};
