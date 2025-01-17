import { isUserPermissionGranted } from "@/utils/permissions";
import { PERMISSIONS, ROUTER } from "@/consts";

export default {
	data() {
		return {
			PERMISSIONS,
		};
	},

	methods: {
		isUserPermissionGranted(permissions, isAtLeastOnePermissionGranted = false) {
			return isUserPermissionGranted(permissions, isAtLeastOnePermissionGranted);
		},

		getAllowedPageForRedirect() {
			const pageRedirectOrder = [
				{
					permission: this.PERMISSIONS.PROJECT_MANAGEMENT,
					pageName: ROUTER.ROUTE_NAME.PROJECTS.ROOT,
					buttonName: "Go to Project page",
				},
				{
					permission: this.PERMISSIONS.HOUSEHOLD,
					pageName: ROUTER.ROUTE_NAME.HOUSEHOLDS.ROOT,
					buttonName: "Go to Household page",
				},
				{
					permission: this.PERMISSIONS.INSTITUTION,
					pageName: ROUTER.ROUTE_NAME.INSTITUTIONS.ROOT,
					buttonName: "Go to Institution page",
				},
				{
					permission: this.PERMISSIONS.VENDOR,
					pageName: ROUTER.ROUTE_NAME.VENDORS,
					buttonName: "Go to Vendor page",
				},
				{
					permission: this.PERMISSIONS.VENDOR,
					pageName: ROUTER.ROUTE_NAME.VENDORS,
					buttonName: "Go to Vendor page",
				},
				{
					permission: this.PERMISSIONS.IMPORT,
					pageName: ROUTER.ROUTE_NAME.IMPORTS.ROOT,
					buttonName: "Go to Import page",
				},
				{
					permission: this.PERMISSIONS.VOUCHERS,
					pageName: ROUTER.ROUTE_NAME.VOUCHERS,
					buttonName: "Go to Voucher page",
				},
				{
					permission: this.PERMISSIONS.COUNTRY_SETTINGS_PRODUCT_ITEMS,
					pageName: ROUTER.ROUTE_NAME.PRODUCTS,
					buttonName: "Go to Product page",
				},
				{
					permission: this.PERMISSIONS.COUNTRY_SETTINGS_SCORING,
					pageName: ROUTER.ROUTE_NAME.COUNTRY_SPECIFICS,
					buttonName: "Go to Country Specifics page",
				},
				{
					permission: this.PERMISSIONS.HOME_PAGE,
					pageName: ROUTER.ROUTE_NAME.HOME,
					buttonName: "Go to Home page",
				},
				{
					permission: this.PERMISSIONS.TRANSACTIONS,
					pageName: ROUTER.ROUTE_NAME.TRANSACTIONS.ROOT,
					buttonName: "Go to Transactions page",
				},
			];

			const pageRedirect = pageRedirectOrder.find(
				(page) => this.isUserPermissionGranted(page.permission),
			);

			return pageRedirect || {
				buttonName: "Go to Profile page",
				pageName: ROUTER.ROUTE_NAME.PROFILE,
			};
		},
	},
};
