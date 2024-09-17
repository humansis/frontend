import { removeCookie } from "@/utils/cookie";
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

	[CONST.SHOW_SIDE_MENU]: (state, isVisible) => {
		state.isAsideVisible = isVisible;
	},

	[CONST.STORE_USER_PERMISSIONS]: (state, permissions) => {
		permissions.forEach((permission) => {
			const camelCasePermission = permission.replace(/_./g, (x) => x[1].toUpperCase());

			state.userPermissions[camelCasePermission] = true;
		});
	},

	[CONST.STORE_ACCESSIBLE_PROJECT_IDS]: (state, projectIds) => {
		state.accessibleProjectIds = projectIds;
	},

	[CONST.STORE_GRID_FILTERS]: (state, gridFilters) => {
		state.gridFilters = gridFilters;
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

	[CONST.STORE_PER_PAGE]: (state, perPage) => {
		state.perPage = perPage;
	},

	[CONST.STORE_USER]: (state, user) => {
		state.user = user;
	},

	[CONST.UPDATE_STORED_USER]: (state, { attribute, value }) => {
		const userCopy = { ...state.user };
		userCopy[attribute] = value;

		state.user = userCopy;
	},

	[CONST.LOGOUT]: (state) => {
		state.isAsideVisible = false;
		state.lastUsername = state.user.username;

		state.user = {
			iat: null,
			exp: null,
			roles: [],
			username: null,
		};

		removeCookie("token");

		const permissionsCopy = { ...state.permissions };

		Object.keys(permissionsCopy).forEach((permission) => {
			state.permissions[permission] = false;
		});
	},

	[CONST.STORE_ICONS]: (state, icons) => {
		state.icons = icons;
	},

	[CONST.STORE_ADM_NAMES]: (state, admNames) => {
		state.admNames = admNames;
	},

	[CONST.STORE_INSTITUTION_ID_NAMES]: (state, institutionIdNames) => {
		state.institutionIdNames = institutionIdNames;
	},

	[CONST.STORE_SELECTED_EXPORT_OPTIONS]: (state, selectedExportOptions) => {
		state.selectedExportsOptions = selectedExportOptions;
	},
};
