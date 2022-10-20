<template>
	<AdvancedFilter
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="filterChanged"
	/>
</template>

<script>
import ProjectService from "@/services/ProjectService";
import { Notification } from "@/utils/UI";
import AdvancedFilter from "@/components/AdvancedFilter";
import filtersHelper from "@/mixins/filtersHelper";
import { copyObject } from "@/utils/helpers";

export default {
	name: "InstitutionsFilter",

	components: {
		AdvancedFilter,
	},

	mixins: [filtersHelper],

	props: {
		defaultFilters: {
			type: Object,
			default: () => ({
				projects: [],
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
			this.$emit("filtersChanged", filters);
		},

		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.filtersOptions.projects.data = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});

			this.filtersOptions.projects.loading = false;
		},
	},
};
</script>
