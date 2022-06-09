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

	async getListOfSmartcardPurchasedItems(page, size, sort, search, filters) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const filtersText = filters ? filtersToUri(filters) : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `smartcard-purchased-items?${pageText + sizeText + sortText + fulltext + filtersText}`,
		});

		return { data, totalCount };
	},

	async exportDistributions(format, page, size, sort, search, filters) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const filtersText = filters ? filtersToUri(filters) : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const formatText = format ? `type=${format}` : "";

		return download({ uri: `distributed-items/exports?${formatText + pageText + sizeText + sortText + fulltext + filtersText}` });
	},

	async exportPurchases(format, page, size, sort, search, filters) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const filtersText = filters ? filtersToUri(filters) : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const formatText = format ? `type=${format}` : "";

		return download({ uri: `purchased-items/exports?${formatText + pageText + sizeText + sortText + fulltext + filtersText}` });
	},

	async exportSmartcardPurchasesItems(format, page, size, sort, search, filters) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const filtersText = filters ? filtersToUri(filters) : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const formatText = format ? `type=${format}` : "";

		return download({ uri: `smartcard-purchased-items/exports?${formatText + pageText + sizeText + sortText + fulltext + filtersText}` });
	},

};
