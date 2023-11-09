import { createRouter, createWebHistory } from "vue-router";
import { getCookie } from "@/utils/cookie";
// import i18n from "@/plugins/i18n";
// import CONST from "@/store/const";
import getters from "@/store/getters";
import store from "@/store/index";

let singleNotification = true;
const storedCountryCode = getters.getCountryFromVuexStorage()?.iso3
	|| getters.getCountriesFromVuexStorage()?.[0]?.iso3;

const routes = [
	{
		path: "/login",
		name: "Login",
		component: () => import(/* webpackChunkName: "Login" */ "@/views/Login"),
	},
	{
		path: "/logout",
		name: "Logout",
		beforeEnter: (to, from, next) => {
			store.dispatch("logoutUser");
			if (from.name !== "Login" && to.query?.notification === "login" && singleNotification) {
				// Notification(i18n.t("You need to login to continue"), "is-warning");
				singleNotification = false;
			}

			return next({ name: "Login", query: to.query });
		},
	},
	{
		path: "/",
		redirect: to => ({
			name: storedCountryCode ? "Login" : "Login",
			...(storedCountryCode && {
				params: {
					countryCode: storedCountryCode,
				},
			}),
		})
	},
	{
		path: "/:countryCode",
		component: () => import(/* webpackChunkName: "MainContainer" */ "@/layout/MainContainer"),
		beforeEnter: (to, from, next) => {
			// if (!to.params.countryCode) {
			// 	let countryCode = getters.getCountryFromVuexStorage()?.iso3;
			//
			// 	if (!countryCode) {
			// 		store.commit(CONST.STORE_COUNTRY, getters.getCountriesFromVuexStorage()[0]);
			// 		countryCode = getters.getCountriesFromVuexStorage()[0].iso3;
			// 	}
			//
			// 	return next({
			// 		...to,
			// 		params: {
			// 			...to.params,
			// 			countryCode,
			// 		},
			// 	});
			// }
			//
			// if (getters.getCountryFromVuexStorage().iso3 !== to.params.countryCode) {
			// 	const newCountry = getters.getCountriesFromVuexStorage()
			// 		.find((country) => country.iso3 === to.params.countryCode);
			//
			// 	if (!newCountry) {
			// 		return next({name: "NotFound"});
			// 	}
			//
			// 	store.commit(CONST.STORE_COUNTRY, newCountry);
			// }

			return next();
		},
	}
	// 	/* eslint-disable max-len */
	//  children: [
	//  	{
	//  		path: "/",
	//  		name: "Home",
	//  		component: () => import(/* webpackChunkName: "Home" */ "@/views/Home"),
	//  		meta: {
	//  			permissions: [],
	//  			breadcrumb: () => i18n.t("Home"),
	//  			description: i18n.t("This page is where you have a global view on some figures about the country and its projects. There is a map to show you the country's assistances and a summary of the last ones."),
	//  		},
	//  	},
	//  	{
	//  		path: "projects",
	//  		component: { render(c) { return c("router-view"); } },
	//  		children: [
	//  			{
	//  				path: "",
	//  				name: "Projects",
	//  				component: () => import(/* webpackChunkName: "Projects" */ "@/views/Projects"),
	//  				meta: {
	//  					permissions: [],
	//  					breadcrumb: () => i18n.t("Projects"),
	//  					description: i18n.t("This page is where you can see all the country's projects (only thoses that you have the right to see)."),
	//  				},
	//  			},
	//  			{
	//  				path: "add-project",
	//  				name: "AddProject",
	//  				component: () => import(/* webpackChunkName: "AddProject" */ "@/views/ProjectManager"),
	//  				meta: {
	//  					permissions: [],
	//  					breadcrumb: () => i18n.t("Add Project"),
	//  					description: i18n.t("This page is a form to add a new project to a humansis."),
	//  				},
	//  			},
	//  			{
	//  				path: "project-detail/:projectId",
	//  				name: "ProjectDetail",
	//  				component: () => import(/* webpackChunkName: "ProjectDetail" */ "@/views/ProjectManager"),
	//  				meta: {
	//  					permissions: [],
	//  					breadcrumb: () => i18n.t("Project detail"),
	//  					description: i18n.t("This page is a form to show detail of a project in humansis."),
	//  				},
	//  			},
	//  			{
	//  				path: "project-edit/:projectId",
	//  				name: "ProjectEdit",
	//  				component: () => import(/* webpackChunkName: "ProjectEdit" */ "@/views/ProjectManager"),
	//  				meta: {
	//  					permissions: [],
	//  					breadcrumb: () => i18n.t("Project detail"),
	//  					description: i18n.t("This page is a form to edit a project in humansis."),
	//  				},
	//  			},
	//  			{
	//  				path: "/:countryCode/project/:projectId",
	//  				component: { render(c) { return c("router-view"); } },
	//  				meta: {
	//  					breadcrumb: () => i18n.t("Project"),
	//  				},
	//  				children: [
	//  					{
	//  						path: "",
	//  						name: "Project",
	//  						component: () => import(/* webpackChunkName: "Project" */ "@/views/Project"),
	//  						meta: {
	//  							permissions: [],
	//  							description: i18n.t("This page is where you can see summary of project and there assistance. If you have the right, you can add a new assistance with the project's households, manage assistance and transactions."),
	//  						},
	//  					},
	//  					{
	//  						path: "assistance/:assistanceId",
	//  						name: "AssistanceEdit",
	//  						component: () => import(/* webpackChunkName: "AssistanceEdit" */ "@/views/AssistanceEdit"),
	//  						meta: {
	//  							breadcrumb: () => i18n.t("Edit Assistance"),
	//  							description: "",
	//  						},
	//  					},
	//  					{
	//  						path: "assistance/detail/:assistanceId",
	//  						name: "AssistanceDetail",
	//  						component: () => import(/* webpackChunkName: "AssistanceDetail" */ "@/views/AssistanceDetail"),
	//  						meta: {
	//  							breadcrumb: () => i18n.t("Assistance Detail"),
	//  							description: "",
	//  						},
	//  					},
	//  					{
	//  						path: "add-assistance",
	//  						name: "AddAssistance",
	//  						component: () => import(/* webpackChunkName: "AddAssistance" */ "@/views/AddAssistance"),
	//  						meta: {
	//  							permissions: ["addDistribution"],
	//  							breadcrumb: () => i18n.t("Add Assistance"),
	//  							description: i18n.t("This page is a form to add a new assistance to a project. You will use selection criteria to determine the households or beneficiaries who will take part in it and add a specific amount of commodities to be distributed."),
	//  							parent: "Assistance",
	//  						},
	//  					},
	//  				],
	//  			},
	//  		],
	//  	},
	//  	{
	//  		path: "imports",
	//  		component: { render(c) { return c("router-view"); } },
	//  		children: [
	//  			{
	//  				path: "",
	//  				name: "Imports",
	//  				component: () => import(/* webpackChunkName: "Imports" */ "@/views/Imports"),
	//  				meta: {
	//  					permissions: [],
	//  					breadcrumb: () => i18n.t("Imports"),
	//  					description: "",
	//  				},
	//  			},
	//  			{
	//  				path: "/:countryCode/import/:importId",
	//  				component: { render(c) { return c("router-view"); } },
	//  				meta: {
	//  					breadcrumb: () => i18n.t("Import"),
	//  				},
	//  				children: [
	//  					{
	//  						path: "",
	//  						name: "Import",
	//  						component: () => import(/* webpackChunkName: "Import" */ "@/views/Import"),
	//  						meta: {
	//  							permissions: [],
	//  							description: "",
	//  						},
	//  					},
	//  				],
	//  			},
	//  		],
	//  	},
	//  	{
	//  		path: "beneficiaries",
	//  		redirect: { name: "Households" },
	//  		component: { render(c) { return c("router-view"); } },
	//  		meta: {
	//  			breadcrumb: () => i18n.t("Beneficiaries"),
	//  		},
	//  		children: [
	//  			{
	//  				path: "households",
	//  				component: { render(c) { return c("router-view"); } },
	//  				meta: {
	//  					breadcrumb: () => i18n.t("Households"),
	//  					parent: "Beneficiaries",
	//  				},
	//  				children: [
	//  					{
	//  						path: "",
	//  						name: "Households",
	//  						component: () => import(/* webpackChunkName: "Households" */ "@/views/Beneficiaries/Households"),
	//  						meta: {
	//  							permissions: [],
	//  							description: i18n.t("This page is where ou can see all the households in the country. If you have the right, you can add new households with the '+' button, manage households and filter/research in the list."),
	//  						},
	//  					},
	//  					{
	//  						path: "add",
	//  						name: "AddHousehold",
	//  						component: () => import(/* webpackChunkName: "AddHousehold" */ "@/views/Beneficiaries/AddHousehold"),
	//  						meta: {
	//  							permissions: ["addBeneficiary"],
	//  							breadcrumb: () => i18n.t("Add Household"),
	//  							description: i18n.t("This page is a form to add a new household to the platform."),
	//  						},
	//  					},
	//  					{
	//  						path: "edit/:householdId",
	//  						name: "EditHousehold",
	//  						component: () => import(/* webpackChunkName: "EditHousehold" */ "@/views/Beneficiaries/EditHousehold"),
	//  						meta: {
	//  							permissions: ["viewBeneficiary", "editBeneficiary"],
	//  							breadcrumb: () => i18n.t("Edit Household"),
	//  							description: "",
	//  						},
	//  					},
	//  					{
	//  						path: "summary/:householdId",
	//  						name: "HouseholdInformationSummary",
	//  						component: () => import(/* webpackChunkName: "HouseholdInformationSummary" */ "@/views/Beneficiaries/HouseholdInformationSummary"),
	//  						meta: {
	//  							permissions: ["viewBeneficiary"],
	//  							breadcrumb: () => i18n.t("Household Information Summary"),
	//  							description: "",
	//  							parent: "Households",
	//  						},
	//  					},
	//  				],
	//  			},
	//  			{
	//  				path: "communities",
	//  				name: "Communities",
	//  				component: () => import(/* webpackChunkName: "Communities" */ "@/views/Beneficiaries/Communities"),
	//  				meta: {
	//  					permissions: [],
	//  					breadcrumb: () => i18n.t("Communities"),
	//  					description: "",
	//  				},
	//  			},
	//  			{
	//  				path: "institutions",
	//  				component: { render(c) { return c("router-view"); } },
	//  				meta: {
	//  					breadcrumb: () => i18n.t("Institutions"),
	//  					parent: "Beneficiaries",
	//  				},
	//  				children: [
	//  					{
	//  						path: "",
	//  						name: "Institutions",
	//  						component: () => import(/* webpackChunkName: "Institutions" */ "@/views/Beneficiaries/Institutions"),
	//  						meta: {
	//  							permissions: [],
	//  							breadcrumb: () => i18n.t("Institutions"),
	//  							description: "",
	//  						},
	//  					},
	//  					{
	//  						path: "add-institution",
	//  						name: "AddInstitution",
	//  						component: () => import(/* webpackChunkName: "AddInstitution" */ "@/views/Beneficiaries/InstitutionManager"),
	//  						meta: {
	//  							permissions: [],
	//  							breadcrumb: () => i18n.t("Add Institution"),
	//  							description: i18n.t("This page is a form to add a new institution to a humansis."),
	//  						},
	//  					},
	//  					{
	//  						path: "institution-detail/:institutionId",
	//  						name: "InstitutionDetail",
	//  						component: () => import(/* webpackChunkName: "InstitutionDetail" */ "@/views/Beneficiaries/InstitutionManager"),
	//  						meta: {
	//  							permissions: [],
	//  							breadcrumb: () => i18n.t("Institution Detail"),
	//  							description: i18n.t("This page is a form to show detail of a institution in humansis."),
	//  						},
	//  					},
	//  					{
	//  						path: "institution-edit/:institutionId",
	//  						name: "InstitutionEdit",
	//  						component: () => import(/* webpackChunkName: "InstitutionEdit" */ "@/views/Beneficiaries/InstitutionManager"),
	//  						meta: {
	//  							permissions: [],
	//  							breadcrumb: () => i18n.t("Institution edit"),
	//  							description: i18n.t("This page is a form to edit a institution in humansis."),
	//  						},
	//  					},
	//  				],
	//  			},
	//  			{
	//  				path: "vendors",
	//  				name: "Vendors",
	//  				component: () => import(/* webpackChunkName: "Vendors" */ "@/views/Beneficiaries/Vendors"),
	//  				meta: {
	//  					permissions: ["viewVendors"],
	//  					breadcrumb: () => i18n.t("Vendors"),
	//  					description: "",
	//  				},
	//  			},
	//  		],
	//  	},
	//  	{
	//  		path: "vouchers",
	//  		name: "Vouchers",
	//  		component: () => import(/* webpackChunkName: "Vouchers" */ "@/views/Vouchers"),
	//  		meta: {
	//  			permissions: ["viewVouchers"],
	//  			breadcrumb: () => i18n.t("Vouchers"),
	//  			description: i18n.t("This page is where you can create, edit, assign and print vouchers booklets"),
	//  		},
	//  	},
	//  	{
	//  		path: "country-settings",
	//  		name: "Country Settings",
	//  		component: { render(c) { return c("router-view"); } },
	//  		children: [
	//  			{
	//  				path: "products",
	//  				name: "Products",
	//  				component: () => import(/* webpackChunkName: "Products" */ "@/views/CountrySettings/Products"),
	//  				meta: {
	//  					permissions: ["viewProducts"],
	//  					breadcrumb: () => i18n.t("Products"),
	//  					description: i18n.t("This page is where you'll be able to add a new project, country specific, third party connection, product, vendor, edit and delete them according to your rights"),
	//  				},
	//  			},
	//  			{
	//  				path: "country-specifics",
	//  				name: "CountrySpecific",
	//  				component: () => import(/* webpackChunkName: "CountrySpecific" */ "@/views/CountrySettings/CountrySpecific"),
	//  				meta: {
	//  					breadcrumb: () => i18n.t("Country specifics"),
	//  					description: i18n.t("This page is where you'll be able to add a new project, country specific, third party connection, product, vendor, edit and delete them according to your rights"),
	//  				},
	//  			},
	//  		],
	//  	},
	//  	{
	//  		path: "administrative-settings",
	//  		name: "Administrative Settings",
	//  		component: () => import(/* webpackChunkName: "AdministrativeSetting" */ "@/views/AdministrativeSettings"),
	//  		meta: {
	//  			permissions: ["adminSettings"],
	//  			breadcrumb: () => i18n.t("Administrative Settings"),
	//  			description: i18n.t("This page is where you can manage users, donors and your organization's specifics"),
	//  		},
	//  	},
	//  	{
	//  		path: "transactions",
	//  		name: "Transactions",
	//  		component: { render(c) { return c("router-view"); } },
	//  		meta: {
	//  			permissions: [],
	//  			breadcrumb: () => i18n.t("Transactions"),
	//  			description: "",
	//  		},
	//  		children: [
	//  			{
	//  				path: "assistances",
	//  				name: "TransactionsAssistances",
	//  				component: () => import(/* webpackChunkName: "Products" */ "@/views/Transactions/Distributions"),
	//  				meta: {
	//  					permissions: [],
	//  					breadcrumb: () => i18n.t("Assistances"),
	//  					description: "",
	//  				},
	//  			},
	//  			{
	//  				path: "purchases",
	//  				name: "TransactionsPurchases",
	//  				component: () => import(/* webpackChunkName: "CountrySpecificOptions" */ "@/views/Transactions/SmartcardPurchasesItems"),
	//  				meta: {
	//  					permissions: [],
	//  					breadcrumb: () => i18n.t("Purchases"),
	//  					description: "",
	//  				},
	//  			},
	//  		],
	//  	},
	//  	{
	//  		path: "logs",
	//  		name: "Logs",
	//  		component: () => import(/* webpackChunkName: "Logs" */ "@/views/Logs"),
	//  		meta: {
	//  			permissions: [],
	//  			breadcrumb: () => i18n.t("Logs"),
	//  			description: "",
	//  		},
	//  	},
	//  	{
	//  		path: "profile",
	//  		name: "Profile",
	//  		component: () => import(/* webpackChunkName: "Profile" */ "@/views/Profile"),
	//  		meta: {
	//  			permissions: [],
	//  			breadcrumb: () => i18n.t("Profile"),
	//  			description: i18n.t("This page is where you can change your password"),
	//  		},
	//  	},
	//  ],
	// },
	// {
	// 	path: "/no-permission",
	// 	name: "NoPermission",
	// 	component: () => import(/* webpackChunkName: "Logs" */ "@/views/NoPermission"),
	// 	meta: {
	// 		permissions: [],
	// 		breadcrumb: () => i18n.t("No permission"),
	// 	},
	// },
	// {
	// 	path: "/not-found",
	// 	name: "NotFound",
	// 	component: () => import(/* webpackChunkName: "NotFound" */ "@/views/NotFound"),
	// },
	// {
	// 	path: "/*",
	// 	component: () => import(/* webpackChunkName: "NotFound" */ "@/views/NotFound"),
	// },
	/* eslint-enable max-len */
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

router.beforeEach((to, from, next) => {
	window.document.title = to.meta && to.meta.breadcrumb
		? `${to.meta.breadcrumb()} | Humansis` : "Humansis";

	const token = getCookie("token");

	if (to.name === "Login" && token) {
		return next({ name: "Home" });
	}

	if (to.name !== "Login" && to.name !== "Logout") {
		if (!token) {
			return next({ name: "Login", query: { redirect: to.query.redirect || to.fullPath } });
		}

		const storedPermissions = getters.getPermissionsFromVuexStorage();
		const { permissions } = to.meta;
		const canGoNext = permissions?.length
			? permissions.some((permission) => storedPermissions?.[permission])
			: true;

		if (!canGoNext) {
			return next({ name: "NoPermission" });
		}
	}

	return next();
});

router.onError((error) => {
	if (/Loading chunk [^\s]+ failed./i.test(error.message)) {
		window.location.reload();
	}
});

export default router;
