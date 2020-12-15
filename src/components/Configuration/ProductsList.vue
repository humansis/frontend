<template>
	<div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="onSearch" />
			<ExportButton
				class="column"
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
			:is-loading="isLoadingList"
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
import { Notification } from "@/utils/UI";
import Search from "@/components/Search";
import ExportButton from "@/components/ExportButton";
import grid from "@/mixins/grid";

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

	mixins: [grid],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "name" },
					{ key: "unit" },
					{ type: "image", key: "image" },
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
		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await ProductsService.getListOfProducts(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				Notification(`Products ${e}`, "is-danger");
			});

			this.isLoadingList = false;
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
	},
};
</script>
