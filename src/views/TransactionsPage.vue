<template>
	<div>
		<h2 class="title">Transactions</h2>
		<Table
			has-reset-sort
			has-search
			:key="resetSortKey"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@resetSort="resetSort"
			@search="onSearch"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" sortable :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>
			<template slot="filterButton">
				<div class="column">
					<button
						class="button"
						slot="trigger"
						@click="filtersToggle"
					>
						<span>Advanced search</span>
						<b-icon
							size="is-small"
							:icon="advancedSearchVisible ? 'arrow-up' : 'arrow-down'"
						/>
					</button>
				</div>
			</template>
			<template slot="filter">
				<b-collapse
					:open="advancedSearchVisible"
					animation="slide"
				>
					<TransactionFilter
						@filtersChanged="onFiltersChange"
					/>
				</b-collapse>
			</template>
		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import TransactionService from "@/services/TransactionService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";

const TransactionFilter = () => import("@/components/Transactions/TransactionFilter");

export default {
	name: "TransactionsPage",

	components: {
		TransactionFilter,
		Table,
	},

	mixins: [grid],

	data() {
		return {
			advancedSearchVisible: false,
			searchPhrase: "",
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "beneficiary",
					},
					{
						key: "type",
					},
					{
						key: "item",
					},
					{
						key: "value",
					},
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
			},
			filters: {},
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			await TransactionService.getListOfTransactions(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.searchPhrase,
				this.filters,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => {
				Notification(`Transactions ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		async onFiltersChange(selectedFilters) {
			Object.keys(selectedFilters).forEach((key) => {
				if (Array.isArray(selectedFilters[key])) {
					this.filters[key] = [];
					selectedFilters[key].forEach((value) => {
						this.filters[key].push(value.id);
					});
				} else if (selectedFilters[key]) {
					const date = new Date(selectedFilters[key]);
					this.filters[key] = [date.toISOString()];
				}
			});
			await this.fetchData();
		},
	},
};
</script>
