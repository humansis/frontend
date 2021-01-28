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
};
