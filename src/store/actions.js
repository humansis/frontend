import i18n from "@/plugins/i18n";

export default {
	updateCountry: ({ commit }, country) => {
		if (country) {
			commit("changeCountry", country);
		}
	},

	updateLanguage: ({ commit }, language) => {
		if (language) {
			commit("changeLanguage", language);
			i18n.locale = language.name;
		}
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
