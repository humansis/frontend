<template>
	<DataGrid
		ref="importsList"
		v-model:items-per-page="perPage"
		v-model:sort-by="sortValue"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		:custom-key-sort="customSort"
		reset-sort-button
		reset-filters-button
		is-search-visible
		@perPageChanged="onPerPageChange"
		@pageChanged="onPageChange"
		@update:sortBy="onSort"
		@search="onSearch"
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.IMPORTS)"
		@resetFilters="onResetFilters"
		@rowClicked="(row) => onGoToDetail(row.item)"
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				:required-permissions="PERMISSIONS.IMPORT_DETAIL"
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row)"
			/>

			<ButtonAction
				:required-permissions="PERMISSIONS.IMPORT_MANAGE"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row)"
			/>
		</template>

		<template v-slot:tableControls>
			<v-btn
				:append-icon="isAdvancedSearchVisible ? 'arrow-up' : 'arrow-down'"
				color="blue-grey-lighten-4"
				variant="elevated"
				class="ml-4 text-none"
				@click="onAdvancedSearchToggle"
			>
				{{ $t('Advanced Search') }}
			</v-btn>

			<v-btn
				:class="newButtonClass"
				variant="tonal"
				prepend-icon="sticky-note"
				@click="onStatusFilter(IMPORT.FILTERS.NEW, 'new')"
				@keydown.enter.prevent
			>
				{{ $t('New') }}
			</v-btn>

			<v-btn
				:class="inProgressButtonClass"
				variant="tonal"
				prepend-icon="sticky-note"
				@click="onStatusFilter(IMPORT.FILTERS.IN_PROGRESS, 'inProgress')"
				@keydown.enter.prevent
			>
				{{ $t('In Progress') }}
			</v-btn>

			<v-btn
				:class="finishedButtonClass"
				color="success"
				variant="tonal"
				prepend-icon="sticky-note"
				@click="onStatusFilter(IMPORT.FILTERS.FINISHED, 'finished')"
				@keydown.enter.prevent
			>
				{{ $t('Finished') }}
			</v-btn>

			<v-btn
				:class="canceledButtonClass"
				variant="tonal"
				prepend-icon="sticky-note"
				@click="onStatusFilter(IMPORT.FILTERS.CANCELED, 'canceled')"
				@keydown.enter.prevent
			>
				{{ $t('Canceled') }}
			</v-btn>
		</template>

		<template v-slot:advancedControls>
			<v-expansion-panels v-model="visiblePanels">
				<v-expansion-panel value="advancedSearch" eager>
					<v-expansion-panel-text>
						<ImportsFilter
							ref="importFilter"
							@filtersChanged="onFiltersChange"
							@search="onSearch(table.searchPhrase)"
						/>
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
		</template>
	</DataGrid>
</template>

<script>
import ImportService from "@/services/ImportService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import ImportsFilter from "@/components/Imports/ImportsFilter";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { IMPORT, TABLE } from "@/consts";

const customSort = { status: () => {} };
const statusTags = [
	{ code: IMPORT.STATUS.NEW, class: "status new" },
	{ code: IMPORT.STATUS.INTEGRITY_CHECK, class: "status check" },
	{ code: IMPORT.STATUS.INTEGRITY_CHECK_CORRECT, class: "status correct" },
	{ code: IMPORT.STATUS.INTEGRITY_CHECK_FAILED, class: "status failed" },
	{ code: IMPORT.STATUS.IDENTITY_CHECK, class: "status check" },
	{ code: IMPORT.STATUS.IDENTITY_CHECK_CORRECT, class: "status correct" },
	{ code: IMPORT.STATUS.IDENTITY_CHECK_FAILED, class: "status failed" },
	{ code: IMPORT.STATUS.SIMILARITY_CHECK, class: "status check" },
	{ code: IMPORT.STATUS.SIMILARITY_CHECK_CORRECT, class: "status correct" },
	{ code: IMPORT.STATUS.SIMILARITY_CHECK_FAILED, class: "status failed" },
	{ code: IMPORT.STATUS.FINISH, class: "status finished" },
	{ code: IMPORT.STATUS.CANCEL, class: "status canceled" },
	{ code: IMPORT.STATUS.AUTOMATICALLY_CANCELED, class: "status canceled" },
	{ code: IMPORT.STATUS.IMPORTING, class: "status importing" },
	{ code: IMPORT.STATUS.UPLOADING, class: "status uploading" },
];

