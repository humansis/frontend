// TODO uncomment methods after implementing this endpoint

export default {
	// eslint-disable-next-line no-unused-vars
	async getListOfMyOrganizations(page, size, sort, search = null) {
		// const fulltext = search ? `&fulltext=${search}` : "";
		//
		// const { data: { data, totalCount } } = await fetcher({
		// 	uri: `organization?page=${page}&size=${size}&sort=${sort + fulltext}`,
		// });
		// return { data, totalCount };
		// return { data: [], totalCount: 0 };
		return {
			data: [
				{
					id: 15,
					name: "Test",
					logo: "https://www.hello.com/img_/hellowithwaves.png",
					footerContent: "TST",
					primaryColor: "#F00",
					secondaryColor: "#0FF",
					font: "Arial",
				},
				{
					id: 16,
					name: "Test",
					logo: null,
					footerContent: "TST",
					primaryColor: "#00F",
					secondaryColor: "#0F0",
					font: "Helvetica",
				},
			],
			totalCount: 2 };
	},

	// eslint-disable-next-line no-unused-vars
	async getDetailOfMyOrganization(id) {
		// const { data: { data } } = await fetcher({
		// 	uri: `organization/${id}`,
		// });
		// return { data };
		return { data: {}, totalCount: 0 };
	},

	// eslint-disable-next-line no-unused-vars
	async updateMyOrganization(id, body) {
		// const { data, status } = await fetcher({
		// 	uri: `organization/${id}`, method: "PUT", body,
		// });
		// return { data, status };
		return { data: {}, status: 200 };
	},

	// eslint-disable-next-line no-unused-vars
	async printMyOrganization(id) {
		// const { data, status } = await fetcher({
		// 	uri: `organization/${id}/print`,
		// });
		// return { data, status };
		return { data: {}, status: 200 };
	},

};
