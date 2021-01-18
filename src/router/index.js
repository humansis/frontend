import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

// https://blog.sqreen.com/authentication-best-practices-vue/
// eslint-disable-next-line max-len
// https://www.digitalocean.com/community/tutorials/how-to-set-up-vue-js-authentication-and-route-handling-using-vue-router
// const ifAuthenticated = (to, from, next) => {
// 	next(); // FIXME
//	 if (store.getters.isAuthenticated) {
//	 	next()
//	 	return
//	 }
//	 next('/login')
// };

// const ifNotAuthenticated = (to, from, next) => {
// 	next(); // FIXME
//	 if (!store.getters.isAuthenticated) {
//	 	next()
//	 	return
//	 }
//	 next('/')
// };

const routes = [
	{
		path: "/login",
		name: "Login",
		component: () => import(/* webpackChunkName: "Login" */ "@/views/Login"),
		// beforeEnter: ifNotAuthenticated,
	},
	{
		path: "/logout",
		name: "Logout",
		beforeEnter: ({ query }, from, next) => {
			localStorage.removeItem("user");
			next({ name: "Login", query });
		},
	},
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
				component: () => import(/* webpackChunkName: "Projects" */ "@/views/Project/ProjectsView"),
				meta: {
					breadcrumb: "Projects",
				},
				children: [
					{
						path: "",
						name: "Projects",
						component: () => import(/* webpackChunkName: "Project" */ "@/views/Project/ProjectPage"),
					},
					{
						path: "/project/:projectId",
						component: () => import(/* webpackChunkName: "Project" */ "@/views/Project/ProjectView"),
						meta: {
							breadcrumb: "Project",
						},
						children: [
							{
								path: "",
								name: "ProjectDetail",
								component: () => import(/* webpackChunkName: "ProjectList" */ "@/components/Projects/ProjectDetail"),
							},
							{
								path: "assistance/:assistanceId",
								name: "Assistance",
								component: () => import(/* webpackChunkName: "Assistance" */ "@/views/AssistanceUpdate"),
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
				component: () => import(/* webpackChunkName: "Beneficiaries" */ "@/views/BeneficiariesView"),
				children: [
					{
						path: "households",
						component: () => import(/* webpackChunkName: "BeneficiariesHouseholds" */ "@/views/Beneficiaries/HouseholdsView"),
						meta: {
							breadcrumb: "Households",
							parent: "Beneficiaries",
						},
						children: [
							{
								path: "",
								name: "Households",
								component: () => import(/* webpackChunkName: "BeneficiariesHouseholdsHouseholdPage" */ "@/views/Beneficiaries/HouseholdPage"),
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
						component: () => import(/* webpackChunkName: "BeneficiariesCommunities" */ "@/views/Beneficiaries/CommunitiesPage"),
						meta: {
							breadcrumb: "Communities",
						},
					},
					{
						path: "institutions",
						name: "Institutions",
						component: () => import(/* webpackChunkName: "BeneficiariesInstitutions" */ "@/views/Beneficiaries/InstitutionsPage"),
						meta: {
							breadcrumb: "Institutions",
						},
					},
					{
						path: "vendors",
						name: "Vendors",
						component: () => import(/* webpackChunkName: "BeneficiariesVendors" */ "@/views/Beneficiaries/VendorsPage"),
						meta: {
							breadcrumb: "Vendors",
						},
					},
				],
			},
			{
				path: "/reports",
				name: "Reports",
				component: () => import(/* webpackChunkName: "Reports" */ "@/views/ReportsPage"),
				meta: {
					breadcrumb: "Reports",
				},
			},
			{
				path: "/vouchers",
				name: "Vouchers",
				component: () => import(/* webpackChunkName: "Vouchers" */ "@/views/VouchersPage"),
				meta: {
					breadcrumb: "Vouchers",
				},
			},
			{
				path: "/configuration",
				name: "Configuration",
				component: () => import(/* webpackChunkName: "Configuration" */ "@/views/ConfigurationView"),
				children: [
					{
						path: "products",
						name: "Products",
						component: () => import(/* webpackChunkName: "ConfigurationProducts" */ "@/views/Configuration/ProductsPage"),
						meta: {
							breadcrumb: "Products",
						},
					},
					{
						path: "country-specifics",
						name: "CountrySpecificOptions",
						component: () => import(/* webpackChunkName: "ConfigurationCountrySpecificOption" */ "@/views/Configuration/CountrySpecificOptionPage"),
						meta: {
							breadcrumb: "Country Specifics",
						},
					},
				],
			},
			{
				path: "/administrative-settings",
				name: "Administrative Settings",
				component: () => import(/* webpackChunkName: "AdministrativeSetting" */ "@/views/AdministrativeSettingsPage"),
				meta: {
					breadcrumb: "Administrative Settings",
				},
			},
			{
				path: "/transactions",
				name: "Transactions",
				component: () => import(/* webpackChunkName: "Transactions" */ "@/views/TransactionsPage"),
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

router.beforeEach((to, from, next) => {
	// eslint-disable-next-line
	if (to.name !== "Login" && to.name !== "Logout" && to.name !== "NotFound" && !localStorage.getItem("user")) {
		const redirect = to.query?.redirect || to.fullPath;
		next({ name: "Logout", query: { redirect } });
	} else {
		next();
	}
});

export default router;
