import { fetcher, filtersToUri } from "@/utils/fetcher";

export default {
	async getListOfInstitutions(page, size, sort, search = null, filters = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = page ? `&size=${size}` : "";
		const filtersText = filters ? filtersToUri(filters) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `institutions?${pageText + sizeText + sortText + fulltext + filtersText}`,
		});
		return { data, totalCount };
	},

	async createInstitution(body) {
		const { data, status } = await fetcher({ uri: "institutions", method: "POST", body });
		return { data, status };
	},

	async getDetailOfInstitution(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `institutions/${id}`,
		});
		return { data, totalCount };
	},

	async updateInstitution(id, body) {
		const { data, status } = await fetcher({
			uri: `institutions/${id}`, method: "PUT", body,
		});
		return { data, status };
	},

	async deleteInstitution(id) {
		const { data, status } = await fetcher({
			uri: `institutions/${id}`, method: "DELETE",
		});
		return { data, status };
	},

	async getListOfInstitutionTypes() {
		const { data: { data, totalCount } } = await fetcher({ uri: "institutions/types" });
		return { data, totalCount };
	},
};
