import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfCountrySpecificOptions(page, size, sort, search = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `country-specifics?${pageText + sizeText + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async createCountrySpecificOption(body) {
		const { data, status } = await fetcher({
			uri: "country-specifics", method: "POST", body,
		});
		return { data, status };
	},

	async updateCountrySpecificOption(id, body) {
		const { data, status } = await fetcher({
			uri: `country-specifics/${id}`, method: "PUT", body,
		});
		return { data, status };
	},

	async getDetailOfCountrySpecificOption(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `country-specifics/${id}`,
		});
		return { data, totalCount };
	},

	async deleteCountrySpecificOption(id) {
		const { data, status } = await fetcher({
			uri: `country-specifics/${id}`, method: "DELETE",
		});
		return { data, status };
	},
};
