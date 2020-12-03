// TODO uncomment methods after implementing this endpoint

export default {
	// eslint-disable-next-line no-unused-vars
	async getListOfCountries(page, size, sort, search = null) {
		// const fulltext = search ? `&fulltext=${search}` : "";
		// const sortText = sort ? `&sort=${sort}` : "";
		//
		// const { data: { data, totalCount } } = await fetcher({
		// 	uri: `users?page=${page}&size=${size + sortText + fulltext}`,
		// });
		// return { data, totalCount };
		return {
			data: [
				{
					name: "Cambodia",
					iso3: "KHM",
					countryFlag: "khm",
					availableCurrencies: ["EUR", "USD"],
				},
				{
					name: "Syria",
					iso3: "SYR",
					countryFlag: "syr",
					availableCurrencies: ["CZK", "USD"],
				},
				{
					name: "Ukraine",
					iso3: "UKR",
					countryFlag: "ukr",
					availableCurrencies: ["RUB", "EUR"],
				},
			],
			totalCount: 3 };
	},

	// eslint-disable-next-line no-unused-vars
	async createCountry(body) {
		// const { data, status } = await fetcher({ uri: "users", method: "POST", body });
		// return { data, status };
		return { data: [], status: 200 };
	},

	// eslint-disable-next-line no-unused-vars
	async getDetailOfCountry(id) {
		// const { data: { data } } = await fetcher({
		// 	uri: `users/${id}`,
		// });
		// return { data };
		return { data: {}, totalCount: 0 };
	},

	// eslint-disable-next-line no-unused-vars
	async updateCountry(id, body) {
		// const { data, status } = await fetcher({
		// 	uri: `users/${id}`, method: "PUT", body,
		// });
		// return { data, status };
		return { data: {}, status: 200 };
	},

	// eslint-disable-next-line no-unused-vars
	async deleteCountry(id) {
		// const { data, status } = await fetcher({
		// 	uri: `users/${id}`, method: "DELETE",
		// });
		// return { data, status };
		return { data: {}, status: 204 };
	},

};
