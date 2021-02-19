import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfMyOrganizations() {
		const { data: { data, totalCount } } = await fetcher({
			uri: `organizations`,
		});
		return { data, totalCount };
	},

	async updateMyOrganization(id, body) {
		const { data, status } = await fetcher({
			uri: `organizations/${id}`, method: "PATCH", body,
		});
		return { data, status };
	},

	async printMyOrganization(id) {
		const { data, status } = await fetcher({
			uri: `organizations/${id}/print/template`,
		});
		return { data, status };
	},

};
