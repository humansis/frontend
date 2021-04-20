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

	[CONST.STORE_PERMISSIONS]: (state, permissions) => {
		const permissionsCopy = { ...state.permissions };

		Object.keys(permissionsCopy).forEach((permission) => {
			state.permissions[permission] = permissions.includes(permission);
		});
	},

	[CONST.STORE_COUNTRIES]: (state, countries) => {
		state.countries = countries;
	},

	[CONST.STORE_COUNTRY]: (state, country) => {
		state.country = { ...country };
	},

	[CONST.STORE_LANGUAGE]: (state, language) => {
		state.language = { ...language };
	},

	[CONST.STORE_TRANSLATIONS]: (state, translations) => {
		state.translations = translations;
	},

	[CONST.APP_LOADING]: (state, boolean) => {
		state.isAppLoading = boolean;
	},

	[CONST.STORE_PER_PAGE]: (state, perPage) => {
		state.perPage = perPage;
	},

	[CONST.STORE_USER]: (state, user) => {
		state.user = user;
	},

	[CONST.LOGOUT]: (state) => {
		state.user = {
			iat: null,
			exp: null,
			roles: [],
			username: null,
			token: null,
		};
		const permissionsCopy = { ...state.permissions };

		Object.keys(permissionsCopy).forEach((permission) => {
			state.permissions[permission] = false;
		});
	},

	[CONST.STORE_ICONS]: (state, icons) => {
		state.icons = icons;
	},
};
