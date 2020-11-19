// TODO uncomment methods after implementing this endpoint

export default {
	// eslint-disable-next-line no-unused-vars
	async getListOfDonors(page, size, sort, search = null) {
		// const fulltext = search ? `&fulltext=${search}` : "";
		//
		// const { data: { data, totalCount } } = await fetcher({
		// 	uri: `users?page=${page}&size=${size}&sort=${sort + fulltext}`,
		// });
		// return { data, totalCount };
		// return { data: [], totalCount: 0 };
		return {
			data: [
				{
					id: 15,
					fullname: "Test",
					shortName: "TST",
					logo: "https://www.hello.com/img_/hellowithwaves.png",
					notes: "Tsssss",
				},
				{
					id: 16,
					fullname: "Test",
					shortName: "TST",
					logo: null,
					notes: "Tsssss",
				},
			],
			totalCount: 2 };
	},

	// eslint-disable-next-line no-unused-vars
	async createDonor(body) {
		// const { data, status } = await fetcher({ uri: "users", method: "POST", body });
		// return { data, status };
		return { data: [], status: 200 };
	},

	// eslint-disable-next-line no-unused-vars
	async getDetailOfDonor(id) {
		// const { data: { data } } = await fetcher({
		// 	uri: `users/${id}`,
		// });
		// return { data };
		return { data: {}, totalCount: 0 };
	},

	// eslint-disable-next-line no-unused-vars
	async updateDonor(id, body) {
		// const { data, status } = await fetcher({
		// 	uri: `users/${id}`, method: "PUT", body,
		// });
		// return { data, status };
		return { data: {}, status: 200 };
	},

	// eslint-disable-next-line no-unused-vars
	async deleteDonor(id) {
		// const { data, status } = await fetcher({
		// 	uri: `users/${id}`, method: "DELETE",
		// });
		// return { data, status };
		return { data: {}, status: 204 };
	},

};
