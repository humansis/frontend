import { fetcher } from "@/utils/fetcher";

export default {
	getSummariesForHomePage(code) {
		return fetcher({
			uri: `summaries?code[]=${code}`,
		});
	},
};
