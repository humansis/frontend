import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfVendors(page, size, sort, search = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = page ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `vendors?${pageText + sizeText + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async createVendor(body) {
		const { data, status } = await fetcher({ uri: "institutions", method: "POST", body });
		return { data, status };
	},

	async getDetailOfVendor(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `vendors/${id}`,
		});
		return { data, totalCount };
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
};
