<template>
	<AdvancedFilter
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="filterChanged"
	/>
</template>

<script>
import ProjectsService from "@/services/ProjectsService";
import { Notification } from "@/utils/UI";
import AdvancedFilter from "@/components/AdvancedFilter";

export default {
	name: "CommunitiesFilter",

	components: {
		AdvancedFilter,
	},

	data() {
		return {
			selectedFiltersOptions: {
				projects: [],
			},
			filtersOptions: {
				projects: {
					name: "Project",
					placeholder: "Select Projects",
					trackBy: "id",
					label: "name",
					multiple: true,
					loading: true,
					data: [],
				},
			},
		};
	},

	mounted() {
		this.fetchProjects();
	},

	methods: {
		filterChanged(filters) {
			this.$emit("filtersChanged", filters);
		},

		async fetchProjects() {
			await ProjectsService.getListOfProjects()
				.then(({ data }) => {
					this.filtersOptions.projects.data = data;
				})
				.catch((e) => {
					Notification(`Projects ${e}`, "is-danger");
				});

			this.filtersOptions.projects.loading = false;
		},
	},
};
</script>
