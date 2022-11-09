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
import filtersHelper from "@/mixins/filtersHelper";
import locationHelper from "@/mixins/locationHelper";
import transactionHelper from "@/mixins/transactionHelper";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import { copyObject } from "@/utils/helpers";
import consts from "@/utils/filterConst";

export default {
	name: "SmartcardPurchasesItemsFilter",

	components: { AdvancedFilter },

	mixins: [filtersHelper, locationHelper, transactionHelper, urlFiltersHelper],

	props: {
		defaultFilters: {
			type: Object,
			default: () => ({
				project: consts.DEFAULT_FILTERS.project,
				assistances: consts.DEFAULT_FILTERS.assistances,
				adm1: consts.DEFAULT_FILTERS.adm1,
				adm2: consts.DEFAULT_FILTERS.adm2,
				adm3: consts.DEFAULT_FILTERS.adm3,
				adm4: consts.DEFAULT_FILTERS.adm4,
				vendors: consts.DEFAULT_FILTERS.vendors,
				dateFrom: consts.DEFAULT_FILTERS.dateFrom,
				dateTo: consts.DEFAULT_FILTERS.dateTo,
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
			this.fetchAssistance(),
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
				this.selectedFiltersOptions.project	= this.filtersOptions
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

		async filterChanged(filters, filterName) {
			const preparedFilters = { ...filters };

			const filtersCopy = await this.clearedLocationFilters(filters, filterName);

			this.setAdmParents(filterName);
			this.filterAdmChildren(filterName);
			this.$refs.advancedFilter.$forceUpdate();

			if (filterName === "project") {
				this.selectedFiltersOptions.distribution = [];
				preparedFilters.distribution = null;
				this.fetchAssistance();
			}

			const location = this.getLocation(filters);

			this.$emit("filtersChanged", {
				filters: {
					projects: preparedFilters.project || consts.DEFAULT_FILTERS.projects,
					dateFrom: preparedFilters.dateFrom || consts.DEFAULT_FILTERS.dateFrom,
					dateTo: preparedFilters.dateTo || consts.DEFAULT_FILTERS.dateTo,
					assistances: preparedFilters.distribution || consts.DEFAULT_FILTERS.assistances,
					vendors: preparedFilters.vendor || consts.DEFAULT_FILTERS.vendors,
					locations: location ? [location] : consts.DEFAULT_FILTERS.locations,
				},
				locationsFilter: {
					adm1: filtersCopy.adm1 || consts.DEFAULT_FILTERS.adm1,
					adm2: filtersCopy.adm2 || consts.DEFAULT_FILTERS.adm2,
					adm3: filtersCopy.adm3 || consts.DEFAULT_FILTERS.adm3,
					adm4: filtersCopy.adm4 || consts.DEFAULT_FILTERS.adm4,
				},
			});
		},
	},
};
</script>
