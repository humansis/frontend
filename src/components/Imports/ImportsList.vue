<template>
	<Table
		v-show="show"
		has-reset-sort
		has-search
		ref="table"
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
			centered
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
			>
				{{ $t('New') }}
			</b-button>
			<b-button
				class="ml-3 is-info is-light"
				slot="trigger"
				icon-right="spinner"
			>
				{{ $t('In Progress') }}
			</b-button>
			<b-button
				class="ml-3 is-success is-light"
				slot="trigger"
				icon-right="check"
			>
				{{ $t('Done') }}
			</b-button>
			<b-button
				class="ml-3 is-warning is-light"
				slot="trigger"
				icon-right="ban"
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

const statusTags = [
	{ code: "New", type: "is-light" },
	{ code: "In Progress", type: "is-info" },
	{ code: "Done", type: "is-success" },
	{ code: "Canceled", type: "is-warning" },
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
			exportLoading: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id", width: "90", sortable: true },
					{ key: "title", width: "200", sortable: true },
					{ key: "projectId", label: "Project", width: "120", sortable: true },
					{ key: "status", type: "tag", customTags: statusTags, width: "120", sortable: true },
					{ key: "createdBy", width: "120", sortable: true },
					{ key: "createdAt", type: "datetime", width: "120", sortable: true },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
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

		async onFiltersChange(selectedFilters) {
			this.filters = selectedFilters;
			await this.fetchData();
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = item;
			});

			this.table.progress = 100;
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		resetFilters() {
			this.$refs.importFilter.eraseFilters();
		},

		resetTableSort() {
			this.$refs.table.onResetSort();
		},

		goToDetail(importItem) {
			this.$router.push({ name: "Import", params: { importId: importItem.id } });
		},

		showDetailWithId(id) {
			const importItem = this.table.data.find((item) => item.id === id);
			this.$emit("onShowDetail", importItem);
		},
	},
};
</script>
