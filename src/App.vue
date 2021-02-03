<template>
	<router-view />
</template>

<script>
import { mapActions } from "vuex";
import TranslationService from "@/services/TranslationService";
// import { Notification } from "@/utils/UI";
import getters from "@/store/getters";
import CONST from "@/const";

export default {
	created() {
		this.setCountryAndLanguage();
		this.setLocales();
	},

	data() {
		return {
			defaultLanguage: {
				name: CONST.DEFAULT_LANGUAGE,
				key: CONST.DEFAULT_LANGUAGE,
			},
		};
	},

	methods: {
		...mapActions(["updateCountry", "updateLanguage"]),

		setCountryAndLanguage() {
			if (!localStorage.getItem("vuex")) {
				this.updateCountry({
					iso3: CONST.DEFAULT_COUNTRY,
				});

				this.updateLanguage(this.defaultLanguage);
			}
		},

		async setLocales() {
			const { key: languageKey } = getters.getLanguageFromLocalStorage()
			|| this.this.defaultLanguage;

			if (!sessionStorage.getItem("translations")) {
				this.$store.dispatch("appLoading", true);

				await TranslationService.getTranslations(languageKey).then((response) => {
					if (response.status === 200) {
						sessionStorage.setItem("translations", JSON.stringify(response.data) || {});
						this.$root.$i18n.setLocaleMessage(languageKey, response.data);
					}
				}).catch(() => {
					// TODO Uncomment this after translations will be loaded after login
					// Notification(`Translations ${e}`, "is-danger");
					this.$store.dispatch("appLoading", false);
				});

				this.$store.dispatch("appLoading", false);
			} else {
				this.$root.$i18n.setLocaleMessage(languageKey, JSON.parse(
					sessionStorage.getItem("translations"),
				));
			}
		},
	},
};
</script>
