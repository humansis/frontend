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
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
				locations: [],
			},
			filtersOptions: {
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
		]);

		await Promise.all([
			this.setDefaultLocationsFilter(),
		]);
	},

	methods: {
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
				default: break;
			}
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
					locations: location ? [location] : [],
				},
				locationsFilter: {
					adm1: filters.adm1,
					adm2: filters.adm2,
					adm3: filters.adm3,
					adm4: filters.adm4,
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

		async fetchDistricts(id) {
			this.filtersOptions.adm2.loading = true;
			await LocationsService.getListOfAdm2(id)
				.then(({ data }) => {
					this.filtersOptions.adm2.data = data;
					this.filtersOptions.adm2.loading = false;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t(this.admNames.adm2)} ${e}`, "is-danger");
				});
		},

		async fetchCommunes(id) {
			this.filtersOptions.adm3.loading = true;
			await LocationsService.getListOfAdm3(id)
				.then(({ data }) => {
					this.filtersOptions.adm3.data = data;
					this.filtersOptions.adm3.loading = false;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t(this.admNames.adm3)} ${e}`, "is-danger");
				});
		},

		async fetchVillages(id) {
			this.filtersOptions.adm4.loading = true;
			await LocationsService.getListOfAdm4(id)
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
				projects: [],
				vulnerabilities: [],
				gender: [],
				residencyStatuses: [],
				referralTypes: [],
				livelihoods: [],
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
