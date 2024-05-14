import { fetcher } from "@/utils/fetcher";

export default {
	getListOfOrganizationServices() {
		return fetcher({
			uri: `organizations/1/services`,
		});
	},

	updateOrganizationService({ id, body }) {
		return fetcher({
			uri: `organizations/services/${id}`,
			method: "PATCH",
			body,
		});
	},

};
