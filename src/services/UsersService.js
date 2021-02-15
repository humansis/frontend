import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfUsers(page, size, sort, search = null) {
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `users?${pageText + sizeText + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async createUser(body) {
		const { data, status } = await fetcher({ uri: "users", method: "POST", body });
		return { data, status };
	},

	async getDetailOfUser(id) {
		const { data: { data } } = await fetcher({
			uri: `users/${id}`,
		});
		return { data };
	},

	async updateUser(id, body) {
		const { data, status } = await fetcher({
			uri: `users/${id}`, method: "PUT", body,
		});
		return { data, status };
	},

	async deleteUser(id) {
		const { data, status } = await fetcher({
			uri: `users/${id}`, method: "DELETE",
		});
		return { data, status };
	},

	async sendHistory(id) {
		const { data: { data } } = await fetcher({
			uri: `users/${id}/logs`,
		});
		return { data };
	},

};
