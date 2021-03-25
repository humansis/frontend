import CONST from "@/store/const";

export default {
	basic(state, payload) {
		state[payload.key] = payload.value;
	},

	fullPage(state, payload) {
		state.isNavBarVisible = !payload;
		state.isAsideVisible = !payload;

		["has-aside-left", "has-navbar-fixed-top"].forEach((htmlClass) => {
			if (payload) {
				document.documentElement.classList.remove(htmlClass);
			} else {
				document.documentElement.classList.add(htmlClass);
			}
		});
	},

	asideStateToggle(state, payload = null) {
		const htmlAsideClassName = "has-aside-expanded";

		const isExpand = payload !== null ? payload : !state.isAsideExpanded;

		if (isExpand) {
			document.documentElement.classList.add(htmlAsideClassName);
		} else {
			document.documentElement.classList.remove(htmlAsideClassName);
		}

		state.isAsideExpanded = isExpand;
	},

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

	[CONST.UPDATE_PER_PAGE]: (state, perPage) => {
		state.perPage = perPage;
	},

	[CONST.LOGIN_SUCCEEDED]: (state, { user }) => {
		state.user = user;
	},

	[CONST.LOGOUT]: (state) => {
		state.user = null;
	},

	[CONST.LOAD_ICONS]: (state, icons) => {
		state.icons = icons;
	},
};
