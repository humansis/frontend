import gitInfo from "@/gitInfo";

function setPackageVersion() {
	const oldAppVersion = JSON.parse(localStorage.getItem("vuex"))?.appVersion;
	if (gitInfo.appVersion !== oldAppVersion) {
		localStorage.removeItem("vuex");
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
	availableProjects: null,
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
	icons: null,
	translations: null,
	admNames: {},
	gridFilters: {
		households: [],
		vouchers: [],
		distributions: [],
		purchases: [],
		vendors: [],
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
	],
	permissions: {
		addProject: false,
		editProject: false,
		deleteProject: false,
		viewProject: false,
		addDistribution: false,
		editDistribution: false,
		deleteDistribution: false,
		viewDistribution: false,
		assignDistributionItems: false,
		addBeneficiary: false,
		editBeneficiary: false,
		deleteBeneficiary: false,
		viewBeneficiary: false,
		importBeneficiaries: false,
		exportBeneficiaries: false,
		viewVouchers: false,
		exportPrintVouchers: false,
		addVouchers: false,
		viewVendors: false,
		addEditVendors: false,
		viewDonors: false,
		addEditDonors: false,
		viewProducts: false,
		addEditProducts: false,
		countryReport: false,
		projectReport: false,
		authoriseElectronicCashTransfer: false,
		distributionReport: false,
		countrySettings: false,
		addEditUsers: false,
		adminSettings: false,
	},
};
