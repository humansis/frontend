<template>
	<router-view />
</template>

<script>
import TranslationService from "@/services/TranslationService";
import { Notification } from "@/utils/UI";
import consts from "@/const";

export default {
	created() {
		this.setCountry();
		this.setLocales();
	},

	methods: {
		setCountry() {
			if (!localStorage.getItem("country")) {
				localStorage.setItem("country", consts.DEFAULT_COUNTRY);
			}
		},

		async setLocales() {
			const language = localStorage.getItem("language") || consts.DEFAULT_LANGUAGE;
			localStorage.setItem("language", language);

			if (!sessionStorage.getItem("translations")) {
				this.$store.commit("appLoading", true);

				await TranslationService.getTranslations(language).then((response) => {
					sessionStorage.setItem("translations", JSON.stringify(response.data) || {});
					this.$root.$i18n.setLocaleMessage(language, response.data);
				}).catch((e) => {
					Notification(`Translations ${e}`, "is-danger");
					this.$store.commit("appLoading", false);
				});

				this.$store.commit("appLoading", false);
			} else {
				this.$root.$i18n.setLocaleMessage(language, JSON.parse(
					sessionStorage.getItem("translations"),
				));
			}
		},
	},
};
</script>
