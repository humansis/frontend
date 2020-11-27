export default {
	changeCountry: (state, countryToChange) => {
		state.country = countryToChange;
	},
	loading(state, boolean) {
		state.isLoading = boolean;
	},
};
