// TODO uncomment methods after implementing this endpoint

export default {
	// eslint-disable-next-line no-unused-vars
	async getListOfOrganizationServices(page, size, sort, search = null) {
		// const fulltext = search ? `&fulltext=${search}` : "";
		// const sortText = sort ? `&sort=${sort}` : "";
		//
		// const { data: { data, totalCount } } = await fetcher({
		// 	uri: `organization?page=${page}&size=${size + sortText + fulltext}`,
		// });
		// return { data, totalCount };
		// return { data: [], totalCount: 0 };
		return {
			data: [
				{
					id: 1,
					enabled: false,
					parametersValue: { token: "token" },
					service: {
						country: null,
						id: 1,
						name: "Two-Factor Authentication",
						parameters: {
							$id: "2fa",
							$schema: "http =>//json-schema.org/draft-07/schema#",
							properties: {
								token: {
									type: "string",
									description: "The token for the SMS service",
								},
							},
							title: "Two-Factor Authentication",
							type: "object",
						},
					},
				},
				{
					id: 2,
					enabled: true,
					parametersValue: {
						token: "token",
						email: "email@email.com",
					},
					service: {
						country: "KHM",
						id: 2,
						name: "IDPoor API",
						parameters: {
							$id: "idpoor",
							$schema: "http =>//json-schema.org/draft-07/schema#",
							properties: {
								token: {
									type: "string",
									description: "The email used for the IDPoor",
									format: "email",
								},
								email: {
									type: "string",
									description: "The token for the IDPoor",
								},
							},
							title: "IDPoor",
							type: "object",
						},
					},
				},
				{
					id: 3,
					enabled: true,
					parametersValue: {
						password: "testing",
						username: "testing3",
						production: false,
					},
					service: {
						country: "KHM",
						id: 3,
						name: "WING Cash Transfer",
						parameters: {
							$id: "wing",
							$schema: "http =>//json-schema.org/draft-07/schema#",
							properties: {
								password: {
									type: "string",
									description: "The password for the WING API",
									format: "password",
								},
								production: {
									type: "boolean",
									description: "Whether the service should use the production API or not",
								},
								username: {
									type: "string",
									description: "The username for the WING API",
								},
							},
							title: "WING Cash Transfer",
							type: "object",
						},
					},
				},
			],
			totalCount: 3 };
	},

	// eslint-disable-next-line no-unused-vars
	async getDetailOfOrganizationService(id) {
		// const { data: { data } } = await fetcher({
		// 	uri: `organization/${id}`,
		// });
		// return { data };
		return { data: {}, totalCount: 0 };
	},

	// eslint-disable-next-line no-unused-vars
	async updateOrganizationService(id, body) {
		// const { data, status } = await fetcher({
		// 	uri: `organization/${id}`, method: "PUT", body,
		// });
		// return { data, status };
		return { data: {}, status: 200 };
	},

};
