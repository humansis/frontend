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

	addAssistanceToState: ({ commit }, assistance) => {
		if (assistance) {
			commit(CONST.UPDATE_ASSISTANCE, assistance);
		}
	},

	addProjectToState: ({ commit }, project) => {
		if (project) {
			commit(CONST.UPDATE_PROJECT, project);
		}
	},

	removeAssistanceFromState: ({ commit }) => {
		commit(CONST.UPDATE_ASSISTANCE, null);
	},

	removeProjectFromState: ({ commit }) => {
		commit(CONST.UPDATE_PROJECT, null);
	},

	loadIconsToState: ({ commit }, icons) => {
		commit(CONST.LOAD_ICONS, icons);
	},
};
