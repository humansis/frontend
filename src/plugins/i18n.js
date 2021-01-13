import Vue from "vue";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

const messages = {
};

function loadMessages() {
	// TODO get locales from API
	console.log("Loading locales ...");
	return messages;
}

export default new VueI18n({
	locale: "EN",
	fallbackLocale: "EN",
	messages: loadMessages(),
});
