import { ROUTER } from "@/consts";

export default {
	methods: {
		getHouseholdEditPage(householdId) {
			return {
				name: ROUTER.ROUTE_NAME.HOUSEHOLDS.EDIT,
				params: { householdId },
			};
		},

		getProjectEditPage(projectId) {
			return {
				name: ROUTER.ROUTE_NAME.PROJECTS.EDIT,
				params: { projectId },
			};
		},

		getProjectDetailPage(projectId) {
			return {
				name: ROUTER.ROUTE_NAME.PROJECTS.DETAIL,
				params: { projectId },
			};
		},

		getProjectPage(projectId) {
			return {
				name: ROUTER.ROUTE_NAME.ASSISTANCES.ROOT,
				params: { projectId },
			};
		},

		getAssistanceEditPage(assistanceId) {
			return {
				name: ROUTER.ROUTE_NAME.ASSISTANCES.EDIT,
				params: { assistanceId },
			};
		},

		getAssistanceDetailPage(assistanceId) {
			return {
				name: ROUTER.ROUTE_NAME.ASSISTANCES.DETAIL,
				params: { assistanceId },
			};
		},

		getAssistanceProgressPage(assistanceId) {
			return {
				name: ROUTER.ROUTE_NAME.ASSISTANCES.CREATION_PROGRESS,
				params: { assistanceId },
			};
		},

		getInstitutionEditPage(institutionId) {
			return {
				name: ROUTER.ROUTE_NAME.INSTITUTIONS.EDIT,
				params: { institutionId },
			};
		},

		getInstitutionDetailPage(institutionId) {
			return {
				name: ROUTER.ROUTE_NAME.INSTITUTIONS.DETAIL,
				params: { institutionId },
			};
		},

		getUserEditPage(userId) {
			return {
				name: ROUTER.ROUTE_NAME.USERS.EDIT,
				params: { userId },
			};
		},

		getUserDetailPage(userId) {
			return {
				name: ROUTER.ROUTE_NAME.USERS.DETAIL,
				params: { userId },
			};
		},

		getRoleEditPage(roleId) {
			return {
				name: ROUTER.ROUTE_NAME.ROLES.EDIT,
				params: { roleId },
			};
		},

		getRoleDetailPage(roleId) {
			return {
				name: ROUTER.ROUTE_NAME.ROLES.DETAIL,
				params: { roleId },
			};
		},

		getImportPage(importId, query) {
			return {
				name: ROUTER.ROUTE_NAME.IMPORTS.NEW,
				params: { importId },
				...(query && { query }),
			};
		},
	},
};
