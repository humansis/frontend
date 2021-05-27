<template>
	<AdvancedFilter
		ref="advancedFilter"
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
				projects: {
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
					multiple: false,
					data: [
						{ code: "New", value: this.$t("New") },
						{ code: "Integrity Checking", value: this.$t("Integrity Checking") },
						{ code: "Integrity Check Correct", value: this.$t("Integrity Check Correct") },
						{ code: "Integrity Check Failed", value: this.$t("Integrity Check Failed") },
						{ code: "Identity Checking", value: this.$t("Identity Checking") },
						{ code: "Identity Check Correct", value: this.$t("Identity Check Correct") },
						{ code: "Identity Check Failed", value: this.$t("Identity Check Failed") },
						{ code: "Similarity Checking", value: this.$t("Similarity Checking") },
						{ code: "Similarity Check Correct", value: this.$t("Similarity Check Correct") },
						{ code: "Similarity Check Failed", value: this.$t("Similarity Check Failed") },
						{ code: "Finished", value: this.$t("Finished") },
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
			console.log(filters);
			this.$emit("filtersChanged", filters);
		},

		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.filtersOptions.projects.data = data;
					this.filtersOptions.projects.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});
		},

		eraseFilters() {
			this.selectedFiltersOptions = {
				projects: [],
				status: [],
			};
			this.$nextTick(() => {
				this.$refs.advancedFilter.filterChanged();
			});
		},
	},
};
</script>
