<!-- TODO Not used for now -->
<template>
	<Table
		has-reset-sort
		has-search
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:search-phrase="table.searchPhrase"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort"
		@onSearch="onSearch"
	>
		<template v-for="column in table.columns">
			<b-table-column
				v-slot="props"
				:key="column.id"
				sortable
				v-bind="column"
			>
				<ColumnField :column="column" :data="props" />
			</b-table-column>
		</template>
	</Table>
</template>

<script>
import CurrencyService from "@/services/CurrencyService";
import ColumnField from "@/components/DataGrid/ColumnField";
import Table from "@/components/DataGrid/Table";
import grid from "@/mixins/grid";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

export default {
	name: "CurrenciesList",

	components: {
		Table,
		ColumnField,
	},

	mixins: [grid],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "country" },
					{ key: "currency" },
					{ key: "code" },
					{ key: "number" },
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

			this.table.columns = generateColumns(this.table.visibleColumns);
			await CurrencyService.getListOfCurrencies(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Currency")} ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},
	},
};
</script>
