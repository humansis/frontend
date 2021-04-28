import { fetcher } from "@/utils/fetcher";

export default {
	async getRoles() {
		const { data } = await fetcher({ uri: `acl/roles` });
		return data;
	},
};
