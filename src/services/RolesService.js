import { fetcher } from "@/utils/fetcher";

export default {
	getListOfRoles() {
		return fetcher({
			uri: `roles`,
		});
	},
};
