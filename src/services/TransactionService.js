import { download, fetcher, filtersToUri } from "@/utils/fetcher";

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

	async getListOfPurchasedItems(page, size, sort, search, filters) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const filtersText = filters ? filtersToUri(filters) : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `purchased-items?${pageText + sizeText + sortText + fulltext + filtersText}`,
		});

		return { data, totalCount };
	},

	async exportDistributions(format) {
		const formatText = format ? `type=${format}` : "";

		const { data } = await download({ uri: `distributed-items/exports?${formatText}` });
		return { data };
	},

	async exportPurchases(format) {
		const formatText = format ? `type=${format}` : "";

		const { data } = await download({ uri: `purchased-items/exports?${formatText}` });
		return { data };
	},

};
