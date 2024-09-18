import { fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfPermissions() {
		return fetcher({
			uri: "permissions",
		});
	},

	getListOfRoles({ page, size, sort, search }) {
		return fetcher({
			uri: `roles${queryBuilder({ page, size, sort, search })}`,
		});
	},

	getDetailOfRole(id) {
		return fetcher({
			uri: `roles/${id}`,
		});
	},

	createRole(body) {
		return fetcher({
			uri: "roles",
			method: "POST",
			body,
		});
	},

	updateRole({ id, body }) {
		return fetcher({
			uri: `roles/${id}`,
			method: "PUT",
			body,
		});
	},

	removeRole(id) {
		return fetcher({
			uri: `roles/${id}`,
			method: "DELETE",
		});
	},
};
