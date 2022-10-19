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
import ProjectService from "@/services/ProjectService";
import LocationsService from "@/services/LocationsService";
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";

// TODO fix gender, after select one option, gender is not visible, but filter still working
export default {
	name: "HouseholdsFilter",

	components: {
		AdvancedFilter,
	},

	mixins: [urlFiltersHelper],

	data() {
		return {
			selectedFiltersOptions: {
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
			},
			filtersOptions: {
				projects: {
					name: "Project",
					placeholder: this.$t("Select Project"),
					multiple: true,
					trackBy: "id",
					label: "name",
					loading: true,
					data: [],
				},
				vulnerabilities: {
					name: "Vulnerability",
					placeholder: this.$t("Select Vulnerability"),
					multiple: true,
					loading: true,
					data: [],
				},
				gender: {
					name: "Gender",
					placeholder: this.$t("Select Gender"),
					data: [
						{ code: "M", value: this.$t("Male") },
						{ code: "F", value: this.$t("Female") },
					],
				},
				residencyStatuses: {
					name: "Residency Status",
					placeholder: this.$t("Select Residence"),
					multiple: true,
					loading: true,
					data: [],
				},
				referralTypes: {
					name: "Referral",
					placeholder: this.$t("Select Referral"),
					multiple: true,
					loading: true,
					data: [],
				},
				livelihoods: {
					name: "Livelihood",
					placeholder: this.$t("Select Livelihood"),
					multiple: true,
					loading: true,
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
			this.fetchProjects(),
			this.fetchProvinces(),
			this.fetchDistricts(),
			this.fetchCommunes(),
			this.fetchVillages(),
			this.fetchLivelihoods(),
			this.fetchVulnerabilities(),
			this.fetchResidenceStatuses(),
			this.fetchReferralTypes(),
		]);

		await Promise.all([
			this.setDefaultFilters(),
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

		setDefaultFilters() {
			if (this.defaultFilters.projects?.length) {
				this.selectedFiltersOptions.projects = this.filtersOptions
					.projects.data
					.filter((item) => this.defaultFilters.projects.includes(item.id));
			}

			if (this.defaultFilters.vulnerabilities?.length) {
				this.selectedFiltersOptions.vulnerabilities = this.filtersOptions
					.vulnerabilities.data
					.filter((item) => this.defaultFilters.vulnerabilities.includes(item.code));
			}

			if (this.defaultFilters.gender) {
				this.selectedFiltersOptions.gender = this.filtersOptions
					.gender.data.find((item) => item.code === this.defaultFilters.gender[0]);
			}

			if (this.defaultFilters.residencyStatuses?.length) {
				this.selectedFiltersOptions.residencyStatuses = this.filtersOptions
					.residencyStatuses.data
					.filter((item) => this.defaultFilters.residencyStatuses.includes(item.code));
			}

			if (this.defaultFilters.livelihoods?.length) {
				this.selectedFiltersOptions.livelihoods = this.filtersOptions
					.livelihoods.data
					.filter((item) => this.defaultFilters.livelihoods.includes(item.code));
			}

			if (this.defaultFilters.referralTypes?.length) {
				this.selectedFiltersOptions.referralTypes = this.filtersOptions
					.referralTypes.data
					.filter((item) => this.defaultFilters.referralTypes.includes(item.code));
			}
		},

		async filterChanged(filters, filterName) {
			const filtersCopy = await this.clearedLocationFilters(filters, filterName);

			let location = null;
			if (this.selectedFiltersOptions.adm4) {
				const [a] = filtersCopy.adm4;
				location = a;
			} else
			if (this.selectedFiltersOptions.adm3) {
				const [a] = filtersCopy.adm3;
				location = a;
			} else
			if (this.selectedFiltersOptions.adm2) {
				const [a] = filtersCopy.adm2;
				location = a;
			} else
			if (this.selectedFiltersOptions.adm1) {
				const [a] = filtersCopy.adm1;
				location = a;
			}

			this.$emit("filtersChanged", {
				filters: {
					projects: filters.projects,
					vulnerabilities: filters.vulnerabilities,
					gender: filters.gender ? filters.gender[0] : null,
					residencyStatuses: filters.residencyStatuses,
					referralTypes: filters.referralTypes,
					livelihoods: filters.livelihoods,
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

		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.filtersOptions.projects.data = data;
					this.filtersOptions.projects.loading = false;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Projects")} ${e}`, "is-danger");
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

		async fetchLivelihoods() {
			await BeneficiariesService.getListOfLivelihoods()
				.then(({ data }) => {
					this.filtersOptions.livelihoods.data = data;
					this.filtersOptions.livelihoods.loading = false;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Livelihoods")} ${e}`, "is-danger");
				});
		},

		async fetchVulnerabilities() {
			await BeneficiariesService.getListOfVulnerabilities()
				.then(({ data }) => {
					this.filtersOptions.vulnerabilities.data = data;
					this.filtersOptions.vulnerabilities.loading = false;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Vulnerabilities")} ${e}`, "is-danger");
				});
		},

		async fetchResidenceStatuses() {
			await BeneficiariesService.getListOfResidenceStatuses()
				.then(({ data }) => {
					this.filtersOptions.residencyStatuses.data = data;
					this.filtersOptions.residencyStatuses.loading = false;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Residency Statuses")} ${e}`, "is-danger");
				});
		},

		async fetchReferralTypes() {
			await BeneficiariesService.getListOfReferralTypes()
				.then(({ data }) => {
					this.filtersOptions.referralTypes.loading = false;
					this.filtersOptions.referralTypes.data = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Referral Types")} ${e}`, "is-danger");
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
