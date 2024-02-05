<template>
	<AdvancedFilter
		v-if="admNames"
		ref="advancedFilter"
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="onFilterChanged"
		@search="$emit('search')"
	/>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import ProjectService from "@/services/ProjectService";
import AdvancedFilter from "@/components/AdvancedFilter";
import filtersHelper from "@/mixins/filtersHelper";
import locationHelper from "@/mixins/locationHelper";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import { copyObject } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { FILTER } from "@/consts";

// TODO fix gender, after select one option, gender is not visible, but filter still working
export default {
	name: "HouseholdsFilter",

	emits: ["search", "filtersChanged"],

	components: {
		AdvancedFilter,
	},

	mixins: [filtersHelper, urlFiltersHelper, locationHelper],

	props: {
		defaultFilters: {
			type: Object,
			default: () => ({
				projects: FILTER.DEFAULT_FILTERS.PROJECTS,
				vulnerabilities: FILTER.DEFAULT_FILTERS.VULNERABILITIES,
				gender: FILTER.DEFAULT_FILTERS.GENDER,
				residencyStatuses: FILTER.DEFAULT_FILTERS.RESIDENCY_STATUSES,
				referralTypes: FILTER.DEFAULT_FILTERS.PROJECTS.REFERRAL_TYPES,
				livelihoods: FILTER.DEFAULT_FILTERS.LIVELIHOODS,
				adm1: FILTER.DEFAULT_FILTERS.ADM1,
				adm2: FILTER.DEFAULT_FILTERS.ADM2,
				adm3: FILTER.DEFAULT_FILTERS.ADM3,
				adm4: FILTER.DEFAULT_FILTERS.ADM4,
				locations: FILTER.DEFAULT_FILTERS.LOCATIONS,
			}),
		},
	},

	data() {
		return {
			selectedFiltersOptions: copyObject(this.defaultFilters),
			filtersOptionsCopy: {},
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
			this.fetchProjects(),
			this.fetchProvinces(),
			this.fetchDistricts(),
			this.fetchCommunes(),
			this.fetchVillages(),
			this.fetchLivelihoods(),
			this.fetchVulnerabilities(),
			this.fetchResidenceStatuses(),
			this.fetchReferralTypes(),
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

		async onFilterChanged(filters, filterName) {
			const filtersCopy = await this.clearedLocationFilters(filters, filterName);
			const location = this.getLocation(filters);

			this.setAdmParents(filterName);
			this.filterAdmChildren(filterName);
			this.$refs.advancedFilter.$forceUpdate();

			this.$emit("filtersChanged", {
				filters: {
					projects: filters.projects,
					vulnerabilities: filters.vulnerabilities,
					gender: filters.gender ? filters.gender[0] : null,
					residencyStatuses: filters.residencyStatuses,
					referralTypes: filters.referralTypes,
					livelihoods: filters.livelihoods,
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

		async fetchProjects() {
			try {
				const { data: { data } } = await ProjectService.getShortListOfProjects();

				this.filtersOptions.projects.data = data;
				this.filtersOptions.projects.loading = false;
			} catch (e) {
				Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
			}
		},

		async fetchLivelihoods() {
			await BeneficiariesService.getListOfLivelihoods()
				.then(({ data }) => {
					this.filtersOptions.livelihoods.data = data;
					this.filtersOptions.livelihoods.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Livelihoods")} ${e.message || e}`, "error");
				});
		},

		async fetchVulnerabilities() {
			await BeneficiariesService.getListOfVulnerabilities()
				.then(({ data }) => {
					this.filtersOptions.vulnerabilities.data = data;
					this.filtersOptions.vulnerabilities.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Vulnerabilities")} ${e.message || e}`, "error");
				});
		},

		async fetchResidenceStatuses() {
			await BeneficiariesService.getListOfResidenceStatuses()
				.then(({ data }) => {
					this.filtersOptions.residencyStatuses.data = data;
					this.filtersOptions.residencyStatuses.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Residency Statuses")} ${e.message || e}`, "error");
				});
		},

		async fetchReferralTypes() {
			await BeneficiariesService.getListOfReferralTypes()
				.then(({ data }) => {
					this.filtersOptions.referralTypes.loading = false;
					this.filtersOptions.referralTypes.data = data;
				})
				.catch((e) => {
					Notification(`${this.$t("Referral Types")} ${e.message || e}`, "error");
				});
		},
	},
};
</script>
