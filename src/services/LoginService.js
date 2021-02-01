import { fetcher } from "@/utils/fetcher";

export default {
	async logUserIn(body) {
		const { data, status } = await fetcher({ uri: "login", method: "POST", body });
		return { data, status };
	},
};
