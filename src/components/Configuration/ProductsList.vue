<template>
	<div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="fetchData" />

			<ExportButton
				class="column is-2 is-offset-5"
				type="is-success"
				size="is-default"
				space-between
				:formats="{ xlsx: true, csv: true, ods: true}"
			/>
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
					sortable
					v-bind="column"
					:key="column.id"
					v-slot="props"
				>
					<ColumnField :data="props" :column="column" />
				</b-table-column>
			</template>

			<b-table-column
				label="Actions"
				v-slot="props"
				width="140"
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
					<SafeDelete
						icon="trash"
						entity="Product"
						:id="props.row.id"
						@submitted="remove"
					/>
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import ProductsService from "@/services/ProductsService";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import ColumnField from "@/components/DataGrid/ColumnField";
import { Toast } from "@/utils/UI";
import Search from "@/components/Search";
import ExportButton from "@/components/ExportButton";

export default {
	name: "ProductsList",

	components: {
		Search,
		ExportButton,
		ColumnField,
		SafeDelete,
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
					},
					{
						key: "unit",
					},
					{
						type: "image",
						key: "image",
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

	computed: {
		modalHeader() {
			let result = "";
			if (this.productModal.isDetail) {
				result = "Detail of Product";
			} else if (this.productModal.isEditing) {
				result = "Edit Product";
			} else {
				result = "Create new Product";
			}
			return result;
		},
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData(value) {
			this.$store.commit("loading", true);

			await ProductsService.getListOfProducts(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				value,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => {
				Toast(`(Products) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		showDetailWithId(id) {
			const product = this.table.data.find((item) => item.id === id);
			this.showDetail(product);
		},

		showDetail(product) {
			this.$emit("onShowDetail", product);
		},

		showEdit(id) {
			const product = this.table.data.find((item) => item.id === id);
			this.$emit("onShowEdit", product);
		},

		remove(id) {
			this.$emit("onRemove", id);
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
