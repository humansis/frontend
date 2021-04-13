import { version } from "../../package.json";

export default {
	packageVersion: version || "0.0.0",
	isAppLoading: false,
	isNavBarVisible: true,
	isAsideVisible: true,
	isAsideExpanded: false,
	user: null,
	permissions: null,
	countries: null,
	country: null,
	language: null,
	perPage: 10,
	icons: null,
	translations: null,
};
