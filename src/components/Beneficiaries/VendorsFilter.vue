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
import LocationsService from "@/services/LocationsService";
import { Notification } from "@/utils/UI";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";

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

	mixins: [urlFiltersHelper],

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
		]);

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

			let location = null;

			if (this.selectedFiltersOptions.adm4) {
				const [a] = filters.adm4;
				location = a;
			} else
			if (this.selectedFiltersOptions.adm3) {
				const [a] = filters.adm3;
				location = a;
			} else
			if (this.selectedFiltersOptions.adm2) {
				const [a] = filters.adm2;
				location = a;
			} else
			if (this.selectedFiltersOptions.adm1) {
				const [a] = filters.adm1;
				location = a;
			}

			if (filterName && filterName.includes("adm")) {
				const admNum = parseInt(filterName.slice(-1), 10);
				for (let i = admNum; i >= 2; i -= 1) {
					if (this.selectedFiltersOptions[`adm${i}`]) {
						this.selectedFiltersOptions[`adm${i - 1}`] = this.filtersOptions[`adm${i - 1}`].data.find((adm) => (
							adm.id === this.selectedFiltersOptions[`adm${i}`].parentId
						));
					}
				}
			}

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

		async fetchProvinces() {
			await LocationsService.getListOfAdm1()
				.then(({ data }) => {
					this.filtersOptions.adm1.data = data;
					this.filtersOptions.adm1.loading = false;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t(this.admNames.adm1)} ${e}`, "is-danger");
				});
		},

		async fetchDistricts() {
			this.filtersOptions.adm2.loading = true;

			await LocationsService.getListOfAdm2(null)
				.then(({ data }) => {
					this.filtersOptions.adm2.data = data;
					this.filtersOptions.adm2.loading = false;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t(this.admNames.adm2)} ${e}`, "is-danger");
				});
		},

		async fetchCommunes() {
			this.filtersOptions.adm3.loading = true;

			await LocationsService.getListOfAdm3(null)
				.then(({ data }) => {
					this.filtersOptions.adm3.data = data;
					this.filtersOptions.adm3.loading = false;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t(this.admNames.adm3)} ${e}`, "is-danger");
				});
		},

		async fetchVillages() {
			this.filtersOptions.adm4.loading = true;

			await LocationsService.getListOfAdm4(null)
				.then(({ data }) => {
					this.filtersOptions.adm4.data = data;
					this.filtersOptions.adm4.loading = false;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t(this.admNames.adm4)} ${e}`, "is-danger");
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
