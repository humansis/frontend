import CONST from "@/store/const";

export default {
	storeUser: ({ commit }, user) => {
		if (user) {
			commit(CONST.LOGIN_SUCCEEDED, user);
		}
	},

	appLoading: ({ commit }, boolean) => {
		commit(CONST.APP_LOADING, boolean);
	},

	updateCountry: ({ commit }, country) => {
		if (country) {
			commit(CONST.CHANGE_COUNTRY, country);
		}
	},

	updateLanguage: ({ commit }, language) => {
		if (language) {
			commit(CONST.CHANGE_LANGUAGE, language);
		}
	},

	changePerPage: ({ commit }, perPage) => {
		if (perPage) {
			commit(CONST.UPDATE_PER_PAGE, perPage);
		}
	},

	loadIconsToState: ({ commit }, icons) => {
		commit(CONST.LOAD_ICONS, icons);
	},
};
