import CONST from "@/const";

export default {
	updateCountry: ({ commit }, countries) => {
		const country = localStorage.getItem("country") || CONST.DEFAULT_COUNTRY;
		const countryObj = countries.find((item) => item.iso3 === country);
		if (countryObj) {
			commit("changeCountry", countryObj);
		}
	},

	updateLanguage: ({ commit }, languages) => {
		const language = localStorage.getItem("language") || CONST.DEFAULT_LANGUAGE;
		const languageObj = languages.find((item) => item.name === language);
		if (languageObj) {
			commit("changeLanguage", languageObj);
		}
	},
};
