import { fetcher, upload } from "@/utils/fetcher";

export default {
	getListOfMyOrganizations() {
		return fetcher({
			uri: `organizations`,
		});
	},

	updateMyOrganization({ id, body }) {
		return fetcher({
			uri: `organizations/${id}`,
			method: "PUT",
			body,
		});
	},

	printMyOrganization() {
		return fetcher({
			uri: `organization/print/template`,
		});
	},

	uploadImage({ id, image }) {
		const formData = new FormData();
		formData.append("file", image);

		return upload({
			uri: `organizations/${id}/images`,
			method: "POST",
			body: formData,
		});
	},

};
