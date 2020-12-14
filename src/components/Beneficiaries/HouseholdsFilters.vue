<template>
	<div class="mb-5">
		<div class="columns is-multiline">
			<div v-for="(options, filter) in filtersOptions" :key="filter" class="column is-half">
				<b-field :label="options.name">
					<MultiSelect
						v-model="selectedFiltersOptions[filter]"
						searchable
						:label="options.label || 'value'"
						:track-by="options.trackBy || 'code'"
						:multiple="options.multiple"
						:placeholder="options.placeholder || 'Select ...'"
						:options="options.data"
						@input="filterChanged(filter)"
					>
						<template
							slot="singleLabel"
							slot-scope="options"
						>
							{{ options.option.name }}
						</template>
					</MultiSelect>
				</b-field>
			</div>
		</div>
	</div>
</template>

<script>
import { Toast } from "@/utils/UI";
import ProjectsService from "@/services/ProjectsService";
import LocationsService from "@/services/LocationsService";
import BeneficiariesService from "@/services/BeneficiariesService";

export default {
	name: "HouseholdsFilters",

	data() {
		return {
			selectedFiltersOptions: {
				projects: [],
				vulnerabilities: [],
				gender: [],
				residencies: [],
				referrals: [],
				livelihoods: [],
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
			},
			filtersOptions: {
				projects: {
					name: "Project",
					placeholder: "Select Project",
					multiple: true,
					trackBy: "id",
					label: "name",
					data: [],
				},
				vulnerabilities: {
					name: "Vulnerability",
					placeholder: "Select Vulnerability",
					multiple: true,
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
				residencies: {
					name: "Residence Status",
					placeholder: "Select Residence",
					multiple: true,
					data: [],
				},
				// TODO get from api
				referrals: {
					name: "Referral",
					placeholder: "Select Referral",
					multiple: true,
					data: [
						{
							code: "health",
							value: "Health",
						},
						{
							code: "protection",
							value: "Protection",
						},
						{
							code: "shelter",
							value: "Shelter",
						},
						{
							code: "nutrition",
							value: "Nutrition",
						},
						{
							code: "other",
							value: "Other",
						},
					],
				},
				livelihoods: {
					name: "Livelihood",
					placeholder: "Select Livelihood",
					multiple: true,
					data: [],
				},
				adm1: {
					name: "Province",
					placeholder: "Select Province",
					trackBy: "id",
					label: "name",
					data: [],
				},
				adm2: {
					name: "District",
					placeholder: "Select District",
					trackBy: "id",
					label: "name",
					data: [],
				},
				adm3: {
					name: "Commune",
					placeholder: "Select Commune",
					trackBy: "id",
					label: "name",
					data: [],
				},
				adm4: {
					name: "Village",
					placeholder: "Select Village",
					trackBy: "id",
					label: "name",
					data: [],
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
	},

	methods: {
		filterChanged(filter) {
			switch (filter) {
				case "adm1":
					this.fetchDistricts(this.selectedFiltersOptions[filter].id);
					break;
				case "adm2":
					this.fetchCommunes(this.selectedFiltersOptions[filter].id);
					break;
				case "adm3":
					this.fetchVillages(this.selectedFiltersOptions[filter].id);
					break;
				default: break;
			}
			this.$emit("filtersChanged", this.selectedFiltersOptions);
		},

		async fetchProjects() {
			await ProjectsService.getListOfProjects()
				.then((response) => { this.filtersOptions.projects.data = response.data; })
				.catch((e) => {
					Toast(`(Projects) ${e}`, "is-danger");
				});
		},

		async fetchProvinces() {
			await LocationsService.getListOfAdm1()
				.then((response) => { this.filtersOptions.adm1.data = response.data; })
				.catch((e) => {
					Toast(`(Provinces) ${e}`, "is-danger");
				});
		},

		async fetchDistricts(id) {
			await LocationsService.getListOfAdm2(id)
				.then((response) => { this.filtersOptions.adm2.data = response.data; })
				.catch((e) => {
					Toast(`(Districts) ${e}`, "is-danger");
				});
		},

		async fetchCommunes(id) {
			await LocationsService.getListOfAdm3(id)
				.then((response) => { this.filtersOptions.adm3.data = response.data; })
				.catch((e) => {
					Toast(`(Communes) ${e}`, "is-danger");
				});
		},

		async fetchVillages(id) {
			await LocationsService.getListOfAdm4(id)
				.then((response) => { this.filtersOptions.adm4.data = response.data; })
				.catch((e) => {
					Toast(`(Villages) ${e}`, "is-danger");
				});
		},

		async fetchLivelihoods() {
			await BeneficiariesService.getListOfLivelihoods()
				.then((response) => { this.filtersOptions.livelihoods.data = response.data; })
				.catch((e) => {
					Toast(`(Livelihoods) ${e}`, "is-danger");
				});
		},

		async fetchVulnerabilities() {
			await BeneficiariesService.getListOfVulnerabilities()
				.then((response) => { this.filtersOptions.vulnerabilities.data = response.data; })
				.catch((e) => {
					Toast(`(Vulnerability) ${e}`, "is-danger");
				});
		},

		async fetchResidenceStatuses() {
			await BeneficiariesService.getListOfResidenceStatuses()
				.then((response) => { this.filtersOptions.residencies.data = response.data; })
				.catch((e) => {
					Toast(`(Residence Status) ${e}`, "is-danger");
				});
		},
	},
};
</script>
