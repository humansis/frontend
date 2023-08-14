<template>
	<AdvancedFilter
		ref="advancedFilter"
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="filterChanged"
		@onSearch="$emit('onSearch')"
	/>
</template>

<script>
import AdvancedFilter from "@/components/AdvancedFilter";
import { Notification } from "@/utils/UI";
import ProjectService from "@/services/ProjectService";
import filtersHelper from "@/mixins/filtersHelper";
import { copyObject } from "@/utils/helpers";
import consts from "@/utils/filterConst";
import { IMPORT } from "@/consts";

export default {
	name: "ImportsFilter",

	components: {
		AdvancedFilter,
	},

	mixins: [filtersHelper],

	props: {
		defaultFilters: {
			type: Object,
			default: () => ({
				projects: consts.DEFAULT_FILTERS.PROJECTS,
				status: consts.DEFAULT_FILTERS.STATUS,
			}),
		},
	},

	data() {
		return {
			selectedFiltersOptions: copyObject(this.defaultFilters),
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
					data: this.getImportStatusSelectData(),
				},
			},
		};
	},

	created() {
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
					this.filtersOptions.projects.loading = false;
				})
				.catch((e) => {
					Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});
		},

		getImportStatusSelectData() {
			const forbiddenStatusFilters = [IMPORT.STATUS.UPLOADING, IMPORT.STATUS.IMPORTING];

			return Object.values(IMPORT.STATUS)
				.filter((status) => !forbiddenStatusFilters.includes(status))
				.map((status) => ({ code: status, value: this.$t(status) }));
		},

	},
};
</script>
