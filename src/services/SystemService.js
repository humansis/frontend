import { fetcher } from "@/utils/fetcher";

export default {
	getRoles() {
		return fetcher({
			uri: `acl/roles`,
		});
	},
};
