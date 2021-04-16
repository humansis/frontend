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
		importBeneficiaries: false, // OK
		exportBeneficiaries: false, // TODO Add for export button in Beneficiaries
		viewVouchers: false, // OK
		exportPrintVouchers: false, // TODO Add for export button in Vouchers
		addVouchers: false, // OK
		viewVendors: false, // OK
		addEditVendors: false, // OK
		viewDonors: false, // OK
		addEditDonors: false, // OK
		viewProducts: false, // OK
		addEditProducts: false, // OK
		countryReport: false, // OK
		projectReport: false, // OK
		distributionReport: false, // OK
		countrySettings: false, // OK
		addEditUsers: false, // OK
		adminSettings: false, // OK
	},
};
