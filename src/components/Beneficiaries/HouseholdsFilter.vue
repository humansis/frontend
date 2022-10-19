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
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import transactionHelper from "@/mixins/transactionHelper";

const DEFAULT_FILTERS = {
	projects: [],
	vulnerabilities: [],
	gender: [],
	residencyStatuses: [],
	referralTypes: [],
	livelihoods: [],
	adm1: null,
	adm2: null,
	adm3: null,
	adm4: null,
	locations: [],
};

// TODO fix gender, after select one option, gender is not visible, but filter still working
export default {
	name: "HouseholdsFilter",

	components: {
		AdvancedFilter,
	},

	mixins: [urlFiltersHelper, transactionHelper],

	data() {
		return {
			selectedFiltersOptions: { ...DEFAULT_FILTERS },
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
		});

		await Promise.all([
			this.setDefaultFilters(),
			this.setDefaultLocationsFilter(),
		]);
	},

	methods: {
		/* TODO move fillParent methods to urlFiltersHelper? */
		fillParentCommunes() {
			this.filtersOptions.adm4.data.forEach((item, index) => {
				if (item.hasDuplicity) {
					const parentLocation = this.filtersOptions.adm3.data
						.filter((item2) => item2.id === item.parentId)[0];

					this.filtersOptions.adm4.data[index].parentLocationName = parentLocation.name;
				}
			});
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

			let location = [];

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

			this.setAdmParents(filterName);

			this.$emit("filtersChanged", {
				filters: {
					projects: filters.projects,
					vulnerabilities: filters.vulnerabilities,
					gender: filters.gender ? filters.gender[0] : null,
					residencyStatuses: filters.residencyStatuses,
					referralTypes: filters.referralTypes,
					livelihoods: filters.livelihoods,
					locations: location,
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
			this.selectedFiltersOptions = { ...DEFAULT_FILTERS };
			this.$nextTick(() => {
				this.$refs.advancedFilter.filterChanged();
			});
		},
	},
};
</script>
