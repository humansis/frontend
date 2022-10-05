<template>
	<router-view />
</template>

<script>
import { mapActions, mapState } from "vuex";
import { Notification } from "@/utils/UI";
import LocationsService from "@/services/LocationsService";
import TranslationService from "@/services/TranslationService";

export default {
	name: "App",

	computed: {
		...mapState([
			"language",
			"languages",
		]),
	},

	watch: {
		$route: "setLanguage",
	},

	methods: {
		...mapActions([
			"storeLanguage",
			"storeAdmNames",
			"storeTranslations",
		]),

		async setLanguage() {
			const { lang } = this.$route.params;
			if (lang && lang !== this.language?.key) {
				const language = this.languages.find((item) => item.key === this.$route.params.lang);
				if (language) {
					TranslationService.getTranslations(language.key).then(async (response) => {
						if (response.status === 200) {
							this.$i18n.locale = language.key.toLowerCase();
							this.$i18n.fallbackLocale = language.key.toLowerCase();
							this.$root.$i18n.setLocaleMessage(language.key, response.data);
							await this.storeLanguage(language);
							await this.storeTranslations(response.data);
							await this.fetchAdmNames();
						}
					}).catch((e) => {
						if (e.message) Notification(`${this.$t("Translations")} ${e}`, "is-danger");
					});
				}
			}
		},

		async fetchAdmNames() {
			await LocationsService.getAdmNames()
				.then(({ data }) => {
					this.storeAdmNames(data);
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Location Names")} ${e}`, "is-danger");
				});
		},
	},
};
</script>
