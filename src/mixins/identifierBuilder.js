import { normalizeDataCy } from "@/utils/datagrid";

export default {
	methods: {
		pageIdentifier() {
			switch (this.$route.name) {
				case "Products":
					return "products";
				case "Project":
					return "project-assistance";
				case "CountrySpecific":
					return "country-specifics";
				case "Projects":
				case "AddProject":
				case "ProjectDetail":
				case "ProjectEdit":
					return "projects";
				case "Households":
				case "EditHousehold":
				case "AddHousehold":
					return "household";
				case "Vendors":
					return "vendors";
				default:
					return "";
			}
		},

		identifierBuilder(elementIdentifier, isPageIdentifierEnabled = true) {
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

		prepareComponentIdentifier(externalComponentIdentifier) {
			if (externalComponentIdentifier?.length) {
				return this.dataCy?.length
					? this.dataCy.concat("-", externalComponentIdentifier)
					: externalComponentIdentifier;
			}

			return this.dataCy;
		},
	},
};
