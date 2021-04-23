import { fetcher, filtersToUri } from "@/utils/fetcher";

export default {
	async getListOfDistributedItems(page, size, sort, search, filters) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const filtersText = filters ? filtersToUri(filters) : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `distributed-items?${pageText + sizeText + sortText + fulltext + filtersText}`,
		});

		return { data, totalCount };
	},

};
