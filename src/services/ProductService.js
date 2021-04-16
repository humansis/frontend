import { fetcher, idsToUri, upload } from "@/utils/fetcher";

export default {
	async getListOfProducts(page, size, sort, search = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = page ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `products?${pageText + sizeText + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async getProducts(ids) {
		const idsText = ids ? idsToUri(ids) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `products?${idsText}`,
		});
		return { data, totalCount };
	},

	async createProduct(body) {
		const { data, status } = await fetcher({
			uri: "products", method: "POST", body,
		});
		return { data, status };
	},

	async getDetailOfProduct(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `products/${id}`,
		});
		return { data, totalCount };
	},

	async updateProduct(id, body) {
		const { data, status } = await fetcher({
			uri: `products/${id}`, method: "PUT", body,
		});
		return { data, status };
	},

	async removeProduct(id) {
		const { data, status } = await fetcher({
			uri: `products/${id}`, method: "DELETE",
		});
		return { data, status };
	},

	async uploadImage(image) {
		const formData = new FormData();
		formData.append("file", image);

		const { data, status } = await upload({
			uri: `products/images`,
			method: "POST",
			body: formData,
		});
		return { data, status };
	},
};
