import { fetcher, filtersToUri } from "@/utils/fetcher";

export default {
	async getListOfImports(page, size, sort, search = null, filters = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const filtersUri = filters ? filtersToUri(filters) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `imports?${pageText + sizeText + sortText + fulltext + filtersUri}`,
		});
		return { data, totalCount };
	},

	async createImport(body) {
		const { data, status } = await fetcher({ uri: "imports", method: "POST", body });
		return { data, status };
	},
};
