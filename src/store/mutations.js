import consts from "@/store/const";

export default {
	changeCountry: (state, countryToChange) => {
		state.country = countryToChange;
	},

	changeLanguage: (state, languageToChange) => {
		state.language = languageToChange;
	},

	fullPageLoading: (state, boolean) => {
		state.isFullPageLoading = boolean;
	},

	setPermissions: (state, { storedPermissions }) => {
		// TODO: decode storedPermissions and replace state.auth with it
		state.auth = { ...storedPermissions };
	},

	updateAssistance: (state, assistance) => {
		state.temporaryAssistance = assistance;
	},

	updateProject: (state, project) => {
		state.temporaryProject = project;
	},

	updatePerPage: (state, perPage) => {
		state.perPage = perPage;
	},

	[consts.LOGIN_STARTED]: (state) => {
		state.login.loading = true;
		state.login.error = null;
	},

	[consts.LOGIN_SUCCEEDED]: (state, { user }) => {
		state.login.loading = false;
		state.login.user = user;
	},

	[consts.LOGIN_FAILED]: (state, error) => {
		state.login.loading = false;
		state.login.error = error.toString();
	},

	[consts.LOGOUT]: (state) => {
		state.login.loading = false;
		state.login.error = null;
	},
};
