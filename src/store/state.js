import { version } from "../../package.json";

export default {
	packageVersion: version || "0.0.0",
	isAppLoading: false,
	isNavBarVisible: true,
	isAsideVisible: true,
	isAsideExpanded: false,
	user: null,
	countries: null,
	country: null,
	language: null,
	perPage: 10,
	icons: null,
	translations: null,
	languages: [
		{ name: "English", key: "en" },
		{ name: "Arabic", key: "ar" },
		{ name: "Russian", key: "ru" },
		{ name: "Amrahic", key: "am" },
	],
	permissions: {
		addProject: false, // button -
		editProject: false, // button -
		deleteProject: false, // button -
		viewProject: false, // button -
		addDistribution: false, // view, button -
		editDistribution: false, // view, button -
		deleteDistribution: false,
		viewDistribution: false, // view, button -
		assignDistributionItems: false,
		addBeneficiary: false, // view, button -
		editBeneficiary: false, // view, button -
		deleteBeneficiary: false,
		viewBeneficiary: false, // view -
		importBeneficiaries: false, // view, button -
		exportBeneficiaries: false,
		viewVouchers: false, // view -
		exportPrintVouchers: false,
		addVouchers: false, // button -
		viewVendors: false, // button -
		addEditVendors: false, // button -
		viewDonors: false, // view, button -
		addEditDonors: false, // button -
		viewProducts: false, // view -
		addEditProducts: false, // button -
		countryReport: false, // tab -
		projectReport: false, // tab -
		distributionReport: false, // tab -
		countrySettings: false, // view - OK
		addEditUsers: false,
		adminSettings: false, // view - OK
	},
};
