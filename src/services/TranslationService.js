import { fetcher } from "@/utils/fetcher";

export default {
	getTranslations(language) {
		return fetcher({
			uri: `translations/${language}`,
		});
	},
};
