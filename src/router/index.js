import { createRouter, createWebHistory, RouterView } from "vue-router";
import { getCookie } from "@/utils/cookie";
import { isUserPermissionGranted } from "@/utils/permissions";
import { Notification } from "@/utils/UI";
import { PERMISSIONS, ROLE } from "@/consts";
import i18n from "@/plugins/i18n";
import CONST from "@/store/const";
import getters from "@/store/getters";
import store from "@/store/index";

let singleNotification = true;

const { global: { t } } = i18n;

/* eslint-disable vue/max-len */
const routes = [
	{
		path: "/login",
		name: "Login",
		component: () => import(/* webpackChunkName: "Login" */ "@/views/Login"),
	},
	{
		path: "/account-created",
		name: "AccountCreated",
		component: () => import(/* webpackChunkName: "AccountCreated" */ "@/views/AccountCreated"),
		meta: {
			permissions: [],
			breadcrumb: "Account created",
		},
	},
	{
		path: "/logout",
		name: "Logout",
		beforeEnter: (to, from, next) => {
			store.dispatch("logoutUser");
			if (from.name !== "Login" && to.query?.notification === "login" && singleNotification) {
				Notification(t("You need to login to continue"), "warning");
				singleNotification = false;
			}

			return next({ name: "Login", query: to.query });
		},
	},
	{
		path: "/no-permission",
		name: "NoPermission",
		component: () => import(/* webpackChunkName: "NoPermission" */ "@/views/NoPermission"),
	},
	{
		path: "/not-found",
		name: "NotFound",
		component: () => import(/* webpackChunkName: "NotFound" */ "@/views/NotFound"),
	},
	{
		path: "/",
		name: "Dashboard",
		redirect: () => {
			const storedCountryCode = getters.getCountryFromVuexStorage()?.iso3
				|| getters.getCountriesFromVuexStorage()?.[0]?.iso3;

			return {
				name: storedCountryCode ? "Projects" : "Login",
				...(storedCountryCode && {
					params: {
						countryCode: storedCountryCode,
					},
				}),
			};
		},
	},
	{
		path: "/:countryCode",
		component: () => import("@/layout/MainContainer"),
		beforeEnter: (to, from, next) => {
			if (!to.params.countryCode) {
				let countryCode = getters.getCountryFromVuexStorage()?.iso3;

				if (!countryCode) {
					store.commit(CONST.STORE_COUNTRY, getters.getCountriesFromVuexStorage()[0]);
					countryCode = getters.getCountriesFromVuexStorage()[0].iso3;
				}

				return next({
					...to,
					params: {
						...to.params,
						countryCode,
					},
				});
			}

			if (getters.getCountryFromVuexStorage().iso3 !== to.params.countryCode) {
				const newCountry = getters.getCountriesFromVuexStorage()
					.find((country) => country.iso3 === to.params.countryCode);

				if (!newCountry) {
					return next({ name: "NotFound" });
				}

				store.commit(CONST.STORE_COUNTRY, newCountry);
			}

			return next();
		},
		children: [
			{
				path: "",
				name: "Home",
				component: () => import(/* webpackChunkName: "Home" */ "@/views/Home"),
				meta: {
					requiredPermissions: [PERMISSIONS.HOME_PAGE],
					breadcrumb: "Home",
					description: "This page is where you have a global view on some figures about the country and its projects. There is a map to show you the country's assistances and a summary of the last ones.",
				},
			},
			{
				path: "projects",
				component: RouterView,
				meta: {
					breadcrumb: "Projects",
				},
				children: [
					{
						path: "",
						name: "Projects",
						component: () => import("@/views/Projects/Projects"),
						meta: {
							requiredPermissions: [PERMISSIONS.PROJECT_MANAGEMENT],
							description: "This page is where you can see all the country`s projects (only thoses that you have the right to see).",
						},
					},
					{
						path: "add-project",
						name: "AddProject",
						component: () => import(/* webpackChunkName: "AddProject" */ "@/views/Projects/ProjectManager"),
						meta: {
							requiredPermissions: [PERMISSIONS.PROJECT_MANAGEMENT_MANAGE],
							breadcrumb: "Add Project",
							description: "This page is a form to add a new project to a humansis.",
						},
					},
					{
						path: "project-detail/:projectId",
						name: "ProjectDetail",
						component: () => import(/* webpackChunkName: "ProjectDetail" */ "@/views/Projects/ProjectManager"),
						meta: {
							requiredPermissions: [PERMISSIONS.PROJECT_MANAGEMENT],
							breadcrumb: "Project detail",
							description: "This page is a form to show detail of a project in humansis.",
						},
					},
					{
						path: "project-edit/:projectId",
						name: "ProjectEdit",
						component: () => import(/* webpackChunkName: "ProjectEdit" */ "@/views/Projects/ProjectManager"),
						meta: {
							requiredPermissions: [PERMISSIONS.PROJECT_MANAGEMENT_MANAGE],
							breadcrumb: "Project detail",
							description: "This page is a form to edit a project in humansis.",
						},
					},
					{
						path: "/:countryCode/project/:projectId",
						component: RouterView,
						meta: {
							breadcrumb: "Project",
						},
						children: [
							{
								path: "",
								name: "Project",
								component: () => import(/* webpackChunkName: "Project" */ "@/views/Projects/Project"),
								meta: {
									requiredPermissions: [PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT],
									description: "This page is where you can see summary of project and there assistance. If you have the right, you can add a new assistance with the project's households, manage assistance and transactions.",
								},
							},
							{
								path: "assistance/:assistanceId",
								name: "AssistanceEdit",
								component: () => import(/* webpackChunkName: "AssistanceEdit" */ "@/views/Assistance/AssistanceEdit"),
								meta: {
									breadcrumb: "Edit Assistance",
									description: "",
								},
							},
							{
								path: "add-assistance",
								name: "AddAssistance",
								component: () => import(/* webpackChunkName: "AddAssistance" */ "@/views/Assistance/AddAssistance"),
								meta: {
									permissions: ["addDistribution"],
									breadcrumb: "Add Assistance",
									description: "This page is a form to add a new assistance to a project. You will use selection criteria to determine the households or beneficiaries who will take part in it and add a specific amount of commodities to be distributed.",
									parent: "Assistance",
								},
							},
							{
								path: "assistance/detail/:assistanceId",
								name: "AssistanceDetail",
								component: () => import(/* webpackChunkName: "AssistanceDetail" */ "@/views/Assistance/AssistanceDetail"),
								meta: {
									breadcrumb: "Assistance Detail",
									description: "",
								},
							},
							{
								path: "assistance/assistance-creation-progress/:assistanceId",
								name: "AssistanceCreationProgress",
								component: () => import(/* webpackChunkName: "AssistanceDetail" */ "@/views/Assistance/AssistanceCreationProgress"),
								meta: {
									breadcrumb: "Assistance Creation Progress",
									description: "This page shows the progress of creating the specific assistance.",
								},
							},
						],
					},
				],
			},
			{
				path: "imports",
				component: RouterView,
				meta: {
					permissions: [],
					breadcrumb: "Imports",
				},
				children: [
					{
						path: "",
						name: "Imports",
						component: () => import(/* webpackChunkName: "Imports" */ "@/views/Imports"),
						meta: {
							requiredPermissions: [PERMISSIONS.IMPORT],
						},
					},
					{
						path: "/:countryCode/import/:importId",
						component: RouterView,
						children: [
							{
								path: "",
								name: "Import",
								component: () => import(/* webpackChunkName: "Import" */ "@/views/Import"),
								meta: {
									description: "",
								},
							},
						],
					},
				],
			},
			{
				path: "beneficiaries",
				redirect: { name: "Households" },
				component: RouterView,
				meta: {
					breadcrumb: "Beneficiaries",
				},
				children: [
					{
						path: "households",
						component: RouterView,
						meta: {
							requiredPermissions: [PERMISSIONS.HOUSEHOLD],
							breadcrumb: "Households",
						},
						children: [
							{
								path: "",
								name: "Households",
								component: () => import(/* webpackChunkName: "Households" */ "@/views/Beneficiaries/Households"),
								meta: {
									requiredPermissions: [PERMISSIONS.HOUSEHOLD],
									description: "This page is where you can see all the households in the country. If you have the right, you can add new households with the '+' button, manage households and filter/research in the list.",
								},
							},
							{
								path: "add",
								name: "AddHousehold",
								component: () => import(/* webpackChunkName: "AddHousehold" */ "@/views/Beneficiaries/AddHousehold"),
								meta: {
									requiredPermissions: [PERMISSIONS.HOUSEHOLD_CREATE],
									breadcrumb: "Add Household",
									description: "This page is a form to add a new household to the platform.",
								},
							},
							{
								path: "edit/:householdId",
								name: "EditHousehold",
								component: () => import(/* webpackChunkName: "EditHousehold" */ "@/views/Beneficiaries/EditHousehold"),
								meta: {
									requiredPermissions: [PERMISSIONS.HOUSEHOLD_EDIT],
									breadcrumb: "Edit Household",
								},
							},
							{
								path: "summary/:householdId",
								name: "HouseholdInformationSummary",
								component: () => import(/* webpackChunkName: "HouseholdInformationSummary" */ "@/views/Beneficiaries/HouseholdInformationSummary"),
								meta: {
									requiredPermissions: [PERMISSIONS.HOUSEHOLD_VIEW],
									breadcrumb: "Household Information Summary",
								},
							},
						],
					},
				],
			},
			{
				path: "institutions",
				component: RouterView,
				meta: {
					breadcrumb: "Institutions",
				},
				children: [
					{
						path: "",
						name: "Institutions",
						component: () => import(/* webpackChunkName: "Institutions" */ "@/views/Beneficiaries/Institutions"),
						meta: {
							requiredPermissions: [PERMISSIONS.INSTITUTION],
							description: "",
						},
					},
					{
						path: "add-institution",
						name: "AddInstitution",
						component: () => import(/* webpackChunkName: "AddInstitution" */ "@/views/Beneficiaries/InstitutionManager"),
						meta: {
							requiredPermissions: [PERMISSIONS.INSTITUTION_CREATE],
							breadcrumb: "Add Institution",
							description: "This page is a form to add a new institution to a humansis.",
						},
					},
					{
						path: "institution-detail/:institutionId",
						name: "InstitutionDetail",
						component: () => import(/* webpackChunkName: "InstitutionDetail" */ "@/views/Beneficiaries/InstitutionManager"),
						meta: {
							requiredPermissions: [PERMISSIONS.INSTITUTION],
							breadcrumb: "Institution Detail",
							description: "This page is a form to show detail of a institution in humansis.",
						},
					},
					{
						path: "institution-edit/:institutionId",
						name: "InstitutionEdit",
						component: () => import(/* webpackChunkName: "InstitutionEdit" */ "@/views/Beneficiaries/InstitutionManager"),
						meta: {
							requiredPermissions: [PERMISSIONS.INSTITUTION_EDIT],
							breadcrumb: "Institution edit",
							description: "This page is a form to edit a institution in humansis.",
						},
					},
				],
			},
			{
				path: "vendors",
				name: "Vendors",
				component: () => import(/* webpackChunkName: "Vendors" */ "@/views/Beneficiaries/Vendors"),
				meta: {
					requiredPermissions: [PERMISSIONS.VENDOR],
					breadcrumb: "Vendors",
					description: "",
				},
			},
			{
				path: "vouchers",
				name: "Vouchers",
				component: () => import(/* webpackChunkName: "Vouchers" */ "@/views/Vouchers"),
				meta: {
					requiredPermissions: [PERMISSIONS.VOUCHERS],
					breadcrumb: "Vouchers",
					description: "This page is where you can create, edit, assign and print vouchers booklets",
				},
			},
			{
				path: "country-settings",
				name: "Country Settings",
				component: RouterView,
				children: [
					{
						path: "products",
						name: "Products",
						component: () => import(/* webpackChunkName: "Products" */ "@/views/CountrySettings/Products"),
						meta: {
							permissions: ["viewProducts"],
							breadcrumb: "Products",
							description: "This page is where you'll be able to add a new project, country specific, third party connection, product, vendor, edit and delete them according to your rights.",
						},
					},
					{
						path: "country-specifics",
						name: "CountrySpecific",
						component: () => import(/* webpackChunkName: "CountrySpecific" */ "@/views/CountrySettings/CountrySpecific"),
						meta: {
							breadcrumb: "Country specifics",
							description: "This page is where you'll be able to add a new project, country specific, third party connection, product, vendor, edit and delete them according to your rights.",
						},
					},
				],
			},
			{
				path: "administrative-settings",
				name: "Administrative Settings",
				component: () => import(/* webpackChunkName: "AdministrativeSetting" */ "@/views/AdministrativeSettings"),
				meta: {
					permissions: ["adminSettings"],
					breadcrumb: "Administrative Settings",
					description: "This page is where you can manage users, donors and your organization's specifics",
				},
			},
			{
				path: "transactions",
				name: "Transactions",
				component: RouterView,
				meta: {
					permissions: [],
					description: "",
				},
				children: [
					{
						path: "assistances",
						name: "TransactionsAssistances",
						component: () => import(/* webpackChunkName: "Products" */ "@/views/Transactions/Distributions"),
						meta: {
							permissions: [],
							breadcrumb: "Assistances",
							description: "",
						},
					},
					{
						path: "purchases",
						name: "TransactionsPurchases",
						component: () => import(/* webpackChunkName: "CountrySpecificOptions" */ "@/views/Transactions/SmartcardPurchasesItems"),
						meta: {
							permissions: [],
							breadcrumb: "Purchases",
							description: "",
						},
					},
				],
			},
			{
				path: "profile",
				name: "Profile",
				component: () => import(/* webpackChunkName: "Profile" */ "@/views/Profile"),
				meta: {
					permissions: [],
					breadcrumb: "Profile",
					description: "This page is where you can change your password",
				},
			},
		],
	},
	{
		path: "/:pathMatch(.*)*",
		redirect: { name: "NotFound" },
	},
	/* eslint-enable max-len */
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

router.beforeEach((to, from, next) => {
	const user = getters.getUserFromVuexStorage();

	window.document.title = to.meta && to.meta.breadcrumb
		? `${to.meta.breadcrumb} | Humansis` : "Humansis";

	const token = getCookie("token");

	if (to.name === "Login" && token) {
		return next({ name: "Home" });
	}

	if (to.name !== "Login" && to.name !== "Logout") {
		if (!token) {
			return next({ name: "Login", query: { redirect: to.query.redirect || to.fullPath } });
		}

		const { requiredPermissions } = to.meta;

		if (user?.roles[0] === ROLE.GUEST && to.name !== "AccountCreated") {
			return next({ name: "AccountCreated" });
		}

		if (to.name !== "NoPermission" && to.name !== "NotFound") {
			store.dispatch("showSideMenu", true);
		} else {
			store.dispatch("showSideMenu", false);
		}

		if (!!requiredPermissions && !isUserPermissionGranted(requiredPermissions)) {
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
