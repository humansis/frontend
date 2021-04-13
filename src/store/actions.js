import CONST from "@/store/const";

export default {
	storeUser: ({ commit }, user) => {
		if (user) {
			commit(CONST.STORE_USER, user);
		}
	},

	appLoading: ({ commit }, boolean) => {
		commit(CONST.APP_LOADING, boolean);
	},

	updateCountry: ({ commit }, country) => {
		if (country) {
			commit(CONST.STORE_COUNTRY, country);
		}
	},

	updateLanguage: ({ commit }, language) => {
		if (language) {
			commit(CONST.STORE_LANGUAGE, language);
		}
	},

	changePerPage: ({ commit }, perPage) => {
		if (perPage) {
			commit(CONST.STORE_PER_PAGE, perPage);
		}
	},

	loadIconsToState: ({ commit }, icons) => {
		commit(CONST.STORE_ICONS, icons);
	},
};
