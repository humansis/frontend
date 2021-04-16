import { fetcher } from "@/utils/fetcher";

export default {
	async getSummariesForHomePage(code) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `summaries?code[]=${code}`,
		});
		return { data, totalCount };
	},
};
