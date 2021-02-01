import Vue from "vue";
import VueI18n from "vue-i18n";
import consts from "@/const";

Vue.use(VueI18n);

const language = localStorage.getItem("language") || consts.DEFAULT_LANGUAGE;

export default new VueI18n({
	locale: language,
	fallbackLocale: language,
	messages: {},
});
