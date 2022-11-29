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
	name: "DistributionsFilter",

	components: { AdvancedFilter },

	mixins: [filtersHelper, locationHelper, transactionHelper, urlFiltersHelper],

	props: {
		defaultFilters: {
			type: Object,
			default: () => ({
				beneficiaryTypes: consts.DEFAULT_FILTERS.BENEFICIARY_TYPES,
				projects: consts.DEFAULT_FILTERS.PROJECTS,
				assistances: consts.DEFAULT_FILTERS.ASSISTANCES,
				commodity: consts.DEFAULT_FILTERS.COMMODITY,
				adm1: consts.DEFAULT_FILTERS.ADM1,
				adm2: consts.DEFAULT_FILTERS.ADM2,
				adm3: consts.DEFAULT_FILTERS.ADM3,
				adm4: consts.DEFAULT_FILTERS.ADM4,
				dateFrom: consts.DEFAULT_FILTERS.DATE_FROM,
				dateTo: consts.DEFAULT_FILTERS.DATE_TO,
			}),
		},
	},

	data() {
		return {
			selectedFiltersOptions: copyObject(this.defaultFilters),
			filtersOptionsCopy: {},
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
			this.fetchModalityTypes(),
			this.fetchBeneficiaryTypes(),
			this.fetchProvinces(),
			this.fetchDistricts(),
			this.fetchCommunes(),
			this.fetchVillages(),
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
				this.selectedFiltersOptions.dateFrom = this.defaultFilters.dateFrom;
			}

			if (this.defaultFilters.dateTo) {
				this.selectedFiltersOptions.dateTo = this.defaultFilters.dateTo;
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
					projects: preparedFilters.project || consts.DEFAULT_FILTERS.PROJECTS,
					dateFrom: preparedFilters.dateFrom || consts.DEFAULT_FILTERS.DATE_FROM,
					dateTo: preparedFilters.dateTo || consts.DEFAULT_FILTERS.DATE_TO,
					beneficiaryTypes: preparedFilters.beneficiaryType
						|| consts.DEFAULT_FILTERS.BENEFICIARY_TYPES,
					modalityTypes: preparedFilters.commodity || consts.DEFAULT_FILTERS.MODALITY_TYPES,
					assistances: preparedFilters.distribution || consts.DEFAULT_FILTERS.ASSISTANCES,
					locations: location ? [location] : consts.DEFAULT_FILTERS.LOCATIONS,
				},
				locationsFilter: {
					adm1: filtersCopy.adm1 || consts.DEFAULT_FILTERS.ADM1,
					adm2: filtersCopy.adm2 || consts.DEFAULT_FILTERS.ADM2,
					adm3: filtersCopy.adm3 || consts.DEFAULT_FILTERS.ADM3,
					adm4: filtersCopy.adm4 || consts.DEFAULT_FILTERS.ADM4,
				},
			});
		},
	},
};
</script>
