<template>
	<Table
		has-reset-sort
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		@clicked="showDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort"
	>
		<template v-for="column in table.columns">
			<b-table-column
				sortable
				v-bind="column"
				v-slot="props"
				:key="column.id"
			>
				<ColumnField :column="column" :data="props" />
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			label="Actions"
			centered
		>
			<div class="block">
				<ActionButton
					icon="search"
					type="is-link"
					tooltip="Show Detail"
					@click.native="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					icon="edit"
					type="is-link"
					tooltip="Edit"
					@click.native="showEdit(props.row.id)"
				/>
				<SafeDelete
					icon="trash"
					entity="Country"
					tooltip="Delete"
					:id="props.row.id"
					@submitted="remove"
				/>
			</div>
		</b-table-column>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import ColumnField from "@/components/DataGrid/ColumnField";
import CountriesService from "@/services/CountriesService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";

export default {
	name: "CountriesList",

	components: {
		SafeDelete,
		Table,
		ActionButton,
		ColumnField,
	},

	mixins: [grid],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "name" },
					{ key: "iso3" },
					{ key: "availableCurrencies" },
					{ type: "flag", key: "countryFlag" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
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
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await CountriesService.getListOfCountriesForTable(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				Notification(`Countries ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},
	},
};
</script>
