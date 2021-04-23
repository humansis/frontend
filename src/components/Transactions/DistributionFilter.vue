<template>
	<AdvancedFilter
		multiline
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="filterChanged"
	/>
</template>

<script>
import ProjectService from "@/services/ProjectService";
import { Notification } from "@/utils/UI";
import LocationsService from "@/services/LocationsService";
import AdvancedFilter from "@/components/AdvancedFilter";
import AssistancesService from "@/services/AssistancesService";

export default {
	name: "DistributionFilter",

	components: { AdvancedFilter },

	data() {
		return {
			selectedFiltersOptions: {
				beneficiaryType: [],
				project: [],
				distribution: [],
				commodity: [],
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
			},
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

	created() {
		this.fetchProjects();
		this.fetchModality();
		this.fetchTargetType();
		this.fetchProvinces();
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
				case "project":
					this.selectedFiltersOptions.distribution = [];
					this.fetchAssistance();
					break;
				default: break;
			}
			let location = null;
			if (this.selectedFiltersOptions.adm4) {
				const [a] = filters.adm4;
				location = a;
			} else if (this.selectedFiltersOptions.adm3) {
				const [a] = filters.adm3;
				location = a;
			} else if (this.selectedFiltersOptions.adm2) {
				const [a] = filters.adm2;
				location = a;
			} else if (this.selectedFiltersOptions.adm1) {
				const [a] = filters.adm1;
				location = a;
			}
			this.$emit("filtersChanged", {
				projects: filters.project || [],
				types: filters.beneficiaryType || [],
				modalityTypes: filters.commodity || [],
				assistances: filters.distribution || [],
				locations: location ? [location] : [],
			});
		},

		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.filtersOptions.project.data = data;
					this.filtersOptions.project.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});
		},

		async fetchTargetType() {
			await AssistancesService.getTargetTypes()
				.then(({ data }) => {
					this.filtersOptions.beneficiaryType.data = data;
					this.filtersOptions.beneficiaryType.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});
		},

		async fetchModality() {
			await AssistancesService.getListOfModalities()
				.then(({ data }) => {
					this.filtersOptions.commodity.data = data;
					this.filtersOptions.commodity.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Modality")}${e}`, "is-danger");
				});
		},

		async fetchProvinces() {
			await LocationsService.getListOfAdm1()
				.then(({ data }) => {
					this.filtersOptions.adm1.data = data;
					this.filtersOptions.adm1.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Provinces")} ${e}`, "is-danger");
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
					Notification(`${this.$t("Districts")} ${e}`, "is-danger");
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
					Notification(`${this.$t("Communes")} ${e}`, "is-danger");
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
					Notification(`${this.$t("Villages")} ${e}`, "is-danger");
				});
		},

		async fetchAssistance() {
			this.filtersOptions.distribution.loading = true;

			this.selectedAssistanceForFilter = [];
			await AssistancesService.getListOfProjectAssistances(this.selectedFiltersOptions.project.id)
				.then(({ data }) => {
					this.filtersOptions.distribution.data = data;
					this.filtersOptions.distribution.loading = false;
				}).catch((e) => {
					Notification(`Project Assistances ${e}`, "is-danger");
				});
		},
	},
};
</script>
