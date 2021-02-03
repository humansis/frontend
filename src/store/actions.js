import consts from "@/store/const";

export default {
	storeUser: ({ commit }, user) => {
		commit(consts.LOGIN_SUCCEEDED, user);
	},

	updateCountry: ({ commit }, country) => {
		if (country) {
			commit(consts.CHANGE_COUNTRY, country);
		}
	},

	updateLanguage: ({ commit }, language) => {
		if (language) {
			commit(consts.CHANGE_LANGUAGE, language);
		}
	},

	changePerPage: ({ commit }, perPage) => {
		if (perPage) {
			commit(consts.UPDATE_PER_PAGE, perPage);
		}
	},

	addAssistanceToState: ({ commit }, assistance) => {
		if (assistance) {
			commit(consts.UPDATE_ASSISTANCE, assistance);
		}
	},

	addProjectToState: ({ commit }, project) => {
		if (project) {
			commit(consts.UPDATE_PROJECT, project);
		}
	},

	removeAssistanceFromState: ({ commit }) => {
		commit(consts.UPDATE_ASSISTANCE, null);
	},

	removeProjectFromState: ({ commit }) => {
		commit(consts.UPDATE_PROJECT, null);
	},
};
