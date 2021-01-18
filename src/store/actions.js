import { DEFAULT_COUNTRY, DEFAULT_LANGUAGE } from "@/const";
import i18n from "@/plugins/i18n";
import consts from "@/store/const";
import { fetcher } from "@/utils/fetcher";

export default {
	updateCountry: ({ commit }, countries) => {
		const country = localStorage.getItem("country") || DEFAULT_COUNTRY;
		const countryObj = countries.find((item) => item.iso3 === country);
		if (countryObj) {
			commit(consts.COUNTRY_CHANGE, countryObj);
		}
	},

	updateLanguage: ({ commit }, languages) => {
		const language = localStorage.getItem("language") || DEFAULT_LANGUAGE;
		const languageObj = languages.find((item) => item.name === language);
		if (languageObj) {
			commit("changeLanguage", languageObj);
			i18n.locale = languageObj.name;
		}
	},

	logUserIn: async ({ commit }, credentials) => {
		try {
			commit(consts.LOGIN_STARTED);

			const {
				data: user,
			} = await fetcher({
				uri: "login",
				method: "POST",
				body: JSON.stringify(credentials),
			});

			user.authdata = window.btoa(`${credentials.username}:${credentials.password}`);

			localStorage.setItem("user", JSON.stringify(user));

			commit(consts.LOGIN_SUCCEEDED, { user });

			return { successful: true };
		} catch (error) {
			console.error(error);

			commit(consts.LOGIN_FAILED, error);

			return { successful: false };
		}
	},
};
