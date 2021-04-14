// import { fetcher } from "@/utils/fetcher";

export default {
	async logUserIn(body) {
		console.log(body);
		// TODO uncomment this after BE repair
		// const { data, status } = await fetcher({ uri: "login", method: "POST", body });
		return { data: {}, status: 200 };
	},

	async getRolePermissions(role) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `acl/roles/${role}`,
		});
		return { data, totalCount };
	},
};
