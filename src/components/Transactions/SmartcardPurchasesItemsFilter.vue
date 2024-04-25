<template>
	<AdvancedFilter
		ref="advancedFilter"
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		multiline
		@filtersChanged="onFilterChanged"
		@search="$emit('search')"
	/>
</template>

<script>
import AdvancedFilter from "@/components/AdvancedFilter";
import filtersHelper from "@/mixins/filtersHelper";
import locationHelper from "@/mixins/locationHelper";
import transactionHelper from "@/mixins/transactionHelper";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import { copyObject } from "@/utils/helpers";
import { FILTER } from "@/consts";

export default {
	name: "SmartcardPurchasesItemsFilter",

	emits: [
		"search",
		"filtersChanged",
	],

	components: { AdvancedFilter },

	mixins: [
		filtersHelper,
		locationHelper,
		transactionHelper,
		urlFiltersHelper,
	],

	props: {
		defaultFilters: {
			type: Object,
			default: () => ({
				project: FILTER.DEFAULT_FILTERS.PROJECTS,
				assistances: FILTER.DEFAULT_FILTERS.ASSISTANCES,
				adm1: FILTER.DEFAULT_FILTERS.ADM1,
				adm2: FILTER.DEFAULT_FILTERS.ADM2,
				adm3: FILTER.DEFAULT_FILTERS.ADM3,
				adm4: FILTER.DEFAULT_FILTERS.ADM4,
				vendors: FILTER.DEFAULT_FILTERS.VENDORS,
				dateFrom: FILTER.DEFAULT_FILTERS.DATE_FROM,
				dateTo: FILTER.DEFAULT_FILTERS.DATE_TO,
			}),
		},
	},

	data() {
		return {
			selectedFiltersOptions: copyObject(this.defaultFilters),
			filtersOptionsCopy: {},
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
		// We need to set default filters first to avoid Invalid prop error for dateFrom & dateTo
		await Promise.all([
			this.setDefaultFilters(),
			this.setDefaultLocationsFilter(),
		]);

		await Promise.all([
			this.setLocationNames(),
			this.fetchProjects(),
			this.fetchProvinces(),
			this.fetchDistricts(),
			this.fetchCommunes(),
			this.fetchVillages(),
			this.fetchVendors(),
			this.fetchAssistanceForAdvancedSearch(),
		]).then(() => {
			this.fillParentCommunes();
			this.fillParentDistricts();
			this.fillParentProvinces();
			this.filtersOptionsCopy = copyObject(this.filtersOptions);
		});

		// We need to set default filters second time in order to update filters
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
				this.selectedFiltersOptions.project = this.filtersOptions
					.project.data
					.find((item) => item.id === this.defaultFilters.projects[0]);
			}

			if (this.defaultFilters.vendors?.length) {
				this.selectedFiltersOptions.vendor = this.filtersOptions
					.vendor.data
					.find((item) => item.id === this.defaultFilters.vendors[0]);
			}

			if (this.defaultFilters.dateFrom) {
				this.selectedFiltersOptions.dateFrom = new Date(this.defaultFilters.dateFrom);
			}

			if (this.defaultFilters.dateTo) {
				this.selectedFiltersOptions.dateTo = new Date(this.defaultFilters.dateTo);
			}

			if (this.$refs.advancedFilter) {
				this.$refs.advancedFilter.$forceUpdate();
			}
		},

		async onFilterChanged(filters, filterName) {
			const preparedFilters = { ...filters };

			const filtersCopy = await this.clearedLocationFilters(filters, filterName);

			this.setAdmParents(filterName);
			this.filterAdmChildren(filterName);
			this.$refs.advancedFilter.$forceUpdate();

			if (filterName === "project") {
				this.selectedFiltersOptions.distribution = [];
				preparedFilters.distribution = null;

				await this.fetchAssistanceForAdvancedSearch();
			}

			const location = this.getLocation(filters);

			this.$emit("filtersChanged", {
				filters: {
					projects: preparedFilters.project || FILTER.DEFAULT_FILTERS.PROJECTS,
					dateFrom: preparedFilters.dateFrom
						? this.$moment(preparedFilters.dateFrom).format("YYYY-MM-DD")
						: FILTER.DEFAULT_FILTERS.DATE_FROM,
					dateTo: preparedFilters.dateTo
						? this.$moment(preparedFilters.dateTo).format("YYYY-MM-DD")
						: FILTER.DEFAULT_FILTERS.DATE_TO,
					assistances: preparedFilters.distribution || FILTER.DEFAULT_FILTERS.ASSISTANCES,
					vendors: preparedFilters.vendor || FILTER.DEFAULT_FILTERS.VENDORS,
					locations: location ? [location] : FILTER.DEFAULT_FILTERS.LOCATIONS,
				},
				locationsFilter: {
					adm1: filtersCopy.adm1 || FILTER.DEFAULT_FILTERS.ADM1,
					adm2: filtersCopy.adm2 || FILTER.DEFAULT_FILTERS.ADM2,
					adm3: filtersCopy.adm3 || FILTER.DEFAULT_FILTERS.ADM3,
					adm4: filtersCopy.adm4 || FILTER.DEFAULT_FILTERS.ADM4,
				},
			});
		},
	},
};
</script>
