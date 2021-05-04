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
	isAppLoading: false,
	isNavBarVisible: true,
	isAsideVisible: true,
	isAsideExpanded: false,
	user: {
		iat: null,
		exp: null,
		roles: [],
		username: null,
		token: null,
	},
	availableProjects: null,
	countries: null,
	country: null,
	language: null,
	perPage: 10,
	icons: null,
	translations: null,
	admNames: null,
	languages: [
		{ name: "English", key: "en" },
		{ name: "Arabic", key: "ar" },
		{ name: "Russian", key: "ru" },
		{ name: "Amrahic", key: "am" },
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
