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
				name: "Projects",
				component: () => import(/* webpackChunkName: "Projects" */ "@/views/Projects"),
				meta: {
					breadcrumb: "Projects",
				},
			},
			{
				path: "/project/:projectId",
				name: "Project",
				component: () => import(/* webpackChunkName: "Project" */ "@/views/Project"),
				meta: {
					breadcrumb: "Project",
				},
			},
			{
				path: "/beneficiaries",
				component: () => import(/* webpackChunkName: "Beneficiaries" */ "@/views/Beneficiaries"),
				meta: {
					breadcrumb: "Beneficiaries",
				},
				children: [
					{
						path: "households",
						name: "Households",
						component: () => import(/* webpackChunkName: "BeneficiariesHouseholds" */ "@/views/Beneficiaries/Households"),
						meta: {
							breadcrumb: "Households",
						},
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
				],
			},
			{
				path: "/reports",
				name: "Reports",
				component: () => import(/* webpackChunkName: "TODO" */ "@/views/tmp"),
				meta: {
					breadcrumb: "Reports",
				},
			},
			{
				path: "/vouchers",
				name: "Vouchers",
				component: () => import(/* webpackChunkName: "TODO" */ "@/views/tmp"),
				meta: {
					breadcrumb: "Vouchers",
				},
			},
			{
				path: "/configuration",
				name: "Configuration",
				component: () => import(/* webpackChunkName: "Configuration" */ "@/views/Configuration"),
				meta: {
					breadcrumb: "Configuration",
				},
				children: [
					{
						path: "vendors",
						name: "Vendors",
						component: () => import(/* webpackChunkName: "ConfigurationVendors" */ "@/views/Configuration/Vendors"),
						meta: {
							breadcrumb: "Vendors",
						},
					},
					{
						path: "products",
						name: "Products",
						component: () => import(/* webpackChunkName: "ConfigurationProducts" */ "@/views/Configuration/Products"),
						meta: {
							breadcrumb: "Products",
						},
					},
					{
						path: "country_options",
						name: "CountryOptions",
						component: () => import(/* webpackChunkName: "ConfigurationCountryOptions" */ "@/views/Configuration/CountryOptions"),
						meta: {
							breadcrumb: "CountryOptions",
						},
					},
				],
			},
			{
				path: "/administrative-settings",
				name: "Administrative Settings",
				component: () => import(/* webpackChunkName: "TODO" */ "@/views/tmp"),
				meta: {
					breadcrumb: "Administrative Settings",
				},
			},
			{
				path: "/logs",
				name: "Logs",
				component: () => import(/* webpackChunkName: "TODO" */ "@/views/tmp"),
				meta: {
					breadcrumb: "Logs",
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
