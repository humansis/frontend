import Vue from "vue";
import VueI18n from "vue-i18n";
import CONST from "@/const";

Vue.use(VueI18n);

const language = localStorage.getItem("language") || CONST.DEFAULT_LANGUAGE;

export default new VueI18n({
	locale: language,
	fallbackLocale: language,
	messages: {},
});
