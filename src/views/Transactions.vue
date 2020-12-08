<template>
	<div>
		<h2 class="title">Transactions</h2>
		<div class="columns">
			<Search class="column is-two-fifths" @search="fetchData" />
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
		</div>
		<b-collapse
			v-model="advancedSearchVisible"
			animation="slide"
		>
			<TransactionFilter
				:filtersOptions="filters"
				@filtersChanged="onFiltersChange"
			/>
		</b-collapse>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" sortable :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>
		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import { generateColumns } from "@/utils/datagrid";
import TransactionService from "@/services/TransactionService";
import TransactionFilter from "@/components/Transactions/TransactionFilter";
import { Toast } from "@/utils/UI";
import Search from "@/components/Search";
import grid from "@/mixins/grid";

export default {
	name: "Transactions",

	components: {
		Search,
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
				perPage: 15,
				sortDirection: "",
				sortColumn: "",
			},
			filters: {
				beneficiary: {
					data: [],
					type: "multiselect",
					placeholder: "Select Beneficiary ...",
					label: "Beneficiary",
				},
				type: {
					data: [],
					type: "multiselect",
					placeholder: "Select Type ...",
					label: "Type",
				},
				from: {
					data: [],
					type: "date",
					placeholder: "Select Date ...",
					label: "From",
				},
				to: {
					data: [],
					type: "date",
					placeholder: "Select Date ...",
					label: "To",
				},
				reedem: {
					data: [],
					type: "multiselect",
					placeholder: "Select Reedem ...",
					label: "Reedem",
				},
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData(value, filters) {
			this.searchPhrase = value;
			this.$store.commit("loading", true);

			await TransactionService.getListOfTransactions(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				filters,
				this.searchPhrase,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => {
				Toast(`(Transactions) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		async onFiltersChange(selectedFilters) {
			await TransactionService.getListOfTransactions(
				this.table.currentPage,
				this.table.perPage,
				"desc",
				null,
				selectedFilters,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				Toast(`(Transactions) ${e}`, "is-danger");
			});
		},
	},
};
</script>
