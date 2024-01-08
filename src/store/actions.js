import CONST from "@/store/const";

export default {
	storeUser: ({ commit }, user) => {
		if (user) {
			commit(CONST.STORE_USER, user);
		}
	},

	updateStoredUser: ({ commit }, { attribute, value }) => {
		if (attribute && value) {
			commit(CONST.UPDATE_STORED_USER, { attribute, value });
		}
	},

	logoutUser: ({ commit }) => {
		commit(CONST.LOGOUT);
	},

	showSideMenu: ({ commit }, isVisible) => {
		commit(CONST.SHOW_SIDE_MENU, isVisible);
	},

	storeCountry: ({ commit }, country) => {
		if (country) {
			commit(CONST.STORE_COUNTRY, country);
		}
	},

	storeGridFilters: ({ commit }, gridFilters) => {
		commit(CONST.STORE_GRID_FILTERS, gridFilters);
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

	storeInstitutionIdNames: ({ commit }, institutionIdNames) => {
		commit(CONST.STORE_INSTITUTION_ID_NAMES, institutionIdNames);
	},

	storeSelectedExportOptions: ({ commit }, selectedExportOptions) => {
		commit(CONST.STORE_SELECTED_EXPORT_OPTIONS, selectedExportOptions);
	},
};
