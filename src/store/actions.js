import CONST from "@/const";
import i18n from "@/plugins/i18n";
import consts from "@/store/const";
import { fetcher } from "@/utils/fetcher";

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
