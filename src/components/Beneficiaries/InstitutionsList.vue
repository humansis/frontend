<template>
	<div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="onSearch" />
		</div>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			:is-loading="isLoadingList"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@changePerPage="onChangePerPage"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" sortable :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>
			<b-table-column
				v-slot="props"
				label="Actions"
				width="190"
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
						entity="Institute"
						tooltip="Delete"
						:id="props.row.id"
						@submitted="remove"
					/>
					<ActionButton icon="print" type="is-dark" tooltip="Print" />
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import Search from "@/components/Search";
import InstitutionsService from "@/services/InstitutionsService";
import { generateColumns } from "@/utils/datagrid";
import { Toast } from "@/utils/UI";
import grid from "@/mixins/grid";

export default {
	name: "InstitutionsList",

	components: {
		Search,
		SafeDelete,
		Table,
		ActionButton,
	},

	mixins: [grid],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "name",
					},
					{
						key: "type",
					},
					{
						key: "contactGivenName",
						label: "Contact Name",
					},
					{
						key: "contactFamilyName",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
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
			await InstitutionsService.getListOfInstitutions(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				Toast(`(Institutions) ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},
	},
};
</script>
