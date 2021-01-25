export default {
	changeCountry: (state, countryToChange) => {
		state.country = countryToChange;
	},

	changeLanguage: (state, languageToChange) => {
		state.language = languageToChange;
	},

	loading(state, boolean) {
		state.isLoading = boolean;
	},

	updateAssistance: (state, assistance) => {
		state.assistance = assistance;
	},

	updateProject: (state, project) => {
		state.project = project;
	},
};
