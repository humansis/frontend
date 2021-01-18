import consts from "@/store/const";

export default {
	[consts.COUNTRY_CHANGE]: (state, countryToChange) => {
		state.country = countryToChange;
	},

	changeLanguage: (state, languageToChange) => {
		state.language = languageToChange;
	},

	loading: (state, boolean) => {
		state.isLoading = boolean;
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
