<template>
	<DataGrid
		v-model:items-per-page="perPage"
		v-model:sort-by="sortValue"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		reset-sort-button
		is-search-visible
		@perPageChanged="onPerPageChange"
		@pageChanged="onPageChange"
		@update:sortBy="onSort"
		@search="onSearch"
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.PROJECTS)"
		@rowClicked="onGoToDetail"
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row.id)"
			/>

			<ButtonAction
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row.id)"
			/>

			<ButtonAction
				:disabled="!row.deletable"
				icon="trash"
				tooltip-text="Delete"
				icon-color="red"
				confirm-title="Deleting Project"
				confirm-message="Are you sure sure you want to delete Project?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				is-confirm-action
				@actionConfirmed="onRemove(row.id)"
			/>
		</template>

		<template v-slot:tableControls>
			<ExportControl
				:disabled="!table.data.length"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				@export="onExportProjects"
			/>
		</template>
	</DataGrid>
</template>

<script>
import { mapState } from "vuex";
import ProjectService from "@/services/ProjectService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import ExportControl from "@/components/Inputs/ExportControl";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, TABLE } from "@/consts";

export default {
	name: "ProjectList",

	components: {
		ExportControl,
		DataGrid,
		ButtonAction,
	},

	mixins: [permissions, grid, baseHelper],

	data() {
		return {
			TABLE,
			isLoadingList: false,
			exportControl: {
				loading: false,
				location: "projects",
				types: [EXPORT.PROJECTS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			table: {
				data: [],
				columns: generateColumns([
					{ key: "id" },
					{ key: "name" },
					{ key: "sectors", type: "svgIcon", minWidth: "200", sortable: false },
					{ key: "startDate", type: "date" },
					{ key: "endDate", type: "date" },
					{ key: "donors" },
					{ key: "numberOfHouseholds", title: "Registered Households" },
					{ key: "beneficiariesReached", title: "Registered Individuals" },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.PROJECTS.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.PROJECTS.key,
				searchPhrase: "",
			},
		};
	},

	computed: {
		...mapState(["availableProjects"]),
	},

	watch: {
		$route: "fetchData",
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			await ProjectService.getListOfProjects(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "",
				null,
				this.table.searchPhrase,
			).then(async ({ data, totalCount }) => {
				this.table.data = [];
				this.table.total = totalCount;
				if (data.length > 0) {
					this.prepareDataForTable(data);
				}
			}).catch((e) => {
				Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
			});

			this.isLoadingList = false;
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].donors = this.prepareDonors(item);
				this.table.data[key].sectors = item.sectors
					.map((sector) => ({ code: sector, value: sector }));
			});
		},

		prepareDonors(item) {
			if (!item.donors.length) return this.$t("None");

			return item.donors.map((donor) => donor.shortname).join(", ");
		},

		onGoToDetail({ item: { id } }) {
			if (this.userCan.viewProject) {
				this.$router.push({ name: "Project", params: { projectId: id } });
			}
		},

		async onExportProjects(exportType, format) {
			if (exportType === EXPORT.PROJECTS) {
				try {
					this.exportControl.loading = true;

					const filters = { ...(this.table.searchPhrase && { fulltext: this.table.searchPhrase }) };
					const filename = `Projects ${normalizeExportDate()}`;
					const { data, status, message } = await ProjectService.exportProjects(
						format,
						filters,
					);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Projects")} ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>
