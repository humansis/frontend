<template>
	<AdvancedFilter
		multiline
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="filterChanged"
	/>
</template>

<script>
import AdvancedFilter from "@/components/AdvancedFilter";
import transactionHelper from "@/mixins/transactionHelper";

export default {
	name: "PurchasesFilter",

	components: { AdvancedFilter },

	mixins: [transactionHelper],

	data() {
		return {
			selectedFiltersOptions: {
				beneficiaryType: [],
				project: [],
				distribution: [],
				commodity: [],
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
				vendor: [],
			},
			filtersOptions: {
				beneficiaryType: {
					name: "Beneficiary Type",
					type: "multiselect",
					loading: true,
					placeholder: this.$t("Select Type"),
					data: [],
				},
				project: {
					name: "Project",
					type: "multiselect",
					trackBy: "id",
					label: "name",
					loading: true,
					placeholder: this.$t("Select Project"),
					data: [],
				},
				distribution: {
					name: "Distribution Name",
					type: "multiselect",
					trackBy: "id",
					label: "name",
					loading: false,
					placeholder: this.$t("Select Distribution"),
					data: [],
				},
				commodity: {
					name: "Commodity Type",
					type: "multiselect",
					loading: true,
					placeholder: this.$t("Select Commodity"),
					data: [],
				},
				vendor: {
					name: "Vendor",
					type: "multiselect",
					trackBy: "id",
					label: "vendorName",
					loading: true,
					placeholder: this.$t("Select Vendor"),
					data: [],
				},
				empty: {
					type: "empty",
				},
				adm1: {
					name: "Province",
					placeholder: this.$t("Select Province"),
					trackBy: "id",
					label: "name",
					loading: true,
					data: [],
					selectValue: "locationId",
					filterForSend: "locations",
				},
				adm2: {
					name: "District",
					placeholder: this.$t("Select District"),
					trackBy: "id",
					label: "name",
					data: [],
					selectValue: "locationId",
				},
				adm3: {
					name: "Commune",
					placeholder: this.$t("Select Commune"),
					trackBy: "id",
					label: "name",
					data: [],
					selectValue: "locationId",
				},
				adm4: {
					name: "Village",
					placeholder: this.$t("Select Village"),
					trackBy: "id",
					label: "name",
					data: [],
					selectValue: "locationId",
				},
				dateFrom: {
					name: "Date From",
					placeholder: this.$t("Select Date"),
					type: "date",
				},
				dateTo: {
					name: "Date To",
					placeholder: this.$t("Select Date"),
					type: "date",
				},
			},
		};
	},

	created() {
		this.setLocationNames();
		this.fetchProjects();
		this.fetchModalityTypes();
		this.fetchBeneficiaryTypes();
		this.fetchProvinces();
		this.fetchVendors();
	},

	methods: {
		setLocationNames() {
			this.filtersOptions.adm1.name = this.admNames.adm1;
			this.filtersOptions.adm1.placeholder = `Select ${this.admNames.adm1}`;

			this.filtersOptions.adm2.name = this.admNames.adm2;
			this.filtersOptions.adm2.placeholder = `Select ${this.admNames.adm2}`;

			this.filtersOptions.adm3.name = this.admNames.adm3;
			this.filtersOptions.adm3.placeholder = `Select ${this.admNames.adm3}`;

			this.filtersOptions.adm4.name = this.admNames.adm4;
			this.filtersOptions.adm4.placeholder = `Select ${this.admNames.adm4}`;
		},

		filterChanged(filters, filterName) {
			const preparedFilters = { ...filters };
			switch (filterName) {
				case "adm1":
					this.selectedFiltersOptions.adm2 = null;
					this.selectedFiltersOptions.adm3 = null;
					this.selectedFiltersOptions.adm4 = null;
					if (!this.selectedFiltersOptions[filterName]) break;
					this.fetchDistricts(this.selectedFiltersOptions[filterName].id);
					break;
				case "adm2":
					this.selectedFiltersOptions.adm3 = null;
					this.selectedFiltersOptions.adm4 = null;
					if (!this.selectedFiltersOptions[filterName]) break;
					this.fetchCommunes(this.selectedFiltersOptions[filterName].id);
					break;
				case "adm3":
					this.selectedFiltersOptions.adm4 = null;
					if (!this.selectedFiltersOptions[filterName]) break;
					this.fetchVillages(this.selectedFiltersOptions[filterName].id);
					break;
				case "adm4":
					if (!this.selectedFiltersOptions[filterName]) break;
					break;
				case "project":
					this.selectedFiltersOptions.distribution = [];
					preparedFilters.distribution = null;
					if (this.selectedFiltersOptions.project) {
						this.fetchAssistance();
					}
					break;
				default: break;
			}
			let location = null;
			if (this.selectedFiltersOptions.adm4) {
				const [a] = preparedFilters.adm4;
				location = a;
			} else if (this.selectedFiltersOptions.adm3) {
				const [a] = preparedFilters.adm3;
				location = a;
			} else if (this.selectedFiltersOptions.adm2) {
				const [a] = preparedFilters.adm2;
				location = a;
			} else if (this.selectedFiltersOptions.adm1) {
				const [a] = preparedFilters.adm1;
				location = a;
			}

			this.$emit("filtersChanged", {
				projects: preparedFilters.project || [],
				dateFrom: preparedFilters.dateFrom || null,
				dateTo: preparedFilters.dateTo || null,
				beneficiaryTypes: preparedFilters.beneficiaryType || [],
				modalityTypes: preparedFilters.commodity || [],
				assistances: preparedFilters.distribution || [],
				vendors: preparedFilters.vendor || [],
				locations: location ? [location] : [],
			});
		},
	},
};
</script>
