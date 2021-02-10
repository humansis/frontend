<template>
	<Table
		has-reset-sort
		:key="resetSortKey"
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
			width="150"
			centered
		>
			<div class="block">
				<ActionButton
					icon="search"
					type="is-info"
					tooltip="Show Detail"
					@click.native="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					icon="edit"
					type="is-link"
					tooltip="Edit"
					@click.native="showEdit(props.row.id)"
				/>
				<ActionButton
					icon="print"
					type="is-dark"
					tooltip="Print"
					@click.native="print(props.row.id)"
				/>
			</div>
		</b-table-column>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import MyOrganizationsService from "@/services/MyOrganizationsService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";

export default {
	name: "MyOrganizationsList",

	components: {
		ColumnField,
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
						label: "Organization Name",
					},
					{
						type: "image",
						key: "logo",
						label: "Organization Logo",
					},
					{
						type: "font",
						key: "font",
						label: "Font To Apply To The Pdf",
					},
					{
						type: "color",
						key: "primaryColor",
						label: "Organization Primary Color",
					},
					{
						type: "color",
						key: "secondaryColor",
						label: "Organization Secondary Color",
					},
					{
						key: "footerContent",
						label: "Pdf Footer Content",
					},
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
			await MyOrganizationsService.getListOfMyOrganizations(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				Notification(`Organizations ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		print(id) {
			this.$emit("onPrint", id);
		},
	},

};
</script>
