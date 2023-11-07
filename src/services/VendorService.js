import { download, fetcher, filtersToUri, idsToUri } from "@/utils/fetcher";

export default {
	async getListOfVendors(page, size, sort, search = null, ids = null, filters) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const idsText = ids ? idsToUri(ids) : "";
		const filtersUri = filters ? filtersToUri(filters) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `vendors?${pageText + sizeText + sortText + fulltext + filtersUri + idsText}`,
		});
		return { data, totalCount };
	},

	async createVendor(body) {
		const { data, status } = await fetcher({ uri: "vendors", method: "POST", body });
		return { data, status };
	},

	async getDetailOfVendor(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `vendors/${id}`,
		});
		return { data, totalCount };
	},

	async getSummaryOfVendor(id) {
		// TODO BE Should fix response structure
		const { data } = await fetcher({
			uri: `vendors/${id}/summaries`,
		});
		return data;
	},

	async updateVendor(id, body) {
		const { data, status } = await fetcher({
			uri: `vendors/${id}`, method: "PUT", body,
		});
		return { data, status };
	},

	async deleteVendor(id) {
		const { data, status } = await fetcher({
			uri: `vendors/${id}`, method: "DELETE",
		});
		return { data, status };
	},

	async generateInvoiceForVendor(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `vendors/${id}/invoice`,
		});
		return { data, totalCount };
	},

	async generateExportFileForVendor(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `vendors/${id}/export`,
		});
		return { data, totalCount };
	},

	async exportVendors(format, filters) {
		const formatText = format ? `type=${format}` : "";
		const filtersUri = filters ? filtersToUri(filters) : "";

		return download({ uri: `vendors/exports?${formatText + filtersUri}` });
	},
};
