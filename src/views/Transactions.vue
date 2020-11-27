<template>
	<div>
		<h2 class="title">Transactions</h2>
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input placeholder="Search by keyword" type="search" icon="search" />
				</b-field>
			</div>
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
				<b-table-column
					v-bind="column"
					:key="column.id"
				>
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

export default {
	name: "Transactions",

	components: {
		TransactionFilter,
		Table,
	},

	data() {
		return {
			advancedSearchVisible: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "beneficiary",
						label: "Beneficiary",
					},
					{
						key: "type",
						label: "Type",
					},
					{
						key: "item",
						label: "Item",
					},
					{
						key: "value",
						label: "Value",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
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
		async fetchData() {
			this.$store.commit("loading", true);

			await TransactionService.getListOfTransactions().then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => { Toast(e, "is-danger"); });

			this.$store.commit("loading", false);
		},

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
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
			}).catch((e) => { Toast(e, "is-danger"); });
		},
	},
};
</script>
