import { download, fetcher, upload } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfProducts({ page, size, sort, search }) {
		return fetcher({
			uri: `products${queryBuilder({ page, size, sort, search })}`,
		});
	},

	getProducts(ids) {
		return fetcher({
			uri: `products${queryBuilder({ ids })}`,
		});
	},

	createProduct(body) {
		return fetcher({
			uri: "products",
			method: "POST",
			body,
		});
	},

	updateProduct({ id, body }) {
		return fetcher({
			uri: `products/${id}`,
			method: "PUT",
			body,
		});
	},

	removeProduct(id) {
		return fetcher({
			uri: `products/${id}`,
			method: "DELETE",
		});
	},

	uploadProductImage(image) {
		const formData = new FormData();
		formData.append("file", image);

		return upload({
			uri: `products/images`,
			method: "POST",
			body: formData,
		});
	},

	exportProducts(format) {
		return download({
			uri: `products/exports${queryBuilder({ format })}`,
		});
	},

	getListOfCategories({ page, size, sort, search }) {
		return fetcher({
			uri: `product-categories${queryBuilder({ page, size, sort, search })}`,
		});
	},

	createCategory(body) {
		return fetcher({
			uri: "product-categories",
			method: "POST",
			body,
		});
	},

	updateCategory({ id, body }) {
		return fetcher({
			uri: `product-categories/${id}`,
			method: "POST",
			body,
		});
	},

	removeCategory(id) {
		return fetcher({
			uri: `product-categories/${id}`,
			method: "DELETE",
		});
	},

	uploadCategoryImage(image) {
		const formData = new FormData();
		formData.append("file", image[0]);

		return upload({
			uri: `products/images`,
			method: "POST",
			body: formData,
		});
	},

};