export default {
	name: "ProjectList",

	components: {
		DataGrid,
		ImportsFilter,
		ButtonAction,
	},

	mixins: [
		grid,
		baseHelper,
		permissions,
	],

	data() {
		return {
			IMPORT,
			TABLE,
			customSort,
			statusActive: {
				new: false,
				inProgress: false,
				finished: false,
				canceled: false,
			},
			isLoadingList: false,
			visiblePanels: [],
			filters: [],
			table: {
				data: [],
				columns: generateColumns([
					{ key: "id" },
					{ key: "title" },
					{ key: "project", sortKey: "project", width: "400" },
					{ key: "status", type: "tag", customTags: statusTags },
					{ key: "createdBy" },
					{ key: "createdAt", type: "datetime" },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.IMPORTS.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.IMPORTS.key,
				searchPhrase: "",
				filtersInProgress: [
					IMPORT.STATUS.INTEGRITY_CHECK,
					IMPORT.STATUS.INTEGRITY_CHECK_CORRECT,
					IMPORT.STATUS.INTEGRITY_CHECK_FAILED,
					IMPORT.STATUS.IDENTITY_CHECK,
					IMPORT.STATUS.IDENTITY_CHECK_CORRECT,
					IMPORT.STATUS.IDENTITY_CHECK_FAILED,
					IMPORT.STATUS.SIMILARITY_CHECK,
					IMPORT.STATUS.SIMILARITY_CHECK_CORRECT,
					IMPORT.STATUS.SIMILARITY_CHECK_FAILED,
					IMPORT.STATUS.IMPORTING,
				],
				filtersCanceled: [
					IMPORT.STATUS.CANCEL,
					IMPORT.STATUS.AUTOMATICALLY_CANCELED,
				],
			},
		};
	},

	computed: {
		newButtonClass() {
			return [
				"text-none ml-3 status new",
				{ "is-selected": this.statusActive.new },
			];
		},

		inProgressButtonClass() {
			return [
				"text-none ml-3 status in-progress",
				{ "is-selected": this.statusActive.inProgress },
			];
		},

		finishedButtonClass() {
			return [
				"text-none ml-3 status finished",
				{ "is-selected": this.statusActive.finished },
			];
		},

		canceledButtonClass() {
			return [
				"text-none ml-3 status canceled",
				{ "is-selected": this.statusActive.canceled },
			];
		},

		isAdvancedSearchVisible() {
			return this.visiblePanels.includes("advancedSearch");
		},
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				this.isLoadingList = true;

				const sort = this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "";
				const {
					data: { data, totalCount },
					status,
					message,
				} = await ImportService.getListOfImports({
					page: this.table.currentPage,
					size: this.perPage,
					search: this.table.searchPhrase,
					filters: this.filters,
					sort,
				});

				this.table.data = [];
				this.table.progress = 0;

				checkResponseStatus(status, message);

				this.table.total = totalCount;

				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			} catch (e) {
				Notification(`${this.$t("Imports")}: ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},

		onStatusFilter(filter, propName) {
			let newStatusFilter = [];

			this.statusActive[propName] = true;

			if (this.statusActive[propName]) {
				Object.keys(this.statusActive).forEach((key) => {
					if (key !== propName) {
						this.statusActive[key] = false;
					}
				});
			}

			switch (filter) {
				case IMPORT.FILTERS.IN_PROGRESS:
					newStatusFilter = this.table.filtersInProgress;
					break;
				case IMPORT.FILTERS.CANCELED:
					newStatusFilter = this.table.filtersCanceled;
					break;
				default:
					newStatusFilter = [filter];
			}
			this.onFiltersChange({ projects: [], status: newStatusFilter });
		},

		async onFiltersChange(selectedFilters) {
			this.filters = selectedFilters.filters || selectedFilters;
			this.table.currentPage = 1;
			await this.fetchData();
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].test = item.status;
			});

			const test = this.table.data;
			this.table.data = [];
			this.table.data = [...test];
			this.table.progress = 50;

			this.prepareProjectsForTable();
			this.prepareUsersForTable();
		},

		prepareProjectsForTable() {
			this.table.data.forEach((item, key) => {
				this.table.data[key].project = item.projects.map(({ name }) => name).join(", ");
			});

			this.table.progress = 75;
			this.reload();
		},

		prepareUsersForTable() {
			this.table.data.forEach((item, key) => {
				this.table.data[key].createdBy = item.createdBy.email;
			});
			this.table.progress = 100;
			this.reload();
		},

		onAdvancedSearchToggle() {
			this.visiblePanels = this.isAdvancedSearchVisible ? [] : ["advancedSearch"];
		},

		onResetFilters() {
			Object.keys(this.statusActive).forEach((key) => {
				this.statusActive[key] = false;
			});

			this.resetSearch({ tableRef: "importsList", filtersRef: "importFilter" });
		},

		onGoToDetail(importItem) {
			if (!this.isUserPermissionGranted(this.PERMISSIONS.IMPORT_MANAGE)) return;

			let slug = "";

			switch (importItem.status) {
				case IMPORT.STATUS.INTEGRITY_CHECK:
				case IMPORT.STATUS.INTEGRITY_CHECK_CORRECT:
				case IMPORT.STATUS.INTEGRITY_CHECK_FAILED:
					slug = "integrity-check";
					break;
				case IMPORT.STATUS.IDENTITY_CHECK:
				case IMPORT.STATUS.IDENTITY_CHECK_CORRECT:
				case IMPORT.STATUS.IDENTITY_CHECK_FAILED:
					slug = "identity-check";
					break;
				case IMPORT.STATUS.SIMILARITY_CHECK:
				case IMPORT.STATUS.SIMILARITY_CHECK_FAILED:
				case IMPORT.STATUS.SIMILARITY_CHECK_CORRECT:
					slug = "similarity-check";
					break;
				case IMPORT.STATUS.FINISH:
				case IMPORT.STATUS.IMPORTING:
					slug = "finalisation";
					break;
				case IMPORT.STATUS.NEW:
				case IMPORT.STATUS.CANCEL:
				default:
					slug = "start-import";
			}

			this.$router.push({
				name: "Import",
				params: { importId: importItem.id },
				query: { step: slug },
			});
		},
	},
};
</script>
