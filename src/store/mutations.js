import consts from "@/store/const";

export default {
	[consts.CHANGE_COUNTRY]: (state, countryToChange) => {
		state.country = { ...countryToChange };
	},

	[consts.CHANGE_LANGUAGE]: (state, languageToChange) => {
		state.language = { ...languageToChange };
	},

	[consts.SET_PERMISSIONS]: (state, { storedPermissions }) => {
		// TODO: decode storedPermissions and replace state.auth with it
		state.auth = { ...storedPermissions };
	},

	appLoading: (state, boolean) => {
		state.isAppLoading = boolean;
	},

	[consts.UPDATE_ASSISTANCE]: (state, assistance) => {
		state.temporaryAssistance = assistance;
	},

	[consts.UPDATE_PROJECT]: (state, project) => {
		state.temporaryProject = project;
	},

	[consts.UPDATE_PER_PAGE]: (state, perPage) => {
		state.perPage = perPage;
	},

	[consts.LOGIN_SUCCEEDED]: (state, { user }) => {
		state.user = user;
	},

	[consts.LOGOUT]: (state) => {
		state.user = null;
	},
};
