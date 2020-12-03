<template>
	<div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="fetchData" />
		</div>
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
					v-slot="props"
					:key="column.id"
				>
					<ColumnField :column="column" :data="props" />
				</b-table-column>
			</template>
		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import { generateColumns } from "@/utils/datagrid";
import ColumnField from "@/components/DataGrid/ColumnField";
import CurrencyService from "@/services/CurrencyService";
import { Toast } from "@/utils/UI";
import Search from "@/components/Search";

export default {
	name: "Currencies",

	components: {
		Search,
		Table,
		ColumnField,
	},

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "country",
					},
					{
						key: "currency",
					},
					{
						key: "code",
					},
					{
						key: "number",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
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

			await CurrencyService.getListOfCurrencies()
				.then((response) => {
					this.table.data = response.data;
					this.table.total = response.totalCount;
					this.table.columns = generateColumns(
						this.table.visibleColumns,
					);
				}).catch((e) => {
					Toast(`(Currency) ${e}`, "is-danger");
				});

			this.$store.commit("loading", false);
		},

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},
	},
};
</script>
