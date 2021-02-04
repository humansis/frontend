import CONST from "@/store/const";

export default {
	[CONST.CHANGE_COUNTRY]: (state, countryToChange) => {
		state.country = { ...countryToChange };
	},

	[CONST.CHANGE_LANGUAGE]: (state, languageToChange) => {
		state.language = { ...languageToChange };
	},

	[CONST.SET_PERMISSIONS]: (state, { storedPermissions }) => {
		// TODO: decode storedPermissions and replace state.auth with it
		state.auth = { ...storedPermissions };
	},

	[CONST.APP_LOADING]: (state, boolean) => {
		state.isAppLoading = boolean;
	},

	[CONST.UPDATE_ASSISTANCE]: (state, assistance) => {
		state.temporaryAssistance = assistance;
	},

	[CONST.UPDATE_PROJECT]: (state, project) => {
		state.temporaryProject = project;
	},

	[CONST.UPDATE_PER_PAGE]: (state, perPage) => {
		state.perPage = perPage;
	},

	[CONST.LOGIN_SUCCEEDED]: (state, { user }) => {
		state.user = user;
	},

	[CONST.LOGOUT]: (state) => {
		state.user = null;
	},
};
