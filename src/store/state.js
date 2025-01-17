import { removeCookie } from "@/utils/cookie";
import modalityTypeIcons from "@/assets/icons/svg/modalityTypes.json";
import productCategoryIcons from "@/assets/icons/svg/productCategory.json";
import sectorIcons from "@/assets/icons/svg/sectors.json";
import vulnerabilityCriteriaIcons from "@/assets/icons/svg/vulnerabilityCriteria.json";
import gitInfo from "@/gitInfo";

function setPackageVersion() {
	const oldAppVersion = JSON.parse(localStorage.getItem("vuex"))?.appVersion;

	if (gitInfo.appVersion !== oldAppVersion) {
		localStorage.removeItem("vuex");
		removeCookie("token");
	}

	return gitInfo.appVersion;
}

export default {
	appVersion: setPackageVersion(),
	isNavBarVisible: true,
	isAsideVisible: true,
	isAsideExpanded: false,
	user: {
		iat: null,
		exp: null,
		roles: [],
		username: null,
	},
	lastUsername: null,
	accessibleProjectIds: [],
	countries: [],
	country: {
		name: null,
		iso3: null,
	},
	language: {
		name: "English",
		key: "en",
		direction: "ltr",
	},
	perPage: 10,
	icons: {
		...modalityTypeIcons,
		...productCategoryIcons,
		...sectorIcons,
		...vulnerabilityCriteriaIcons,
	},
	translations: null,
	admNames: {},
	institutionIdNames: {},
	gridFilters: {
		households: [],
		assistanceDetail: [],
		assistances: [],
		vouchers: [],
		distributions: [],
		purchases: [],
		vendors: [],
	},
	selectedExportsOptions: {
		assistance: [],
		vulnerabilityScores: [],
		households: [],
		vendors: [],
		transactionsAssistances: [],
		transactionsPurchased: [],
		projects: [],
		institutions: [],
		projectAssistances: [],
		products: [],
		imports: [],
		vouchers: [],
		customFields: [],
		donors: [],
		users: [],
	},
	languages: [
		{ name: "English", key: "en", direction: "ltr" },
		{ name: "Arabic", key: "ar", direction: "rtl" },
		{ name: "Ukrainian", key: "uk", direction: "ltr" },
		{ name: "Russian", key: "ru", direction: "ltr" },
		{ name: "Amharic", key: "am", direction: "ltr" },
		{ name: "French", key: "fr", direction: "ltr" },
		{ name: "Khmer", key: "km", direction: "ltr" },
		{ name: "Armenian", key: "hy", direction: "ltr" },
		{ name: "Mongolian", key: "mn", direction: "ltr" },
		{ name: "Pashto", key: "ps", direction: "ltr" },
		{ name: "Dari", key: "fa", direction: "ltr" },
	],
	userPermissions: {},
};
