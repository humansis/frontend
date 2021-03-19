<template>
	<AdvancedFilter
		multiline
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="filterChanged"
	/>
</template>

<script>
import AdvancedFilter from "@/components/AdvancedFilter";
import ProjectService from "@/services/ProjectService";
import LocationsService from "@/services/LocationsService";
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
// TODO fix gender, after select one option, gender is not visible, but filter still working
export default {
	name: "HouseholdsFilters",

	components: {
		AdvancedFilter,
	},

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
					placeholder: "Select Project",
					multiple: true,
					trackBy: "id",
					label: "name",
					loading: true,
					data: [],
				},
				vulnerabilities: {
					name: "Vulnerability",
					placeholder: "Select Vulnerability",
					multiple: true,
					loading: true,
					data: [],
				},
				gender: {
					name: "Gender",
					placeholder: "Select Gender",
					data: [
						{ code: "M", value: "Male" },
						{ code: "F", value: "Female" },
					],
				},
				residencyStatuses: {
					name: "Residence Status",
					placeholder: "Select Residence",
					multiple: true,
					loading: true,
					data: [],
				},
				referralTypes: {
					name: "Referral",
					placeholder: "Select Referral",
					multiple: true,
					loading: true,
					data: [],
				},
				livelihoods: {
					name: "Livelihood",
					placeholder: "Select Livelihood",
					multiple: true,
					loading: true,
					data: [],
				},
				adm1: {
					name: "Province",
					placeholder: "Select Province",
					trackBy: "id",
					label: "name",
					loading: true,
					data: [],
					selectValue: "locationId",
					filterForSend: "locations",
				},
				adm2: {
					name: "District",
					placeholder: "Select District",
					trackBy: "id",
					label: "name",
					data: [],
					selectValue: "locationId",
				},
				adm3: {
					name: "Commune",
					placeholder: "Select Commune",
					trackBy: "id",
					label: "name",
					data: [],
					selectValue: "locationId",
				},
				adm4: {
					name: "Village",
					placeholder: "Select Village",
					trackBy: "id",
					label: "name",
					data: [],
					selectValue: "locationId",
				},
			},
		};
	},

	mounted() {
		this.fetchProjects();
		this.fetchProvinces();
		this.fetchLivelihoods();
		this.fetchVulnerabilities();
		this.fetchResidenceStatuses();
		this.fetchReferralTypes();
	},

	methods: {
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
				projects: filters.projects,
				vulnerabilities: filters.vulnerabilities,
				gender: filters.gender ? filters.gender[0] : null,
				residencyStatuses: filters.residencyStatuses,
				referralTypes: filters.referralTypes,
				livelihoods: filters.livelihoods,
				locations: location ? [location] : [],
			});
		},

		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.filtersOptions.projects.data = data;
					this.filtersOptions.projects.loading = false;
				})
				.catch((e) => {
					Notification(`Projects ${e}`, "is-danger");
				});
		},

		async fetchProvinces() {
			await LocationsService.getListOfAdm1()
				.then(({ data }) => {
					this.filtersOptions.adm1.data = data;
					this.filtersOptions.adm1.loading = false;
				})
				.catch((e) => {
					Notification(`Provinces ${e}`, "is-danger");
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
					Notification(`Districts ${e}`, "is-danger");
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
					Notification(`Communes ${e}`, "is-danger");
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
					Notification(`Villages ${e}`, "is-danger");
				});
		},

		async fetchLivelihoods() {
			await BeneficiariesService.getListOfLivelihoods()
				.then(({ data }) => {
					this.filtersOptions.livelihoods.data = data;
					this.filtersOptions.livelihoods.loading = false;
				})
				.catch((e) => {
					Notification(`Livelihoods ${e}`, "is-danger");
				});
		},

		async fetchVulnerabilities() {
			await BeneficiariesService.getListOfVulnerabilities()
				.then(({ data }) => {
					this.filtersOptions.vulnerabilities.data = data;
					this.filtersOptions.vulnerabilities.loading = false;
				})
				.catch((e) => {
					Notification(`Vulnerability ${e}`, "is-danger");
				});
		},

		async fetchResidenceStatuses() {
			await BeneficiariesService.getListOfResidenceStatuses()
				.then(({ data }) => {
					this.filtersOptions.residencyStatuses.data = data;
					this.filtersOptions.residencyStatuses.loading = false;
				})
				.catch((e) => {
					Notification(`Residence Status ${e}`, "is-danger");
				});
		},

		async fetchReferralTypes() {
			await BeneficiariesService.getListOfReferralTypes()
				.then(({ data }) => {
					this.filtersOptions.referralTypes.loading = false;
					this.filtersOptions.referralTypes.data = data;
				})
				.catch((e) => {
					Notification(`Referral Types ${e}`, "is-danger");
				});
		},
	},
};
</script>
