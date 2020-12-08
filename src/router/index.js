import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
	// {
	// 	path: "/login",
	// 	name: "Login",
	// 	component: () => import(/* webpackChunkName: "Login" */ "@/views/Login"),
	// },
	// {
	// 	path: "/logout",
	// 	name: "Logout",
	// 	beforeEnter: ({ query }, from, next) => {
	// 		localStorage.removeItem("user");
	// 		localStorage.removeItem("user-token");
	// 		next({ name: "Login", query });
	// 	},
	// },
	{
		path: "",
		component: () => import(/* webpackChunkName: "MainContainer" */ "@/layout/MainContainer"),
		children: [
			{
				path: "/",
				name: "Home",
				component: () => import(/* webpackChunkName: "Home" */ "@/views/Home"),
				meta: {
					breadcrumb: "Home",
				},
			},
			{
				path: "/projects",
				component: () => import(/* webpackChunkName: "Projects" */ "@/views/Project/Projects"),
				meta: {
					breadcrumb: "Projects",
				},
				children: [
					{
						path: "",
						name: "Projects",
						component: () => import(/* webpackChunkName: "Project" */ "@/views/Project/ProjectList"),
					},
					{
						path: "/project/:projectId",
						component: () => import(/* webpackChunkName: "Project" */ "@/views/Project/Project"),
						meta: {
							breadcrumb: "Project",
						},
						children: [
							{
								path: "",
								name: "ProjectDetail",
								component: () => import(/* webpackChunkName: "ProjectList" */ "@/components/Projects/ProjectList"),
							},
							{
								path: "assistance/:assistanceId",
								name: "Assistance",
								component: () => import(/* webpackChunkName: "Assistance" */ "@/views/Assistance"),
								meta: {
									breadcrumb: "Assistance",
								},
							},
							{
								path: "add-assistance",
								name: "AddAssistance",
								component: () => import(/* webpackChunkName: "AddAssistance" */ "@/views/AddAssistance"),
								meta: {
									breadcrumb: "Add Assistance",
									parent: "Assistance",
								},
							},
						],
					},
				],
			},

			{
				path: "/beneficiaries",
				component: () => import(/* webpackChunkName: "Beneficiaries" */ "@/views/Beneficiaries"),
				children: [
					{
						path: "households",
						component: () => import(/* webpackChunkName: "BeneficiariesHouseholds" */ "@/views/Beneficiaries/Households"),
						meta: {
							breadcrumb: "Households",
							parent: "Beneficiaries",
						},
						children: [
							{
								path: "",
								name: "Households",
								component: () => import(/* webpackChunkName: "BeneficiariesHouseholdsHouseholdPage" */ "@/views/Beneficiaries/HouseholdList"),
							},
							{
								path: "add",
								name: "AddHousehold",
								component: () => import(/* webpackChunkName: "BeneficiariesHouseholdsAddHousehold" */ "@/views/Beneficiaries/AddHousehold"),
								meta: {
									breadcrumb: "Add Household",
								},
							},
							{
								path: "import",
								name: "ImportHousehold",
								component: () => import(/* webpackChunkName: "BeneficiariesHouseholdsImportHousehold" */ "@/views/Beneficiaries/ImportHousehold"),
								meta: {
									breadcrumb: "Import Household",
								},
							},
							{
								path: "edit/:householdId",
								name: "EditHousehold",
								component: () => import(/* webpackChunkName: "BeneficiariesHouseholdsEditHousehold" */ "@/views/Beneficiaries/EditHousehold"),
								meta: {
									breadcrumb: "Edit Household",
								},
							},
							{
								path: "summary/:householdId",
								name: "HouseholdInformationSummary",
								component: () => import(/* webpackChunkName: "BeneficiariesHouseholdsHouseholdInformationSummary" */ "@/views/Beneficiaries/HouseholdInformationSummary"),
								meta: {
									breadcrumb: "Household Information Summary",
									parent: "Households",
								},
							},
						],
					},
					{
						path: "communities",
						name: "Communities",
						component: () => import(/* webpackChunkName: "BeneficiariesCommunities" */ "@/views/Beneficiaries/Communities"),
						meta: {
							breadcrumb: "Communities",
						},
					},
					{
						path: "institutions",
						name: "Institutions",
						component: () => import(/* webpackChunkName: "BeneficiariesInstitutions" */ "@/views/Beneficiaries/Institutions"),
						meta: {
							breadcrumb: "Institutions",
						},
					},
					{
						path: "vendors",
						name: "Vendors",
						component: () => import(/* webpackChunkName: "BeneficiariesVendors" */ "@/views/Beneficiaries/Vendors"),
						meta: {
							breadcrumb: "Vendors",
						},
					},
				],
			},
			{
				path: "/reports",
				name: "Reports",
				component: () => import(/* webpackChunkName: "Reports" */ "@/views/Reports"),
				meta: {
					breadcrumb: "Reports",
				},
			},
			{
				path: "/vouchers",
				name: "Vouchers",
				component: () => import(/* webpackChunkName: "Vouchers" */ "@/views/Vouchers"),
				meta: {
					breadcrumb: "Vouchers",
				},
			},
			{
				path: "/configuration",
				name: "Configuration",
				component: () => import(/* webpackChunkName: "Configuration" */ "@/views/Configuration"),
				children: [
					{
						path: "products",
						name: "Products",
						component: () => import(/* webpackChunkName: "ConfigurationProducts" */ "@/views/Configuration/Products"),
						meta: {
							breadcrumb: "Products",
						},
					},
					{
						path: "country-specifics",
						name: "CountrySpecifics",
						component: () => import(/* webpackChunkName: "ConfigurationCountrySpecifics" */ "@/views/Configuration/CountrySpecifics"),
						meta: {
							breadcrumb: "Country Specifics",
						},
					},
				],
			},
			{
				path: "/administrative-settings",
				name: "Administrative Settings",
				component: () => import(/* webpackChunkName: "AdministrativeSetting" */ "@/views/AdministrativeSettings"),
				meta: {
					breadcrumb: "Administrative Settings",
				},
			},
			{
				path: "/transactions",
				name: "Transactions",
				component: () => import(/* webpackChunkName: "Transactions" */ "@/views/Transactions"),
				meta: {
					breadcrumb: "Transactions",
				},
			},
			{
				path: "/jobs",
				name: "Jobs",
				component: () => import(/* webpackChunkName: "Jobs" */ "@/views/Jobs"),
				meta: {
					breadcrumb: "Jobs",
				},
			},
			{
				path: "/logs",
				name: "Logs",
				component: () => import(/* webpackChunkName: "Logs" */ "@/views/Logs"),
				meta: {
					breadcrumb: "Logs",
				},
			},
			{
				path: "/profile",
				name: "Profile",
				component: () => import(/* webpackChunkName: "Profile" */ "@/views/Profile"),
				meta: {
					breadcrumb: "Profile",
				},
			},
		],
	},
	{
		path: "/not-found",
		name: "NotFound",
		component: () => import(/* webpackChunkName: "NotFound" */ "@/views/NotFound"),
	},
	{
		path: "/*",
		component: () => import(/* webpackChunkName: "NotFound" */ "@/views/NotFound"),
	},
];

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes,
});

export default router;
