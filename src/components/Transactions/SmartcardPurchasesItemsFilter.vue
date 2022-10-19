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
import locationHelper from "@/mixins/locationHelper";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";

export default {
	name: "SmartcardPurchasesItemsFilter",

	components: { AdvancedFilter },

	mixins: [urlFiltersHelper, locationHelper],

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
