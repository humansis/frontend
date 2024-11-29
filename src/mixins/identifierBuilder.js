import { normalizeDataCy } from "@/utils/datagrid";
import { ROUTER } from "@/consts";

export default {
	methods: {
		pageIdentifier() {
			switch (this.$route.name) {
				case ROUTER.ROUTE_NAME.PRODUCTS:
					return "products";
				case ROUTER.ROUTE_NAME.ASSISTANCES.ROOT:
					return "project-assistance";
				case ROUTER.ROUTE_NAME.COUNTRY_SPECIFICS:
					return "country-specifics";
				case "HouseholdInformationSummary":
					return "household-information-summary";
				case ROUTER.ROUTE_NAME.PROJECTS.ROOT:
				case ROUTER.ROUTE_NAME.PROJECTS.ADD:
				case ROUTER.ROUTE_NAME.PROJECTS.DETAIL:
				case ROUTER.ROUTE_NAME.PROJECTS.EDIT:
					return "projects";
				case ROUTER.ROUTE_NAME.HOUSEHOLDS.ROOT:
				case ROUTER.ROUTE_NAME.HOUSEHOLDS.EDIT:
				case ROUTER.ROUTE_NAME.HOUSEHOLDS.ADD:
					return "household";
				case ROUTER.ROUTE_NAME.VENDORS:
					return "vendors";
				default:
					return "";
			}
		},

		identifierBuilder(elementIdentifier = "", isPageIdentifierEnabled = true) {
			const pageIdentifierName = this.pageIdentifier();
			const identifierParams = [];

			if (pageIdentifierName.length && isPageIdentifierEnabled) {
				identifierParams.push(pageIdentifierName);
			}

			if (this.prepareComponentIdentifier()?.length) {
				identifierParams.push(normalizeDataCy(this.prepareComponentIdentifier()));
			}

			if (elementIdentifier?.length) {
				identifierParams.push(normalizeDataCy(elementIdentifier));
			}

			return identifierParams.join("-");
		},

		prepareComponentIdentifier(externalComponentIdentifier = "", isDataCyIgnored = false) {
			if (externalComponentIdentifier?.length) {
				return !isDataCyIgnored && this.dataCy?.length
					? this.dataCy.concat("-", externalComponentIdentifier)
					: externalComponentIdentifier;
			}

			return this.dataCy;
		},
	},
};
