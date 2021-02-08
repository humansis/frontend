import { fetcher, filtersToUri } from "@/utils/fetcher";

export default {
	async getListOfBooklets(page, size, sort, search = null, filters = null) {
		const fulltext = search ? `&fulltext=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const filtersUri = filters ? filtersToUri(filters) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `booklets?${pageText + sizeText + sortText + fulltext + filtersUri}`,
		});
		return { data, totalCount };
	},

	async createBooklet(body) {
		const { data, status } = await fetcher({
			uri: "booklets/batches", method: "POST", body,
		});
		return { data, status };
	},

	async getDetailOfBooklet(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `booklets/${id}`,
		});
		return { data, totalCount };
	},

	async removeBooklet(id) {
		const { data, status } = await fetcher({
			uri: `booklets/${id}`, method: "DELETE",
		});
		return { data, status };
	},
};
