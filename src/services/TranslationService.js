import { fetcher } from "@/utils/fetcher";

export default {
	async getTranslations(language) {
		return fetcher({
			uri: `translations/${language}`,
		});
	},

	async saveTranslation() {
		// TODO send translation
		return { status: 200 };
	},
};
