<template>
	<AdvancedFilter
		multiline
		ref="advancedFilter"
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="filterChanged"
	/>
</template>

<script>
import AdvancedFilter from "@/components/AdvancedFilter";
import transactionHelper from "@/mixins/transactionHelper";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";

export default {
	name: "SmartcardPurchasesItemsFilter",

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
				project: [],
				distribution: [],
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
				vendor: [],
				dateFrom: null,
				dateTo: null,
			},
			filtersOptions: {
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
				vendor: {
					name: "Vendor",
					type: "multiselect",
					trackBy: "id",
					label: "vendorName",
					loading: true,
					placeholder: this.$t("Select Vendor"),
					data: [],
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

	async created() {
		await Promise.all([
			this.setLocationNames(),
			this.fetchProjects(),
			this.fetchProvinces(),
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

			if (this.defaultFilters.projects?.length) {
				this.selectedFiltersOptions.project	= this.filtersOptions
					.project.data
					.find((item) => item.id === this.defaultFilters.projects[0]);
			}

			if (this.defaultFilters.vendors?.length) {
				this.selectedFiltersOptions.vendor	= this.filtersOptions
					.vendor.data
					.find((item) => item.id === this.defaultFilters.vendors[0]);
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
					this.fetchAssistance();
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
				filters: {
					projects: preparedFilters.project || [],
					dateFrom: preparedFilters.dateFrom || null,
					dateTo: preparedFilters.dateTo || null,
					assistances: preparedFilters.distribution || [],
					vendors: preparedFilters.vendor || [],
					locations: location ? [location] : [],
				},
				locationsFilter: {
					adm1: preparedFilters.adm1,
					adm2: preparedFilters.adm2,
					adm3: preparedFilters.adm3,
					adm4: preparedFilters.adm4,
				},
			});
		},

		eraseFilters() {
			this.selectedFiltersOptions = {
				project: [],
				distribution: [],
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
