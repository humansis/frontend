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
import { mapState } from "vuex";
import AdvancedFilter from "@/components/AdvancedFilter";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import transactionHelper from "@/mixins/transactionHelper";

const DEFAULT_FILTERS = {
	invoicing: [],
	adm1: null,
	adm2: null,
	adm3: null,
	adm4: null,
	locations: [],
};

// TODO fix gender, after select one option, gender is not visible, but filter still working
export default {
	name: "VendorsFilter",

	components: {
		AdvancedFilter,
	},

	mixins: [urlFiltersHelper, transactionHelper],

	data() {
		return {
			selectedFiltersOptions: { ...DEFAULT_FILTERS },
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
					type: "multiselectDescription",
				},
				adm3: {
					name: "Commune",
					placeholder: this.$t("Select Commune"),
					trackBy: "id",
					label: "name",
					data: [],
					type: "multiselectDescription",
				},
				adm4: {
					name: "Village",
					placeholder: this.$t("Select Village"),
					trackBy: "id",
					label: "name",
					data: [],
					type: "multiselectDescription",
				},
			},
		};
	},

	props: {
		defaultFilters: {
			type: Object,
			default: () => {},
		},
	},

	computed: {
		...mapState(["admNames"]),
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

		async filterChanged(filters, filterName) {
			const filtersCopy = await this.clearedLocationFilters(filters, filterName);
			const location = this.getLocation(filters);

			this.setAdmParents(filterName);

			this.$emit("filtersChanged", {
				filters: {
					invoicing: filters.invoicing?.[0] || null,
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
			this.selectedFiltersOptions = { ...DEFAULT_FILTERS };
			this.$nextTick(() => {
				this.$refs.advancedFilter.filterChanged();
			});
		},
	},
};
</script>
