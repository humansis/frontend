<template>
	<AdvancedFilter
		ref="advancedFilter"
		v-if="admNames"
		multiline
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="filterChanged"
	/>
</template>

<script>
import AdvancedFilter from "@/components/AdvancedFilter";
import filtersHelper from "@/mixins/filtersHelper";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import locationHelper from "@/mixins/locationHelper";
import { copyObject } from "@/utils/helpers";
import consts from "@/utils/filterConst";

// TODO fix gender, after select one option, gender is not visible, but filter still working
export default {
	name: "VendorsFilter",

	components: {
		AdvancedFilter,
	},

	mixins: [filtersHelper, urlFiltersHelper, locationHelper],

	props: {
		defaultFilters: {
			type: Object,
			default: () => ({
				invoicing: consts.DEFAULT_FILTERS.invoicing,
				adm1: consts.DEFAULT_FILTERS.adm1,
				adm2: consts.DEFAULT_FILTERS.adm2,
				adm3: consts.DEFAULT_FILTERS.adm3,
				adm4: consts.DEFAULT_FILTERS.adm4,
				locations: consts.DEFAULT_FILTERS.locations,
			}),
		},
	},

	data() {
		return {
			selectedFiltersOptions: copyObject(this.defaultFilters),
			filtersOptionsCopy: {},
			filtersOptions: {
				invoicing: {
					name: "Invoicing",
					placeholder: this.$t("Select invoicing"),
					data: [
						{ code: "toRedeem", value: this.$t("To Redeem") },
						{ code: "syncRequired", value: this.$t("Sync Required") },
						{ code: "invoiced", value: this.$t("Invoiced") },
					],
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
					type: "multiselect",
				},
				adm3: {
					name: "Commune",
					placeholder: this.$t("Select Commune"),
					trackBy: "id",
					label: "name",
					data: [],
					type: "multiselect",
				},
				adm4: {
					name: "Village",
					placeholder: this.$t("Select Village"),
					trackBy: "id",
					label: "name",
					data: [],
					type: "multiselect",
				},
			},
		};
	},

	async created() {
		await Promise.all([
			this.setLocationNames(),
			this.fetchProvinces(),
			this.fetchDistricts(),
			this.fetchCommunes(),
			this.fetchVillages(),
		]).then(() => {
			this.fillParentCommunes();
			this.fillParentDistricts();
			this.fillParentProvinces();
			this.filtersOptionsCopy = copyObject(this.filtersOptions);
		});

		await Promise.all([
			this.setDefaultFilters(),
			this.setDefaultLocationsFilter(),
		]);
	},

	methods: {
		setDefaultFilters() {
			if (this.defaultFilters.invoicing) {
				this.selectedFiltersOptions.invoicing = this.filtersOptions
					.invoicing.data.find((item) => item.code === this.defaultFilters.invoicing);
			}
		},

		async filterChanged(filters, filterName) {
			const filtersCopy = await this.clearedLocationFilters(filters, filterName);
			const location = this.getLocation(filters);

			this.setAdmParents(filterName);
			this.filterAdmChildren(filterName);
			this.$refs.advancedFilter.$forceUpdate();

			this.$emit("filtersChanged", {
				filters: {
					invoicing: filters.invoicing?.[0] || null,
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
