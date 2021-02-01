export default {
	updateCountry: ({ commit }, country) => {
		commit("changeCountry", country);
	},

	updateLanguage: ({ commit }, language) => {
		commit("changeLanguage", language);
	},

	changePerPage: ({ commit }, perPage) => {
		if (perPage) {
			commit("updatePerPage", perPage);
		}
	},

	addAssistanceToState: ({ commit }, assistance) => {
		if (assistance) {
			commit("updateAssistance", assistance);
		}
	},

	addProjectToState: ({ commit }, project) => {
		if (project) {
			commit("updateProject", project);
		}
	},

	removeAssistanceFromState: ({ commit }) => {
		commit("updateAssistance", null);
	},

	removeProjectFromState: ({ commit }) => {
		commit("updateProject", null);
	},
};
