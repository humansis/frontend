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
					data: [
						{ code: IMPORT.STATUS.NEW, value: this.$t(IMPORT.STATUS.NEW) },
						{ code: IMPORT.STATUS.INTEGRITY_CHECK, value: this.$t(IMPORT.STATUS.INTEGRITY_CHECK) },
						{
							code: IMPORT.STATUS.INTEGRITY_CHECK_CORRECT,
							value: this.$t(IMPORT.STATUS.INTEGRITY_CHECK_CORRECT),
						},
						{
							code: IMPORT.STATUS.INTEGRITY_CHECK_FAILED,
							value: this.$t(IMPORT.STATUS.INTEGRITY_CHECK_FAILED),
						},
						{ code: IMPORT.STATUS.IDENTITY_CHECK, value: this.$t(IMPORT.STATUS.IDENTITY_CHECK) },
						{
							code: IMPORT.STATUS.INTEGRITY_CHECK_CORRECT,
							value: this.$t(IMPORT.STATUS.INTEGRITY_CHECK_CORRECT),
						},
						{
							code: IMPORT.STATUS.IDENTITY_CHECK_FAILED,
							value: this.$t(IMPORT.STATUS.IDENTITY_CHECK_FAILED),
						},
						{
							code: IMPORT.STATUS.SIMILARITY_CHECK,
							value: this.$t(IMPORT.STATUS.SIMILARITY_CHECK),
						},
						{
							code: IMPORT.STATUS.SIMILARITY_CHECK_CORRECT,
							value: this.$t(IMPORT.STATUS.SIMILARITY_CHECK_CORRECT),
						},
						{
							code: IMPORT.STATUS.SIMILARITY_CHECK_FAILED,
							value: this.$t(IMPORT.STATUS.SIMILARITY_CHECK_FAILED),
						},
						{ code: IMPORT.STATUS.FINISH, value: this.$t(IMPORT.STATUS.FINISH) },
						{ code: IMPORT.STATUS.CANCEL, value: this.$t(IMPORT.STATUS.CANCEL) },
						{
							code: IMPORT.STATUS.AUTOMATICALLY_CANCELED,
							value: this.$t(IMPORT.STATUS.AUTOMATICALLY_CANCELED),
						},
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
	},
};
</script>
