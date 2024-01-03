import { download, fetcher, idsToUri, upload } from "@/utils/fetcher";

export default {
	async getListOfDonors(page, size, sort, search = null, ids = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const idsText = ids ? idsToUri(ids) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `donors?${pageText + sizeText + sortText + fulltext + idsText}`,
		});
		return { data, totalCount };
	},

	async createDonor(body) {
		const { data, status } = await fetcher({ uri: "donors", method: "POST", body });
		return { data, status };
	},

	async updateDonor(id, body) {
		const { data, status } = await fetcher({ uri: `donors/${id}`, method: "PUT", body });
		return { data, status };
	},

	async deleteDonor(id) {
		const { data, status } = await fetcher({ uri: `donors/${id}`, method: "DELETE" });
		return { data, status };
	},

	async getDetailOfDonor(id) {
		const { data: { data, totalCount } } = await fetcher({ uri: `donors/${id}` });
		return { data, totalCount };
	},

	async exportDonors(format) {
		const formatText = format ? `type=${format}` : "";

		return download({ uri: `donors/exports?${formatText}` });
	},

	async uploadImage(id, image) {
		const formData = new FormData();
		formData.append("file", image[0]);

		const { data, status } = await upload({
			uri: `donors/${id}/images`,
			method: "POST",
			body: formData,
		});
		return { data, status };
	},
};
