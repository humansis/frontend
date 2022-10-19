<template>
	<div>
		<AdvancedFilter
			multiline
			ref="advancedFilter"
			:selected-filters-options="selectedFiltersOptions"
			:filters-options="filtersOptions"
			@filtersChanged="filterChanged"
		/>
		neeeeee
	</div>
</template>

<script>
import AdvancedFilter from "@/components/AdvancedFilter";
import transactionHelper from "@/mixins/transactionHelper";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";

export default {
	name: "PurchasesFilter",

	components: { AdvancedFilter },

	mixins: [urlFiltersHelper, transactionHelper],

	props: {
		defaultFilters: {
			type: Object,
			default: () => {},
		},
	},

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
				dateFrom: null,
				dateTo: null,
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
					name: "Assistance Name",
					type: "multiselect",
					trackBy: "id",
					label: "name",
					loading: false,
					placeholder: this.$t("Select Assistance"),
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
					filterForSend: "locations",
				},
				adm2: {
					name: "District",
					placeholder: this.$t("Select District"),
					trackBy: "id",
					label: "name",
					data: [],
				},
				adm3: {
					name: "Commune",
					placeholder: this.$t("Select Commune"),
					trackBy: "id",
					label: "name",
					data: [],
				},
				adm4: {
					name: "Village",
					placeholder: this.$t("Select Village"),
					trackBy: "id",
					label: "name",
					data: [],
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

	async created() {
		await Promise.all([
			this.setLocationNames(),
			this.fetchProjects(),
			this.fetchModalityTypes(),
			this.fetchBeneficiaryTypes(),
			this.fetchProvinces(),
			this.fetchDistricts(),
			this.fetchCommunes(),
			this.fetchVillages(),
			this.fetchVendors(),
			this.fetchAssistance(),
		]);

		await Promise.all([
			this.setDefaultFilters(),
			this.setDefaultLocationsFilter(),
		]);
	},

	methods: {
		setDefaultFilters() {
			if (this.defaultFilters.assistances?.length) {
				this.selectedFiltersOptions.distribution = this.filtersOptions
					.distribution.data.find((item) => item.id === this.defaultFilters.assistances[0]);
			}

			if (this.defaultFilters.beneficiaryTypes?.length) {
				this.selectedFiltersOptions.beneficiaryType	= this.filtersOptions
					.beneficiaryType.data
					.find((item) => item.code === this.defaultFilters.beneficiaryTypes[0]);
			}

			if (this.defaultFilters.projects?.length) {
				this.selectedFiltersOptions.project	= this.filtersOptions
					.project.data
					.find((item) => item.id === this.defaultFilters.projects[0]);
			}

			if (this.defaultFilters.modalityTypes?.length) {
				this.selectedFiltersOptions.commodity = this.filtersOptions
					.commodity.data
					.find((item) => item.code === this.defaultFilters.modalityTypes[0]);
			}

			if (this.defaultFilters.dateFrom) {
				this.selectedFiltersOptions.dateFrom = new Date(this.defaultFilters.dateFrom);
			}

			if (this.defaultFilters.dateFrom) {
				this.selectedFiltersOptions.dateTo = new Date(this.defaultFilters.dateTo);
			}
		},

		setLocationNames() {
			this.filtersOptions.adm1.name = this.admNames.adm1;
			this.filtersOptions.adm1.placeholder = `${this.$t("Select")} ${this.admNames.adm1}`;

			this.filtersOptions.adm2.name = this.admNames.adm2;
			this.filtersOptions.adm2.placeholder = `${this.$t("Select")} ${this.admNames.adm2}`;

			this.filtersOptions.adm3.name = this.admNames.adm3;
			this.filtersOptions.adm3.placeholder = `${this.$t("Select")} ${this.admNames.adm3}`;

			this.filtersOptions.adm4.name = this.admNames.adm4;
			this.filtersOptions.adm4.placeholder = `${this.$t("Select")} ${this.admNames.adm4}`;
		},

		async filterChanged(filters, filterName) {
			const preparedFilters = { ...filters };

			const filtersCopy = await this.clearedLocationFilters(filters, filterName);

			if (filterName === "project") {
				this.selectedFiltersOptions.distribution = [];
				preparedFilters.distribution = null;
				this.fetchAssistance();
			}

			const location = this.getLocation(filters);

			this.$emit("filtersChanged", {
				filters: {
					projects: preparedFilters.project || [],
					dateFrom: preparedFilters.dateFrom || null,
					dateTo: preparedFilters.dateTo || null,
					beneficiaryTypes: preparedFilters.beneficiaryType || [],
					modalityTypes: preparedFilters.commodity || [],
					assistances: preparedFilters.distribution || [],
					vendors: preparedFilters.vendor || [],
					locations: location ? [location] : [],
				},
				locationsFilter: {
					adm1: filtersCopy.adm1,
					adm2: filtersCopy.adm2,
					adm3: filtersCopy.adm3,
					adm4: filtersCopy.adm4,
				},
			});
		},

		eraseFilters() {
			this.selectedFiltersOptions = {
				beneficiaryType: [],
				project: [],
				distribution: [],
				commodity: [],
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
				vendor: [],
				dateFrom: null,
				dateTo: null,
			};
			this.$nextTick(() => {
				this.$refs.advancedFilter.filterChanged();
			});
		},
	},
};
</script>
