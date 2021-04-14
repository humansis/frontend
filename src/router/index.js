import Vue from "vue";
import VueRouter from "vue-router";
import getters from "@/store/getters";

Vue.use(VueRouter);

// TODO Prepare auth system after login will be implemented by BE
// https://blog.sqreen.com/authentication-best-practices-vue/
// eslint-disable-next-line max-len
// https://www.digitalocean.com/community/tutorials/how-to-set-up-vue-js-authentication-and-route-handling-using-vue-router
// const ifAuthenticated = (to, from, next) => {
// 	next();
//	 if (store.getters.isAuthenticated) {
//	 	next()
//	 	return
//	 }
//	 next('/login')
// };

// const ifNotAuthenticated = (to, from, next) => {
// 	next();
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
			// TODO Remove from vuex storage user's auth token
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
					description: "This page is where you have a global view on some figures about the country and its projects. There is a map to show you the country's distributions and a summary of the last ones.",
				},
			},
			{
				path: "/projects",
				component: { render(c) { return c("router-view"); } },
				children: [
					{
						path: "",
						name: "Projects",
						component: () => import(/* webpackChunkName: "Projects" */ "@/views/Projects"),
						meta: {
							breadcrumb: "Projects",
							description: "This page is where you can see all the country's projects (only thoses that you have the right to see).",
						},
					},
					{
						path: "/project/:projectId",
						component: { render(c) { return c("router-view"); } },
						children: [
							{
								path: "",
								name: "Project",
								component: () => import(/* webpackChunkName: "Project" */ "@/views/Project"),
								meta: {
									breadcrumb: "Project",
									description: "This page is where you can see summary of project and there assistance. If you have the right, you can add a new assistance with the project's households, manage assistance and transactions.",
								},
							},
							{
								path: "assistance/:assistanceId",
								name: "AssistanceEdit",
								component: () => import(/* webpackChunkName: "AssistanceEdit" */ "@/views/AssistanceEdit"),
								meta: {
									breadcrumb: "Assistance Edit",
									description: "",
								},
							},
							{
								path: "assistance/detail/:assistanceId",
								name: "AssistanceDetail",
								component: () => import(/* webpackChunkName: "AssistanceDetail" */ "@/views/AssistanceDetail"),
								meta: {
									breadcrumb: "Assistance Detail",
									description: "",
								},
							},
							{
								path: "add-assistance",
								name: "AddAssistance",
								component: () => import(/* webpackChunkName: "AddAssistance" */ "@/views/AddAssistance"),
								meta: {
									breadcrumb: "Add Assistance",
									description: "This page is a form to add a new distribution to a project. You will use selection criteria to determine the households or beneficiaries who will take part in it and add a specific amount of commodities to be distributed.",
									parent: "Assistance",
								},
							},
						],
					},
				],
			},
			{
				path: "/beneficiaries",
				redirect: { name: "Households" },
				component: { render(c) { return c("router-view"); } },
				meta: {
					breadcrumb: "Beneficiaries",
				},
				children: [
					{
						path: "households",
						component: { render(c) { return c("router-view"); } },
						meta: {
							parent: "Beneficiaries",
						},
						children: [
							{
								path: "",
								name: "Households",
								component: () => import(/* webpackChunkName: "Households" */ "@/views/Beneficiaries/Households"),
								meta: {
									breadcrumb: "Households",
									description: "This page is where ou can see all the households in the country. If you have the right, you can add new households with the '+' button, manage households and filter/research in the list.",
								},
							},
							{
								path: "add",
								name: "AddHousehold",
								component: () => import(/* webpackChunkName: "AddHousehold" */ "@/views/Beneficiaries/AddHousehold"),
								meta: {
									breadcrumb: "Add Household",
									description: "This page is a form to add a new household to the platform.",
								},
							},
							{
								path: "import",
								name: "ImportHousehold",
								component: () => import(/* webpackChunkName: "ImportHousehold" */ "@/views/Beneficiaries/ImportHousehold"),
								meta: {
									breadcrumb: "Import Household",
									description: "This page is where you can import beneficiaries. You can choose to import them using a file or the API (the external data source) to import all the household of a specific commune.",
								},
							},
							{
								path: "edit/:householdId",
								name: "EditHousehold",
								component: () => import(/* webpackChunkName: "EditHousehold" */ "@/views/Beneficiaries/EditHousehold"),
								meta: {
									breadcrumb: "Edit Household",
									description: "",
								},
							},
							{
								path: "summary/:householdId",
								name: "HouseholdInformationSummary",
								component: () => import(/* webpackChunkName: "HouseholdInformationSummary" */ "@/views/Beneficiaries/HouseholdInformationSummary"),
								meta: {
									breadcrumb: "Household Information Summary",
									description: "",
									parent: "Households",
								},
							},
						],
					},
					{
						path: "communities",
						name: "Communities",
						component: () => import(/* webpackChunkName: "Communities" */ "@/views/Beneficiaries/Communities"),
						meta: {
							breadcrumb: "Communities",
							description: "",
						},
					},
					{
						path: "institutions",
						name: "Institutions",
						component: () => import(/* webpackChunkName: "Institutions" */ "@/views/Beneficiaries/Institutions"),
						meta: {
							breadcrumb: "Institutions",
							description: "",
						},
					},
					{
						path: "vendors",
						name: "Vendors",
						component: () => import(/* webpackChunkName: "Vendors" */ "@/views/Beneficiaries/Vendors"),
						meta: {
							breadcrumb: "Vendors",
							description: "",
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
					description: "This page is used to see the country's statistics, such as the average transactions of a projects, number of distributions",
				},
			},
			{
				path: "/vouchers",
				name: "Vouchers",
				component: () => import(/* webpackChunkName: "Vouchers" */ "@/views/Vouchers"),
				meta: {
					breadcrumb: "Vouchers",
					description: "This page is where you can create, edit, assign and print vouchers booklets",
				},
			},
			{
				path: "/configuration",
				name: "Configuration",
				component: { render(c) { return c("router-view"); } },
				children: [
					{
						path: "products",
						name: "Products",
						component: () => import(/* webpackChunkName: "Products" */ "@/views/Configuration/Products"),
						meta: {
							breadcrumb: "Products",
							description: "This page is where you'll be able to add a new project, country specific, third party connection, product, vendor, edit and delete them according to your rights",
						},
					},
					{
						path: "country-specifics",
						name: "CountrySpecificOptions",
						component: () => import(/* webpackChunkName: "CountrySpecificOptions" */ "@/views/Configuration/CountrySpecificOptions"),
						meta: {
							breadcrumb: "Country Specifics",
							description: "This page is where you'll be able to add a new project, country specific, third party connection, product, vendor, edit and delete them according to your rights",
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
					description: "This page is where you can manage users, donors and your organization's specifics",
				},
			},
			{
				path: "/transactions",
				name: "Transactions",
				component: () => import(/* webpackChunkName: "Transactions" */ "@/views/Transactions"),
				meta: {
					breadcrumb: "Transactions",
					description: "",
				},
			},
			{
				path: "/jobs",
				name: "Jobs",
				component: () => import(/* webpackChunkName: "Jobs" */ "@/views/Jobs"),
				meta: {
					breadcrumb: "Jobs",
					description: "",
				},
			},
			{
				path: "/logs",
				name: "Logs",
				component: () => import(/* webpackChunkName: "Logs" */ "@/views/Logs"),
				meta: {
					breadcrumb: "Logs",
					description: "",
				},
			},
			{
				path: "/profile",
				name: "Profile",
				component: () => import(/* webpackChunkName: "Profile" */ "@/views/Profile"),
				meta: {
					breadcrumb: "Profile",
					description: "This page is where you can change your password",
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
	if (to.name !== "Login" && to.name !== "Logout" && to.name !== "NotFound" && !getters.getUserFromVuexStorage()) {
		const redirect = to.query?.redirect || to.fullPath;
		next({ name: "Logout", query: { redirect } });
	} else {
		window.document.title = to.meta && to.meta.breadcrumb ? `${to.meta.breadcrumb} | Humansis` : "Humansis";
		next();
	}
});

export default router;
