import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfUsers(page, size, sort, search = null) {
		return { data: [], totalCount: 0 };
		// eslint-disable-next-line no-unreachable
		const fulltext = search ? `&fulltext=${search}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `users?page=${page}&size=${size}&sort=${sort + fulltext}`,
		});
		return { data, totalCount };
	},

	async createUser(body) {
		return { data: [], status: 200 };
		// eslint-disable-next-line no-unreachable
		const { data, status } = await fetcher({ uri: "users", method: "POST", body });
		return { data, status };
	},

	async getDetailOfUser(id) {
		return { data: {}, totalCount: 0 };
		// eslint-disable-next-line no-unreachable
		const { data: { data } } = await fetcher({
			uri: `users/${id}`,
		});
		return { data };
	},

	async updateUser(id, body) {
		return { data: {}, status: 200 };
		// eslint-disable-next-line no-unreachable
		const { data, status } = await fetcher({
			uri: `users/${id}`, method: "PUT", body,
		});
		return { data, status };
	},

	async deleteUser(id) {
		return { data: {}, status: 204 };
		// eslint-disable-next-line no-unreachable
		const { data, status } = await fetcher({
			uri: `users/${id}`, method: "DELETE",
		});
		return { data, status };
	},

	async sendHistory(id) {
		return { data: {} };
		// eslint-disable-next-line no-unreachable
		const { data: { data } } = await fetcher({
			uri: `users/${id}/logs`,
		});
		return { data };
	},

};
