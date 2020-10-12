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
			},
			{
				path: "/projects",
				name: "Projects",
				component: () => import(/* webpackChunkName: "Projects" */ "@/views/Projects"),
			},
			{
				path: "/project/:projectId",
				name: "Project",
				component: () => import(/* webpackChunkName: "Project" */ "@/views/Project"),
			},
			{
				path: "/beneficiaries",
				component: () => import(/* webpackChunkName: "Beneficiaries" */ "@/views/Beneficiaries"),
				children: [
					{
						path: "households",
						name: "Households",
						component: () => import(/* webpackChunkName: "BeneficiariesHouseholds" */ "@/views/Beneficiaries/Households"),
					},
					{
						path: "communities",
						name: "Communities",
						component: () => import(/* webpackChunkName: "BeneficiariesCommunities" */ "@/views/Beneficiaries/Communities"),
					},
					{
						path: "institutions",
						name: "Institutions",
						component: () => import(/* webpackChunkName: "BeneficiariesInstitutions" */ "@/views/Beneficiaries/Institutions"),
					},
				],
			},
			{
				path: "/reports",
				name: "Reports",
				component: () => import(/* webpackChunkName: "TODO" */ "@/views/tmp"),
			},
			{
				path: "/vouchers",
				name: "Vouchers",
				component: () => import(/* webpackChunkName: "TODO" */ "@/views/tmp"),
			},
			{
				path: "/configuration",
				name: "Configuration",
				component: () => import(/* webpackChunkName: "TODO" */ "@/views/tmp"),
			},
			{
				path: "/administrative-settings",
				name: "Administrative Settings",
				component: () => import(/* webpackChunkName: "TODO" */ "@/views/tmp"),
			},
			{
				path: "/logs",
				name: "Logs",
				component: () => import(/* webpackChunkName: "TODO" */ "@/views/tmp"),
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
