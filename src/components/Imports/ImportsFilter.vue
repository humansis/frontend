<template>
	<AdvancedFilter
		ref="advancedFilter"
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="onFilterChanged"
		@search="$emit('search')"
	/>
</template>

<script>
import ProjectService from "@/services/ProjectService";
import AdvancedFilter from "@/components/AdvancedFilter";
import filtersHelper from "@/mixins/filtersHelper";
import { checkResponseStatus } from "@/utils/fetcher";
import { copyObject } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { FILTER, IMPORT } from "@/consts";

export default {
	name: "ImportsFilter",

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
				status: FILTER.DEFAULT_FILTERS.STATUS,
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
		onFilterChanged(filters) {
			this.$emit("filtersChanged", { filters });
		},

		async fetchProjects() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await ProjectService.getShortListOfProjects();

				checkResponseStatus(status, message);

				this.filtersOptions.projects.data = data;
			} catch (e) {
				Notification(`${this.$t("Projects")}: ${e.message || e}`, "error");
			} finally {
				this.filtersOptions.projects.loading = false;
			}
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
