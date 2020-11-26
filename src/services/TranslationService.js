export default {
	async getTranslations() {
		return {
			data: [
				{
					key: "hello",
					en: "Hello",
					de: "Hallo",
				},
				{
					key: "world",
					en: "World",
					de: "Welt",
				},
			],
			totalCount: 2 };
	},

	async saveTranslation() {
		// TODO send translation
		return { status: 200 };
	},
};
