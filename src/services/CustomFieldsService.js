import { download, fetcher } from "@/utils/fetcher";

export default {
	async getListOfCustomFields(page, size, sort, search = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `country-specifics?${pageText + sizeText + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async createCustomField(body) {
		const { data, status, message } = await fetcher({
			uri: "country-specifics", method: "POST", body,
		});
		return { data, status, message };
	},

	async updateCustomField(id, body) {
		const { data, status, message } = await fetcher({
			uri: `country-specifics/${id}`, method: "PUT", body,
		});
		return { data, status, message };
	},

	async getDetailOfCustomField(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `country-specifics/${id}`,
		});
		return { data, totalCount };
	},

	async deleteCustomField(id) {
		const { data, status } = await fetcher({
			uri: `country-specifics/${id}`, method: "DELETE",
		});
		return { data, status };
	},

	async getCustomFieldAnswer(id) {
		const { data } = await fetcher({
			uri: `country-specifics/answers/${id}`,
		});
		return { data };
	},

	async exportCustomFields(format) {
		const formatText = format ? `type=${format}` : "";

		return download({ uri: `country-specifics/exports?${formatText}` });
	},
};
