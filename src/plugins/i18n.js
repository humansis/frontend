import Vue from "vue";
import VueI18n from "vue-i18n";
import consts from "@/const";
import TranslationService from "@/services/TranslationService";
import { Notification } from "@/utils/UI";

Vue.use(VueI18n);

const language = localStorage.getItem("language") || consts.DEFAULT_LANGUAGE;

export const fetchLocales = async () => {
	if (!sessionStorage.getItem("translations")) {
		await TranslationService.getTranslations(language).then((response) => {
			sessionStorage.setItem("translations", JSON.stringify(response.data) || {});
			console.log("response", response);
		}).catch((e) => {
			Notification(`Translations ${e}`, "is-danger");
		});
	}
};

export default new VueI18n({
	locale: language,
	fallbackLocale: language,
	messages: {
		[language]: JSON.parse(sessionStorage.getItem("translations")),
	},
});
