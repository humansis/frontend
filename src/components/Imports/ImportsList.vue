<template>
	<Table
		v-show="show"
		has-reset-sort
		has-search
		ref="table"
		default-sort-direction="desc"
		default-sort-key="createdAt"
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		@clicked="goToDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort"
		@search="onSearch"
	>
		<template v-for="column in table.columns">
			<b-table-column
				:sortable="column.sortable"
				v-bind="column"
				:key="column.id"
				v-slot="props"
			>
				<ColumnField :data="props" :column="column" />
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			width="180"
			field="actions"
			:label="$t('Actions')"
		>
			<div class="buttons is-right">
				<ActionButton
					icon="search"
					type="is-primary"
					:tooltip="$t('Show Detail')"
					@click="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					icon="edit"
					:tooltip="$t('Edit')"
					@click="showEdit(props.row.id)"
				/>
			</div>
		</b-table-column>
		<template #filterButton>
			<b-button
				slot="trigger"
				:icon-right="advancedSearchVisible ? 'arrow-up' : 'arrow-down'"
				@click="filtersToggle"
			>
				{{ $t('Advanced Search') }}
			</b-button>
			<b-button
				class="ml-3 is-light"
				slot="trigger"
				icon-right="sticky-note"
				@click="statusFilter('New')"
			>
				{{ $t('New') }}
			</b-button>
			<b-button
				class="ml-3 is-info is-light"
				slot="trigger"
				icon-right="spinner"
				@click="statusFilter('In Progress')"
			>
				{{ $t('In Progress') }}
			</b-button>
			<b-button
				class="ml-3 is-success is-light"
				slot="trigger"
				icon-right="check"
				@click="statusFilter('Finished')"
			>
				{{ $t('Finished') }}
			</b-button>
			<b-button
				class="ml-3 is-warning is-light"
				slot="trigger"
				icon-right="ban"
				@click="statusFilter('Canceled')"
			>
				{{ $t('Canceled') }}
			</b-button>
		</template>
		<template #filter>
			<b-collapse v-model="advancedSearchVisible">
				<ImportsFilter
					ref="importFilter"
					@filtersChanged="onFiltersChange"
				/>
			</b-collapse>
		</template>
		<template #progress>
			<b-progress :value="table.progress" format="percent" />
		</template>
		<template slot="resetSort">
			<div class="level-right">
				<b-button
					icon-left="eraser"
					class="reset-sort-button is-small mr-2"
					@click="resetFilters"
				>
					{{ $t('Reset Filters') }}
				</b-button>
				<b-button
					icon-left="eraser"
					class="reset-sort-button is-small"
					@click="resetTableSort"
				>
					{{ $t('Reset Table Sort') }}
				</b-button>
			</div>
		</template>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import { generateColumns } from "@/utils/datagrid";
import grid from "@/mixins/grid";
import baseHelper from "@/mixins/baseHelper";
import ImportsFilter from "@/components/Imports/ImportsFilter";
import ImportService from "@/services/ImportService";
import consts from "@/utils/importConst";

const statusTags = [
	{ code: consts.STATUS.NEW, type: "is-light" },
	{ code: consts.STATUS.INTEGRITY_CHECK, type: "is-info" },
	{ code: consts.STATUS.INTEGRITY_CHECK_CORRECT, type: "is-success" },
	{ code: consts.STATUS.INTEGRITY_CHECK_FAILED, type: "is-danger" },
	{ code: consts.STATUS.IDENTITY_CHECK, type: "is-info" },
	{ code: consts.STATUS.IDENTITY_CHECK_CORRECT, type: "is-success" },
	{ code: consts.STATUS.IDENTITY_CHECK_FAILED, type: "is-danger" },
	{ code: consts.STATUS.SIMILARITY_CHECK, type: "is-info" },
	{ code: consts.STATUS.SIMILARITY_CHECK_CORRECT, type: "is-success" },
	{ code: consts.STATUS.SIMILARITY_CHECK_FAILED, type: "is-danger" },
	{ code: consts.STATUS.FINISH, type: "is-success" },
	{ code: consts.STATUS.CANCEL, type: "is-warning" },
	{ code: consts.STATUS.IMPORTING, type: "is-warning" },
];

export default {
	name: "ProjectList",

	components: {
		Table,
		ActionButton,
		ColumnField,
		ImportsFilter,
	},

	mixins: [grid, baseHelper],

	data() {
		return {
			advancedSearchVisible: false,
			filters: [],
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id", width: "30", sortable: true },
					{ key: "title", width: "120", sortable: true },
					{ key: "project", width: "120", label: "Project", sortable: true, sortKey: "project" },
					{ key: "status", width: "100", type: "tag", customTags: statusTags, sortable: true },
					{ key: "createdBy", width: "140", sortable: true },
					{ key: "createdAt", type: "datetime", width: "120", sortable: true },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "desc",
				sortColumn: "createdAt",
				searchPhrase: "",
				filtersInProgress: [
					consts.STATUS.INTEGRITY_CHECK, consts.STATUS.INTEGRITY_CHECK_CORRECT,
					consts.STATUS.INTEGRITY_CHECK_FAILED, consts.STATUS.IDENTITY_CHECK,
					consts.STATUS.IDENTITY_CHECK_CORRECT, consts.STATUS.IDENTITY_CHECK_FAILED,
					consts.STATUS.SIMILARITY_CHECK, consts.STATUS.SIMILARITY_CHECK_CORRECT,
					consts.STATUS.SIMILARITY_CHECK_FAILED,
					consts.STATUS.IMPORTING,
				],
			},
		};
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
			this.table.progress = null;

			this.table.columns = generateColumns(this.table.visibleColumns);

			await ImportService.getListOfImports(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
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

		statusFilter(filter) {
			const newStatusFilter = filter === "In Progress" ? this.table.filtersInProgress : [filter];
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

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		resetFilters() {
			this.$refs.importFilter.resetFilters();
		},

		resetTableSort() {
			this.$refs.table.onResetSort();
		},

		goToDetail(importItem) {
			let slug = "";

			switch (importItem.status) {
				case consts.STATUS.INTEGRITY_CHECK:
				case consts.STATUS.INTEGRITY_CHECK_CORRECT:
				case consts.STATUS.INTEGRITY_CHECK_FAILED:
					slug = "integrity-check";
					break;
				case consts.STATUS.IDENTITY_CHECK:
				case consts.STATUS.IDENTITY_CHECK_CORRECT:
				case consts.STATUS.IDENTITY_CHECK_FAILED:
					slug = "identity-check";
					break;
				case consts.STATUS.SIMILARITY_CHECK:
				case consts.STATUS.SIMILARITY_CHECK_FAILED:
				case consts.STATUS.SIMILARITY_CHECK_CORRECT:
					slug = "similarity-check";
					break;
				case consts.STATUS.FINISH:
				case consts.STATUS.IMPORTING:
					slug = "finalisation";
					break;
				case consts.STATUS.NEW:
				case consts.STATUS.CANCEL:
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
			this.$emit("onShowDetail", importItem);
		},
	},
};
</script>
