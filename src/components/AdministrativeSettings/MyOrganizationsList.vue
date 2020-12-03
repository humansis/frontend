<template>
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
					@click.native="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					icon="edit"
					type="is-link"
					@click.native="showEdit(props.row.id)"
				/>
				<ActionButton
					icon="print"
					type="is-dark"
					@click.native="print(props.row.id)"
				/>
			</div>
		</b-table-column>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import { generateColumns } from "@/utils/datagrid";
import MyOrganizationsService from "@/services/MyOrganizationsService";
import ColumnField from "@/components/DataGrid/ColumnField";
import { Toast } from "@/utils/UI";

export default {
	name: "MyOrganizationsList",

	components: {
		ColumnField,
		Table,
		ActionButton,
	},

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
				perPage: 15,
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
			this.$store.commit("loading", true);

			await MyOrganizationsService.getListOfMyOrganizations(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => {
				Toast(`(Organizations) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		showDetailWithId(id) {
			const myOrganization = this.table.data.find((item) => item.id === id);
			this.showDetail(myOrganization);
		},

		showDetail(myOrganization) {
			this.$emit("onShowDetail", myOrganization);
		},

		showEdit(id) {
			const myOrganization = this.table.data.find((item) => item.id === id);
			this.$emit("onShowEdit", myOrganization);
		},

		print(id) {
			this.$emit("onPrint", id);
		},

		onPageChange(currentPage) {
			this.table.currentPage = currentPage;
			this.fetchData();
		},

		onSort(column) {
			if (this.table.sortColumn === column) {
				this.table.sortDirection = this.table.sortDirection === "asc" ? "desc" : "asc";
			} else {
				this.table.sortColumn = column;
				this.table.sortDirection = "desc";
			}
			this.fetchData();
		},
	},

};
</script>
