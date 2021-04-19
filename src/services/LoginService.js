import { fetcher } from "@/utils/fetcher";

export default {
	async logUserIn(body) {
		const { data, status } = await fetcher({
			uri: "login",
			jwt: true,
			method: "POST",
			body,
		});
		return { data, status };
	},

	async getRolePermissions(role) {
		const { data, status } = await fetcher({
			uri: `acl/roles/${role}`,
		});

		return { data, status };
	},
};
