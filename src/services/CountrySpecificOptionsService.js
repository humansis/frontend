import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfCountrySpecificOptions(page, size, sort, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";
		const sortText = sort ? `&sort=${sort}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `country-specifics?page=${page}&size=${size + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async createCountrySpecificOption(body) {
		const { data, status } = await fetcher({
			uri: "country-specifics", method: "POST", body,
		});
		return { data, status };
	},

	async getDetailOfCountrySpecificOption(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `country-specifics/${id}`,
		});
		return { data, totalCount };
	},

	async deleteCountryOption(id) {
		const { data, status } = await fetcher({
			uri: `country-specifics/${id}`, method: "DELETE",
		});
		return { data, status };
	},
};
