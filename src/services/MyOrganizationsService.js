import { fetcher, upload } from "@/utils/fetcher";

export default {
	async getListOfMyOrganizations() {
		const { data: { data, totalCount } } = await fetcher({
			uri: `organizations`,
		});
		return { data, totalCount };
	},

	async updateMyOrganization(id, body) {
		const { data, status } = await fetcher({
			uri: `organizations/${id}`, method: "PUT", body,
		});
		return { data, status };
	},

	async printMyOrganization() {
		const { data, status } = await fetcher({
			uri: `organization/print/template`,
		});
		return { data, status };
	},

	async uploadImage(id, image) {
		const formData = new FormData();
		formData.append("file", image[0]);

		const { data, status } = await upload({
			uri: `organizations/${id}/images`,
			method: "POST",
			body: formData,
		});
		return { data, status };
	},

};
