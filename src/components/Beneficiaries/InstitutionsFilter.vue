<template>
	<AdvancedFilter
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
		onFilterChanged(filters) {
			this.$emit("filtersChanged", filters);
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
	},
};
</script>
