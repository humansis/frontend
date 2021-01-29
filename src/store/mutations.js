export default {
	changeCountry: (state, countryToChange) => {
		state.country = countryToChange;
	},

	changeLanguage: (state, languageToChange) => {
		state.language = languageToChange;
	},

	pageLoading: (state, boolean) => {
		state.isPageLoading = boolean;
	},

	appLoading: (state, boolean) => {
		state.isAppLoading = boolean;
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
};
