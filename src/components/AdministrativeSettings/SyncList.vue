<template>
	<Table
		has-search
		has-reset-sort
		has-export
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		@clicked="showDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort"
		@search="onSearch"
	>
		<template v-for="column in table.columns">
			<b-table-column
				v-bind="column"
				v-slot="props"
				:sortable="column.sortable"
				:key="column.id"
			>
				<ColumnField :column="column" :data="props" />
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			width="145"
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
		</template>
		<template #progress>
			<b-progress :value="table.progress" format="percent" />
		</template>
		<template #filter>
			<b-collapse v-model="advancedSearchVisible">
				<SyncFilter @filtersChanged="onFiltersChange" />
			</b-collapse>
		</template>
		<template #export>
			<ExportButton
				class="ml-3"
				space-between
				type="is-primary"
				:loading="exportLoading"
				:formats="{ xlsx: true, csv: true, ods: true}"
				@onExport="exportSync"
			/>
		</template>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import DonorService from "@/services/DonorService";
import { generateColumns } from "@/utils/datagrid";
import grid from "@/mixins/grid";
import ExportButton from "@/components/ExportButton";
import SyncFilter from "@/components/AdministrativeSettings/SyncFilter";
import permissions from "@/mixins/permissions";

export default {
	name: "SyncList",

	components: {
		ExportButton,
		ColumnField,
		Table,
		ActionButton,
		SyncFilter,
	},

	mixins: [grid, permissions],

	data() {
		return {
			advancedSearchVisible: false,
			exportLoading: false,
			filters: [],
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ type: "text", key: "who", width: "100", sortable: true },
					{ type: "text", key: "what", width: "200", sortable: true },
					{ type: "text", key: "rawData" },
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

			// TODO fetch sync data
			await DonorService.getListOfDonors(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;

				// TODO Change progress and add this.prepareDataForTable(data)
				this.table.progress = 100;
			}).catch((e) => {
				if (e.message) console.error(e);
			});

			this.isLoadingList = false;
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		async onFiltersChange(selectedFilters) {
			this.filters = selectedFilters;
			this.table.currentPage = 1;
			await this.fetchData();
		},

		async exportSync() {
			this.exportLoading = true;
			// TODO async export sync
			this.exportLoading = false;
		},
	},
};
</script>
