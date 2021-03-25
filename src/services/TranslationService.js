// TODO Not used for now
import { fetcher } from "@/utils/fetcher";

export default {
	async getTranslations(language) {
		return fetcher({
			uri: `translations/${language}`,
		});
	},

	async saveTranslation() {
		return { status: 200 };
	},
};
