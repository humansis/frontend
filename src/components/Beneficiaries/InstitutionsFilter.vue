<template>
	<AdvancedFilter
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="filterChanged"
		@search="$emit('search')"
	/>
</template>

<script>
import ProjectService from "@/services/ProjectService";
import AdvancedFilter from "@/components/AdvancedFilter";
import filtersHelper from "@/mixins/filtersHelper";
import { copyObject } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { FILTER } from "@/consts";

export default {
	name: "InstitutionsFilter",

	emits: [
		"search",
		"filtersChanged",
	],

	components: {
		AdvancedFilter,
	},

	mixins: [filtersHelper],

	props: {
		defaultFilters: {
			type: Object,
			default: () => ({
				projects: FILTER.DEFAULT_FILTERS.PROJECTS,
			}),
		},
	},

	data() {
		return {
			selectedFiltersOptions: copyObject(this.defaultFilters),
			filtersOptions: {
				projects: {
					name: "Project",
					placeholder: this.$t("Select Projects"),
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
			this.$emit("filtersChanged", { filters });
		},

		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.filtersOptions.projects.data = data;
				})
				.catch((e) => {
					Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
				});

			this.filtersOptions.projects.loading = false;
		},
	},
};
</script>
