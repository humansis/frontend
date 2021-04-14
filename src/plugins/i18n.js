import Vue from "vue";
import VueI18n from "vue-i18n";
import CONST from "@/const";

Vue.use(VueI18n);

const vuexStorage = JSON.parse(localStorage.getItem("vuex"));

let language = CONST.DEFAULT_LANGUAGE;

if (vuexStorage) {
	language = vuexStorage.language.key;
}

export default new VueI18n({
	locale: language.toLowerCase(),
	fallbackLocale: language.toLowerCase(),
	messages: {},
	silentTranslationWarn: true,
});
