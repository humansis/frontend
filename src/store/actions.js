import CONST from "@/store/const";

export default {
	appLoading: ({ commit }, boolean) => {
		commit(CONST.APP_LOADING, boolean);
	},

	storeUser: ({ commit }, user) => {
		if (user) {
			commit(CONST.STORE_USER, user);
		}
	},

	logoutUser: ({ commit }) => {
		commit(CONST.LOGOUT);
	},

	storeCountry: ({ commit }, country) => {
		if (country) {
			commit(CONST.STORE_COUNTRY, country);
		}
	},

	storeAvailableProjects: ({ commit }, projects) => {
		commit(CONST.STORE_AVAILABLE_PROJECTS, projects);
	},

	storeCountries: ({ commit }, countries) => {
		if (countries?.length) {
			commit(CONST.STORE_COUNTRIES, countries);
		}
	},

	storeTranslations: ({ commit }, translations) => {
		if (translations) {
			commit(CONST.STORE_TRANSLATIONS, translations);
		}
	},

	storeLanguage: ({ commit }, language) => {
		if (language) {
			commit(CONST.STORE_LANGUAGE, language);
		}
	},

	storePerPage: ({ commit }, perPage) => {
		if (perPage) {
			commit(CONST.STORE_PER_PAGE, perPage);
		}
	},

	storeIcons: ({ commit }, icons) => {
		commit(CONST.STORE_ICONS, icons);
	},

	storePermissions: ({ commit }, permissions) => {
		if (permissions) {
			commit(CONST.STORE_PERMISSIONS, permissions);
		}
	},

	storeAdmNames: ({ commit }, admNames) => {
		commit(CONST.STORE_ADM_NAMES, admNames);
	},
};
