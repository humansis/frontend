import { download, fetcher, idsToUri, upload } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

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

	async uploadProductImage(image) {
		const formData = new FormData();
		formData.append("file", image[0]);

		const { data, status } = await upload({
			uri: `products/images`,
			method: "POST",
			body: formData,
		});
		return { data, status };
	},

	async exportProducts(format) {
		const formatText = format ? `type=${format}` : "";

		return download({ uri: `products/exports?${formatText}` });
	},

	getListOfCategories(page, size, sort, search = null) {
		return fetcher({
			uri: `product-categories${queryBuilder({ page, size, sort, search })}`,
		});
	},

	async getCategories(ids) {
		const idsText = ids ? idsToUri(ids) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `product-categories?${idsText}`,
		});
		return { data, totalCount };
	},

	async createCategory(body) {
		const { data, status } = await fetcher({
			uri: "product-categories", method: "POST", body,
		});
		return { data, status };
	},

	async updateCategory(id, body) {
		const { data, status } = await fetcher({
			uri: `product-categories/${id}`, method: "POST", body,
		});
		return { data, status };
	},

	async removeCategory(id) {
		const { data, status } = await fetcher({
			uri: `product-categories/${id}`, method: "DELETE",
		});
		return { data, status };
	},

	async uploadCategoryImage(image) {
		const formData = new FormData();
		formData.append("file", image[0]);

		const { data, status } = await upload({
			uri: `products/images`,
			method: "POST",
			body: formData,
		});
		return { data, status };
	},

};
