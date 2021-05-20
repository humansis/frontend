<template>
	<AdvancedFilter
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="filterChanged"
	/>
</template>

<script>
import AdvancedFilter from "@/components/AdvancedFilter";
import { Notification } from "@/utils/UI";
import ProjectService from "@/services/ProjectService";

export default {
	name: "ImportsFilter",

	components: {
		AdvancedFilter,
	},

	data() {
		return {
			selectedFiltersOptions: {
				projects: [],
				status: [],
			},
			filtersOptions: {
				project: {
					name: "Project",
					trackBy: "id",
					label: "name",
					loading: true,
					placeholder: this.$t("Select Project"),
					data: [],
				},
				status: {
					name: "Status",
					placeholder: this.$t("Select Status"),
					multiple: true,
					data: [
						{ code: "new", value: this.$t("New") },
						{ code: "inProgress", value: this.$t("In Progress") },
						{ code: "done", value: this.$t("Done") },
						{ code: "Canceled", value: this.$t("Canceled") },
					],
				},
			},
		};
	},

	created() {
		this.fetchProjects();
	},

	methods: {
		filterChanged(filters) {
			this.$emit("filtersChanged", filters);
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
	},
};
</script>
