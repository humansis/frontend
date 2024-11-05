import { createRouter, createWebHistory, RouterView } from "vue-router";
import { getCookie } from "@/utils/cookie";
import { isUserPermissionGranted } from "@/utils/permissions";
import { Notification } from "@/utils/UI";
import { PERMISSIONS, ROLE, ROUTER } from "@/consts";
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
		name: ROUTER.ROUTE_NAME.LOGIN,
		component: () => import(/* webpackChunkName: "Login" */ "@/views/Login"),
	},
	{
		path: "/account-created",
		name: ROUTER.ROUTE_NAME.ACCOUNT_CREATED,
		component: () => import(/* webpackChunkName: "AccountCreated" */ "@/views/AccountCreated"),
		meta: {
			permissions: [],
			breadcrumb: "Account created",
		},
	},
	{
		path: "/logout",
		name: ROUTER.ROUTE_NAME.LOGOUT,
		beforeEnter: (to, from, next) => {
			store.dispatch("logoutUser");

			if (from.name !== ROUTER.ROUTE_NAME.LOGIN && to.query?.notification === "login" && singleNotification) {
				Notification(t("You need to login to continue"), "warning");
				singleNotification = false;
			}

			return next({ name: ROUTER.ROUTE_NAME.LOGIN, query: to.query });
		},
	},
	{
		path: "/no-permission",
		name: ROUTER.ROUTE_NAME.NO_PERMISSION,
		component: () => import(/* webpackChunkName: "NoPermission" */ "@/views/NoPermission"),
	},
	{
		path: "/no-country-assigned",
		name: ROUTER.ROUTE_NAME.NO_COUNTRY_ASSIGNED,
		component: () => import(/* webpackChunkName: "NoPermission" */ "@/views/NoCountryAssigned"),
	},
	{
		path: "/not-found",
		name: ROUTER.ROUTE_NAME.NOT_FOUND,
		component: () => import(/* webpackChunkName: "NotFound" */ "@/views/NotFound"),
	},
	{
		path: "/",
		name: ROUTER.ROUTE_NAME.ROOT,
		redirect: () => {
			const storedCountryCode = getters.getCountryFromVuexStorage()?.iso3
				|| getters.getCountriesFromVuexStorage()?.[0]?.iso3;

			return {
				name: storedCountryCode
					? ROUTER.ROUTE_NAME.PROJECTS.ROOT
					: ROUTER.ROUTE_NAME.LOGIN,
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
					return next({ name: ROUTER.ROUTE_NAME.NOT_FOUND });
				}

				store.commit(CONST.STORE_COUNTRY, newCountry);
			}

			return next();
		},
		children: [
			{
				path: "",
				name: ROUTER.ROUTE_NAME.HOME,
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
						name: ROUTER.ROUTE_NAME.PROJECTS.ROOT,
						component: () => import("@/views/Projects/Projects"),
						meta: {
							requiredPermissions: [PERMISSIONS.PROJECT_MANAGEMENT],
							description: "This page is where you can see all the country`s projects (only thoses that you have the right to see).",
						},
					},
					{
						path: "add-project",
						name: ROUTER.ROUTE_NAME.PROJECTS.ADD,
						component: () => import(/* webpackChunkName: "AddProject" */ "@/views/Projects/ProjectManager"),
						meta: {
							requiredPermissions: [PERMISSIONS.PROJECT_MANAGEMENT_MANAGE],
							breadcrumb: "Add Project",
							description: "This page is a form to add a new project to a humansis.",
						},
					},
					{
						path: "project-detail/:projectId",
						name: ROUTER.ROUTE_NAME.PROJECTS.DETAIL,
						component: () => import(/* webpackChunkName: "ProjectDetail" */ "@/views/Projects/ProjectManager"),
						meta: {
							requiredPermissions: [PERMISSIONS.PROJECT_MANAGEMENT],
							breadcrumb: "Project detail",
							description: "This page is a form to show detail of a project in humansis.",
						},
					},
					{
						path: "project-edit/:projectId",
						name: ROUTER.ROUTE_NAME.PROJECTS.EDIT,
						component: () => import(/* webpackChunkName: "ProjectEdit" */ "@/views/Projects/ProjectManager"),
						meta: {
							requiredPermissions: [PERMISSIONS.PROJECT_MANAGEMENT_MANAGE],
							breadcrumb: "Project edit",
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
								name: ROUTER.ROUTE_NAME.ASSISTANCES.ROOT,
								component: () => import(/* webpackChunkName: "Project" */ "@/views/Projects/Project"),
								meta: {
									requiredPermissions: [PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT],
									description: "This page is where you can see summary of project and there assistance. If you have the right, you can add a new assistance with the project's households, manage assistance and transactions.",
								},
							},
							{
								path: "assistance/:assistanceId",
								name: ROUTER.ROUTE_NAME.ASSISTANCES.EDIT,
								component: () => import(/* webpackChunkName: "AssistanceEdit" */ "@/views/Assistance/AssistanceEdit"),
								meta: {
									requiredPermissions: [PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT_UPDATE],
									breadcrumb: "Edit Assistance",
									description: "",
								},
							},
							{
								path: "add-assistance",
								name: ROUTER.ROUTE_NAME.ASSISTANCES.ADD,
								component: () => import(/* webpackChunkName: "AddAssistance" */ "@/views/Assistance/AddAssistance"),
								meta: {
									requiredPermissions: [PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT_MANIPULATION],
									breadcrumb: "Add Assistance",
									description: "This page is a form to add a new assistance to a project. You will use selection criteria to determine the households or beneficiaries who will take part in it and add a specific amount of commodities to be distributed.",
									parent: "Assistance",
								},
							},
							{
								path: "assistance/detail/:assistanceId",
								name: ROUTER.ROUTE_NAME.ASSISTANCES.DETAIL,
								component: () => import(/* webpackChunkName: "AssistanceDetail" */ "@/views/Assistance/AssistanceDetail"),
								meta: {
									requiredPermissions: [PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT_UPDATE],
									breadcrumb: "Assistance Detail",
									description: "",
								},
							},
							{
								path: "assistance/assistance-creation-progress/:assistanceId",
								name: ROUTER.ROUTE_NAME.ASSISTANCES.CREATION_PROGRESS,
								component: () => import(/* webpackChunkName: "AssistanceDetail" */ "@/views/Assistance/AssistanceCreationProgress"),
								meta: {
									requiredPermissions: [PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT_UPDATE],
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
						name: ROUTER.ROUTE_NAME.IMPORTS.ROOT,
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
								name: ROUTER.ROUTE_NAME.IMPORTS.NEW,
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
				redirect: { name: ROUTER.ROUTE_NAME.HOUSEHOLDS.ROOT },
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
								name: ROUTER.ROUTE_NAME.HOUSEHOLDS.ROOT,
								component: () => import(/* webpackChunkName: "Households" */ "@/views/Beneficiaries/Households"),
								meta: {
									requiredPermissions: [PERMISSIONS.HOUSEHOLD],
									description: "This page is where you can see all the households in the country. If you have the right, you can add new households with the '+' button, manage households and filter/research in the list.",
								},
							},
							{
								path: "add",
								name: ROUTER.ROUTE_NAME.HOUSEHOLDS.ADD,
								component: () => import(/* webpackChunkName: "AddHousehold" */ "@/views/Beneficiaries/AddHousehold"),
								meta: {
									requiredPermissions: [PERMISSIONS.HOUSEHOLD_CREATE],
									breadcrumb: "Add Household",
									description: "This page is a form to add a new household to the platform.",
								},
							},
							{
								path: "edit/:householdId",
								name: ROUTER.ROUTE_NAME.HOUSEHOLDS.EDIT,
								component: () => import(/* webpackChunkName: "EditHousehold" */ "@/views/Beneficiaries/EditHousehold"),
								meta: {
									requiredPermissions: [PERMISSIONS.HOUSEHOLD_EDIT],
									breadcrumb: "Edit Household",
								},
							},
							{
								path: "summary/:householdId",
								name: ROUTER.ROUTE_NAME.HOUSEHOLD_INFORMATION_SUMMARY,
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
						name: ROUTER.ROUTE_NAME.INSTITUTIONS.ROOT,
						component: () => import(/* webpackChunkName: "Institutions" */ "@/views/Beneficiaries/Institutions"),
						meta: {
							requiredPermissions: [PERMISSIONS.INSTITUTION],
							description: "",
						},
					},
					{
						path: "add-institution",
						name: ROUTER.ROUTE_NAME.INSTITUTIONS.ADD,
						component: () => import(/* webpackChunkName: "AddInstitution" */ "@/views/Beneficiaries/InstitutionManager"),
						meta: {
							requiredPermissions: [PERMISSIONS.INSTITUTION_CREATE],
							breadcrumb: "Add Institution",
							description: "This page is a form to add a new institution to a humansis.",
						},
					},
					{
						path: "institution-detail/:institutionId",
						name: ROUTER.ROUTE_NAME.INSTITUTIONS.DETAIL,
						component: () => import(/* webpackChunkName: "InstitutionDetail" */ "@/views/Beneficiaries/InstitutionManager"),
						meta: {
							requiredPermissions: [PERMISSIONS.INSTITUTION],
							breadcrumb: "Institution Detail",
							description: "This page is a form to show detail of a institution in humansis.",
						},
					},
					{
						path: "institution-edit/:institutionId",
						name: ROUTER.ROUTE_NAME.INSTITUTIONS.EDIT,
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
				name: ROUTER.ROUTE_NAME.VENDORS,
				component: () => import(/* webpackChunkName: "Vendors" */ "@/views/Beneficiaries/Vendors"),
				meta: {
					requiredPermissions: [PERMISSIONS.VENDOR],
					breadcrumb: "Vendors",
					description: "",
				},
			},
			{
				path: "vouchers",
				name: ROUTER.ROUTE_NAME.VOUCHERS,
				component: () => import(/* webpackChunkName: "Vouchers" */ "@/views/Vouchers"),
				meta: {
					requiredPermissions: [PERMISSIONS.VOUCHERS],
					breadcrumb: "Vouchers",
					description: "This page is where you can create, edit, assign and print vouchers booklets",
				},
			},
			{
				path: "country-settings",
				name: ROUTER.ROUTE_NAME.COUNTRY_SETTINGS,
				component: RouterView,
				children: [
					{
						path: "products",
						name: ROUTER.ROUTE_NAME.PRODUCTS,
						component: () => import(/* webpackChunkName: "Products" */ "@/views/CountrySettings/Products"),
						meta: {
							breadcrumb: "Products",
							description: "This page is where you'll be able to add a new project, country specific, third party connection, product, vendor, edit and delete them according to your rights.",
						},
					},
					{
						path: "country-specifics",
						name: ROUTER.ROUTE_NAME.COUNTRY_SPECIFICS,
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
				name: ROUTER.ROUTE_NAME.ADMINISTRATIVE_SETTINGS,
				component: RouterView,
				meta: {
					breadcrumb: "Administrative Settings",
				},
				redirect: () => {
					if (isUserPermissionGranted(PERMISSIONS.ADMINISTRATIVE_SETTING_USER)) {
						return { name: ROUTER.ROUTE_NAME.USERS.ROOT };
					}

					if (isUserPermissionGranted(PERMISSIONS.ADMINISTRATIVE_SETTING_DONOR)) {
						return { name: ROUTER.ROUTE_NAME.DONORS };
					}

					if (isUserPermissionGranted(PERMISSIONS.ADMINISTRATIVE_SETTING_ORGANIZATION)) {
						return { name: ROUTER.ROUTE_NAME.MY_ORGANIZATIONS };
					}

					if (isUserPermissionGranted(PERMISSIONS.ADMINISTRATIVE_SETTING_ORGANIZATION_SERVICES)) {
						return { name: ROUTER.ROUTE_NAME.ORGANIZATION_SERVICES };
					}

					if (isUserPermissionGranted(PERMISSIONS.ADMINISTRATIVE_SETTING_ROLE_MANAGEMENT)) {
						return { name: ROUTER.ROUTE_NAME.ROLES.ROOT };
					}

					return { name: ROUTER.ROUTE_NAME.SYNC };
				},
				children: [
					{
						path: "users",
						component: RouterView,
						children: [
							{
								path: "",
								name: ROUTER.ROUTE_NAME.USERS.ROOT,
								component: () => import(/* webpackChunkName: "Institutions" */ "@/views/AdministrativeSettings/Users/Users"),
								meta: {
									requiredPermissions: [PERMISSIONS.ADMINISTRATIVE_SETTING_USER],
									breadcrumb: "Users",
									description: "This page is where you can manage users.",
								},
							},
							{
								path: "add-user",
								name: ROUTER.ROUTE_NAME.USERS.ADD,
								component: () => import(/* webpackChunkName: "Institutions" */ "@/views/AdministrativeSettings/Users/UserManager"),
								meta: {
									requiredPermissions: [PERMISSIONS.ADMINISTRATIVE_SETTING_USER_CREATE],
									breadcrumb: "Add user",
									description: "This page is a form to add a new user to a humansis.",
								},
							},
							{
								path: "user-detail/:userId",
								name: ROUTER.ROUTE_NAME.USERS.DETAIL,
								component: () => import(/* webpackChunkName: "Institutions" */ "@/views/AdministrativeSettings/Users/UserManager"),
								meta: {
									requiredPermissions: [PERMISSIONS.ADMINISTRATIVE_SETTING_USER],
									breadcrumb: "User detail",
									description: "This page is a form to show detail of a user in humansis.",
								},
							},
							{
								path: "user-edit/:userId",
								name: ROUTER.ROUTE_NAME.USERS.EDIT,
								component: () => import(/* webpackChunkName: "Institutions" */ "@/views/AdministrativeSettings/Users/UserManager"),
								meta: {
									requiredPermissions: [PERMISSIONS.ADMINISTRATIVE_SETTING_USER_CREATE],
									breadcrumb: "User edit",
									description: "This page is a form to edit a user in humansis.",
								},
							},
						],
					},
					{
						path: "donors",
						name: ROUTER.ROUTE_NAME.DONORS,
						component: () => import(/* webpackChunkName: "AdministrativeSetting" */ "@/views/AdministrativeSettings/Donors"),
						meta: {
							requiredPermissions: [PERMISSIONS.ADMINISTRATIVE_SETTING_DONOR],
							breadcrumb: "Donors",
							description: "This page is where you can manage donors.",
						},
					},
					{
						path: "my-organizations",
						name: ROUTER.ROUTE_NAME.MY_ORGANIZATIONS,
						component: () => import(/* webpackChunkName: "AdministrativeSetting" */ "@/views/AdministrativeSettings/MyOrganizations"),
						meta: {
							requiredPermissions: [PERMISSIONS.ADMINISTRATIVE_SETTING_ORGANIZATION],
							breadcrumb: "My Organizations",
							description: "This page is where you can manage my organizations.",
						},
					},
					{
						path: "organization-services",
						name: ROUTER.ROUTE_NAME.ORGANIZATION_SERVICES,
						component: () => import(/* webpackChunkName: "AdministrativeSetting" */ "@/views/AdministrativeSettings/OrganizationServices"),
						meta: {
							requiredPermissions: [PERMISSIONS.ADMINISTRATIVE_SETTING_ORGANIZATION_SERVICES],
							breadcrumb: "Organization Services",
							description: "This page is where you can manage organizations services.",
						},
					},
					{
						path: "sync",
						name: ROUTER.ROUTE_NAME.SYNC,
						component: () => import(/* webpackChunkName: "AdministrativeSetting" */ "@/views/AdministrativeSettings/Sync"),
						meta: {
							requiredPermissions: [PERMISSIONS.ADMINISTRATIVE_SETTING_SYNC],
							breadcrumb: "Sync",
							description: "This page is where you can manage sync.",
						},
					},
					{
						path: "roles",
						component: RouterView,
						children: [
							{
								path: "",
								name: ROUTER.ROUTE_NAME.ROLES.ROOT,
								component: () => import(/* webpackChunkName: "Institutions" */ "@/views/AdministrativeSettings/Roles/Roles"),
								meta: {
									requiredPermissions: [PERMISSIONS.ADMINISTRATIVE_SETTING_ROLE_MANAGEMENT],
									breadcrumb: "Roles",
									description: "This page is where you can manage roles.",
								},
							},
							{
								path: "add-role",
								name: ROUTER.ROUTE_NAME.ROLES.ADD,
								component: () => import(/* webpackChunkName: "Institutions" */ "@/views/AdministrativeSettings/Roles/RolesManager"),
								meta: {
									requiredPermissions: [PERMISSIONS.ADMINISTRATIVE_SETTING_ROLE_MANAGEMENT],
									breadcrumb: "Add role",
									description: "This page is a form to add a new role to a humansis.",
								},
							},
							{
								path: "role-detail/:roleId",
								name: ROUTER.ROUTE_NAME.ROLES.DETAIL,
								component: () => import(/* webpackChunkName: "Institutions" */ "@/views/AdministrativeSettings/Roles/RolesManager"),
								meta: {
									requiredPermissions: [PERMISSIONS.ADMINISTRATIVE_SETTING_ROLE_MANAGEMENT],
									breadcrumb: "Role detail",
									description: "This page is a form to show detail of a role in humansis.",
								},
							},
							{
								path: "role-edit/:roleId",
								name: ROUTER.ROUTE_NAME.ROLES.EDIT,
								component: () => import(/* webpackChunkName: "Institutions" */ "@/views/AdministrativeSettings/Roles/RolesManager"),
								meta: {
									requiredPermissions: [PERMISSIONS.ADMINISTRATIVE_SETTING_ROLE_MANAGEMENT],
									breadcrumb: "Role edit",
									description: "This page is a form to edit a role in humansis.",
								},
							},
						],
					},
				],
			},
			{
				path: "transactions",
				name: ROUTER.ROUTE_NAME.TRANSACTIONS.ROOT,
				component: RouterView,
				redirect: { name: ROUTER.ROUTE_NAME.TRANSACTIONS.ASSISTANCES },
				meta: {
					description: "",
				},
				children: [
					{
						path: "assistances",
						name: ROUTER.ROUTE_NAME.TRANSACTIONS.ASSISTANCES,
						component: () => import(/* webpackChunkName: "Products" */ "@/views/Transactions/Distributions"),
						meta: {
							requiredPermissions: [PERMISSIONS.TRANSACTIONS],
							breadcrumb: "Assistances",
							description: "",
						},
					},
					{
						path: "purchases",
						name: ROUTER.ROUTE_NAME.TRANSACTIONS.PURCHASES,
						component: () => import(/* webpackChunkName: "CountrySpecificOptions" */ "@/views/Transactions/SmartcardPurchasesItems"),
						meta: {
							requiredPermissions: [PERMISSIONS.TRANSACTIONS],
							breadcrumb: "Purchases",
							description: "",
						},
					},
				],
			},
			{
				path: "profile",
				name: ROUTER.ROUTE_NAME.PROFILE,
				component: () => import(/* webpackChunkName: "Profile" */ "@/views/Profile"),
				meta: {
					breadcrumb: "Profile",
					description: "This page is where you can change your password",
				},
			},
		],
	},
	{
		path: "/:pathMatch(.*)*",
		redirect: { name: ROUTER.ROUTE_NAME.NOT_FOUND },
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

	if (to.name === ROUTER.ROUTE_NAME.LOGIN && token) {
		return next({ name: ROUTER.ROUTE_NAME.HOME });
	}

	if (to.name !== ROUTER.ROUTE_NAME.LOGIN && to.name !== ROUTER.ROUTE_NAME.LOGOUT) {
		if (!token) {
			return next({
				name: ROUTER.ROUTE_NAME.LOGIN,
				query: { redirect: to.query.redirect || to.fullPath },
			});
		}

		const { requiredPermissions } = to.meta;

		if (user?.roles[0] === ROLE.GUEST && to.name !== ROUTER.ROUTE_NAME.ACCOUNT_CREATED) {
			return next({ name: ROUTER.ROUTE_NAME.ACCOUNT_CREATED });
		}

		if (to.name !== ROUTER.ROUTE_NAME.NO_PERMISSION && to.name !== ROUTER.ROUTE_NAME.NOT_FOUND) {
			store.dispatch("showSideMenu", true);
		} else {
			store.dispatch("showSideMenu", false);
		}

		if (!!requiredPermissions && !isUserPermissionGranted(requiredPermissions)) {
			return next({ name: ROUTER.ROUTE_NAME.NO_PERMISSION });
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
