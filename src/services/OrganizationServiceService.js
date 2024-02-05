import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfOrganizationServices() {
		const { data: { data, totalCount } } = await fetcher({
			uri: `organizations/1/services`,
		});
		return { data, totalCount };
	},

	async updateOrganizationService(id, body) {
		const { data, status, message } = await fetcher({
			uri: `organizations/services/${id}`, method: "PATCH", body,
		});
		return { data, status, message };
	},

};
