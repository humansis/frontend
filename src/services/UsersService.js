// TODO uncomment methods after implementing this endpoint

export default {
	// eslint-disable-next-line no-unused-vars
	async getListOfUsers(page, size, sort, search = null) {
		// const fulltext = search ? `&fulltext=${search}` : "";
		// const sortText = sort ? `&sort=${sort}` : "";
		//
		// const { data: { data, totalCount } } = await fetcher({
		// 	uri: `users?page=${page}&size=${size + sortText + fulltext}`,
		// });
		// return { data, totalCount };
		return { data: [], totalCount: 0 };
	},

	// eslint-disable-next-line no-unused-vars
	async createUser(body) {
		// const { data, status } = await fetcher({ uri: "users", method: "POST", body });
		// return { data, status };
		return { data: [], status: 200 };
	},

	// eslint-disable-next-line no-unused-vars
	async getDetailOfUser(id) {
		// const { data: { data } } = await fetcher({
		// 	uri: `users/${id}`,
		// });
		// return { data };
		return { data: {}, totalCount: 0 };
	},

	// eslint-disable-next-line no-unused-vars
	async updateUser(id, body) {
		// const { data, status } = await fetcher({
		// 	uri: `users/${id}`, method: "PUT", body,
		// });
		// return { data, status };
		return { data: {}, status: 200 };
	},

	// eslint-disable-next-line no-unused-vars
	async deleteUser(id) {
		// const { data, status } = await fetcher({
		// 	uri: `users/${id}`, method: "DELETE",
		// });
		// return { data, status };
		return { data: {}, status: 204 };
	},

	// eslint-disable-next-line no-unused-vars
	async sendHistory(id) {
		// const { data: { data } } = await fetcher({
		// 	uri: `users/${id}/logs`,
		// });
		// return { data };
		return { data: {} };
	},

};
