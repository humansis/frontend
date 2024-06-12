import { fetcher } from "@/utils/fetcher";

export default {
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

	getRolePermissions(role) {
		return fetcher({
			uri: `acl/roles/${role}`,
		});
	},
};
