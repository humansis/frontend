import { fetcher } from "@/utils/fetcher";

export default {
	async logUserIn(body) {
		const { data, status, messages } = await fetcher({
			uri: "login",
			auth: false,
			method: "POST",
			body,
		});

		return { data, status, messages };
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

	getKeycloakLoginUrl() {
		return fetcher({
			uri: "api/jwt/keycloak/v1/login/url",
			ignoreBaseUrl: true,
		});
	},

	keycloakLogin(body) {
		return fetcher({
			uri: "api/jwt/keycloak/v1/login",
			ignoreBaseUrl: true,
			auth: false,
			method: "POST",
			body,
		});
	},

	async getRolePermissions(role) {
		const { data, status, messages } = await fetcher({
			uri: `acl/roles/${role}`,
		});

		return { data, status, messages };
	},
};
