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

	storeAccessibleProjectIds: ({ commit }, projectIds) => {
		commit(CONST.STORE_ACCESSIBLE_PROJECT_IDS, projectIds);
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

	storeUserPermissions: ({ commit }, permissions) => {
		if (permissions) {
			commit(CONST.STORE_USER_PERMISSIONS, permissions);
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
