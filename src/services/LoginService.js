import { fetcher } from "@/utils/fetcher";

export default {
	async logUserIn(body) {
		const { data, status } = await fetcher({
			uri: "login",
			auth: false,
			method: "POST",
			body,
		});
		return { data, status };
	},

	async tryLogin(body) {
		const { status } = await fetcher({
			uri: "login",
			auth: false,
			method: "POST",
			body,
			contentType: null,
			tryRequest: true,
		});
		if (status !== 200) {
			throw new Error();
		}
	},

	async getRolePermissions(role) {
		const { data, status } = await fetcher({
			uri: `acl/roles/${role}`,
		});

		return { data, status };
	},
};
