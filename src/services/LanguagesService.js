// TODO Not used for now

export default {
	// eslint-disable-next-line no-unused-vars
	async getListOfLanguages(page, size, sort, search = null) {
		// const fulltext = search ? `&fulltext=${search}` : "";
		// const sortText = sort ? `&sort=${sort}` : "";

		// const { data: { data, totalCount } } = await fetcher({
		// 	uri: `users?page=${page}&size=${size + sortText + fulltext}`,
		// });
		// return { data, totalCount };
		return {
			data: [
				{
					id: 1,
					name: "English",
					published: true,
				},
				{
					id: 2,
					name: "Czech",
					published: true,
				},
				{
					id: 3,
					name: "Slovak",
					published: false,
				},
				{
					id: 4,
					name: "Russian",
					published: false,
				},
			],
			totalCount: 0,
		};
	},

	// eslint-disable-next-line no-unused-vars
	async createLanguage(body) {
		// const { data, status } = await fetcher({ uri: "users", method: "POST", body });
		// return { data, status };
		return { data: [], status: 200 };
	},

	// eslint-disable-next-line no-unused-vars
	async getDetailOfLanguage(id) {
		// const { data: { data } } = await fetcher({
		// 	uri: `users/${id}`,
		// });
		// return { data };
		return { data: {}, totalCount: 0 };
	},

};
