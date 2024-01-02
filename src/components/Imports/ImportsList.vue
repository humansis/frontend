<template>
	<DataGrid
		ref="importsList"
		v-model:items-per-page="perPage"
		v-model:sort-by="sortValue"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
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
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row)"
			/>

			<ButtonAction
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
				color="gray-darken-4"
				variant="tonal"
				class="ml-0"
				prepend-icon="sticky-note"
				@click="onStatusFilter(IMPORT.FILTERS.NEW, 'new')"
				@keydown.enter.prevent
			>
				{{ $t('New') }}
			</v-btn>

			<v-btn
				:class="inProgressButtonClass"
				color="green-darken-4"
				variant="tonal"
				class="ml-0"
				prepend-icon="sticky-note"
				@click="onStatusFilter(IMPORT.FILTERS.IN_PROGRESS, 'inProgress')"
				@keydown.enter.prevent
			>
				{{ $t('In Progress') }}
			</v-btn>

			<v-btn
				:class="finishedButtonClass"
				class="ml-0"
				color="red-darken-1"
				variant="tonal"
				prepend-icon="sticky-note"
				@click="onStatusFilter(IMPORT.FILTERS.FINISHED, 'finished')"
				@keydown.enter.prevent
			>
				{{ $t('Finished') }}
			</v-btn>

			<v-btn
				:class="canceledButtonClass"
				class="ml-0"
				color="amber-lighten-1"
				variant="tonal"
				prepend-icon="sticky-note"
				@click="onStatusFilter(IMPORT.FILTERS.CANCELED, 'canceled')"
				@keydown.enter.prevent
			>
				{{ $t('Canceled') }}
			</v-btn>
		</template>

		<template v-slot:advancedControls>
			<v-expansion-panels v-model="isAdvancedSearchVisible">
				<v-expansion-panel :value="true" eager>
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
import { generateColumns } from "@/utils/datagrid";
import { IMPORT, TABLE } from "@/consts";

const statusTags = [
	{ code: IMPORT.STATUS.NEW, type: "grey-lighten-2" },
	{ code: IMPORT.STATUS.INTEGRITY_CHECK, type: "info" },
	{ code: IMPORT.STATUS.INTEGRITY_CHECK_CORRECT, type: "success" },
	{ code: IMPORT.STATUS.INTEGRITY_CHECK_FAILED, type: "error" },
	{ code: IMPORT.STATUS.IDENTITY_CHECK, type: "info" },
	{ code: IMPORT.STATUS.IDENTITY_CHECK_CORRECT, type: "success" },
	{ code: IMPORT.STATUS.IDENTITY_CHECK_FAILED, type: "error" },
	{ code: IMPORT.STATUS.SIMILARITY_CHECK, type: "info" },
	{ code: IMPORT.STATUS.SIMILARITY_CHECK_CORRECT, type: "success" },
	{ code: IMPORT.STATUS.SIMILARITY_CHECK_FAILED, type: "error" },
	{ code: IMPORT.STATUS.FINISH, type: "success" },
	{ code: IMPORT.STATUS.CANCEL, type: "warning" },
	{ code: IMPORT.STATUS.AUTOMATICALLY_CANCELED, type: "warning" },
	{ code: IMPORT.STATUS.IMPORTING, type: "warning" },
];

export default {
	name: "ProjectList",

	components: {
		DataGrid,
		ImportsFilter,
		ButtonAction,
	},

	mixins: [grid, baseHelper],

	data() {
		return {
			IMPORT,
			TABLE,
			statusActive: {
				new: false,
				inProgress: false,
				finished: false,
				canceled: false,
			},
			isLoadingList: false,
			isAdvancedSearchVisible: false,
			filters: [],
			table: {
				data: [],
				columns: generateColumns([
					{ key: "id" },
					{ key: "title" },
					{ key: "project", label: "Project", sortKey: "project" },
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
				"btn ml-3",
				{ "is-selected": this.statusActive.new },
			];
		},

		inProgressButtonClass() {
			return [
				"btn ml-3",
				{ "is-selected": this.statusActive.inProgress },
			];
		},

		finishedButtonClass() {
			return [
				"btn ml-3",
				{ "is-selected": this.statusActive.finished },
			];
		},

		canceledButtonClass() {
			return [
				"btn ml-3",
				{ "is-selected": this.statusActive.canceled },
			];
		},
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			await ImportService.getListOfImports(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "",
				this.table.searchPhrase,
				this.filters,
			).then(({ data, totalCount }) => {
				this.table.data = [];
				this.table.progress = 0;
				this.table.total = totalCount;

				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			});

			this.isLoadingList = false;
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
			});

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
			this.isAdvancedSearchVisible = !this.isAdvancedSearchVisible;
		},

		onResetFilters() {
			Object.keys(this.statusActive).forEach((key) => {
				this.statusActive[key] = false;
			});

			this.resetSearch({ tableRef: "importsList", filtersRef: "importFilter" });
		},

		onGoToDetail(importItem) {
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

		showDetailWithId(id) {
			const importItem = this.table.data.find((item) => item.id === id);
			this.$emit("showDetail", importItem);
		},
	},
};
</script>
