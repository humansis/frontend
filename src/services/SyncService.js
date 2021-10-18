import { download, fetcher, filtersToUri, idsToUri } from "@/utils/fetcher";

export default {
	async getListOfSync(page, size, sort, search = null, filters = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const filtersUri = filters ? filtersToUri(filters) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `sync?${pageText + sizeText + sortText + fulltext + filtersUri}`,
		});
		return { data, totalCount };
	},

	async exportSync(format, ids) {
		const idsText = ids ? idsToUri(ids) : "";

		const formatText = format ? `type=${format}` : "";
		const { data } = await download({ uri: `sync/exports?${formatText + idsText}` });
		return { data };
	},
};
