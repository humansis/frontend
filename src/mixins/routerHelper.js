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

		getImportPage(importId, query) {
			return {
				name: ROUTER.ROUTE_NAME.IMPORTS.NEW,
				params: { importId },
				...(query && { query }),
			};
		},
	},
};
