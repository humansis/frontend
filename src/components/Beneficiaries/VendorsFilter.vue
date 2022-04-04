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

// TODO fix gender, after select one option, gender is not visible, but filter still working
export default {
	name: "VendorsFilter",

	components: {
		AdvancedFilter,
	},

	mixins: [urlFiltersHelper],

	data() {
		return {
			selectedFiltersOptions: {
				isInvoiced: [],
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
				locations: [],
			},
			filtersOptions: {
				isInvoiced: {
					name: "Invoicing",
					placeholder: this.$t("Select invoicing"),
					data: [
						{ code: "true", value: this.$t("Invoiced") },
						{ code: "false", value: this.$t("To Redeem") },
					],
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
			if (this.defaultFilters.isInvoiced) {
				this.selectedFiltersOptions.isInvoiced = this.filtersOptions
					.isInvoiced.data.find((item) => item.code === this.defaultFilters.isInvoiced);
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

			this.$emit("filtersChanged", {
				filters: {
					isInvoiced: filters.isInvoiced[0],
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
			this.selectedFiltersOptions = {
				isInvoiced: [],
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
				locations: [],
			};
			this.$nextTick(() => {
				this.$refs.advancedFilter.filterChanged();
			});
		},
	},
};
</script>
