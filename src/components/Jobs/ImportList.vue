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
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>

			<template v-for="column in table.columns">
				<b-table-column
					v-bind="column"
					v-slot="props"
					centered
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
import ImportService from "@/services/ImportService";
import { Toast } from "@/utils/UI";
import Search from "@/components/Search";

export default {
	name: "ImportList",

	components: {
		Search,
		ColumnField,
		Table,
	},

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "who",
					},
					{
						key: "where",
					},
					{
						key: "what",
					},
					{
						key: "status",
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

			await ImportService.getListOfImports()
				.then((response) => {
					this.table.data = response.data;
					this.table.total = response.totalCount;
					this.table.columns = generateColumns(
						this.table.visibleColumns,
					);
				}).catch((e) => { Toast(e, "is-danger"); });

			this.$store.commit("loading", false);
		},

		showDetail(donor) {
			this.$emit("onShowDetail", donor);
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
