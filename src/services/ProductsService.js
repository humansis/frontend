import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfProducts(page, size, sort, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `products?page=${page}&size=${size}&sort=${sort + fulltext}`,
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
};
