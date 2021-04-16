import { fetcher } from "@/utils/fetcher";

export default {
	async getIcons() {
		const { data } = await fetcher({
			uri: `icons`,
		});
		return { data };
	},
};
