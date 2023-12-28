<template>
	<Table
		v-model:items-per-page="perPage"
		v-model:sort-by="sortValue"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		reset-sort-button
		is-search-visible
		@per-page-changed="perPageChange"
		@page-changed="pageChange"
		@update:sortBy="onSort"
		@search="search"
		@resetSort="resetSort(TABLE.DEFAULT_SORT_OPTIONS.PRODUCTS_CATEGORIES)"
		@rowClicked="(row) => showDetail(row.item)"
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="showDetail(row)"
			/>

			<ButtonAction
				v-if="userCan.addEditProducts"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="showEdit(row)"
			/>

			<ButtonAction
				v-if="userCan.addEditProducts"
				icon="trash"
				tooltip-text="Delete"
				icon-color="red"
				confirm-title="Deleting Product Category"
				confirm-message="Are you sure sure you want to delete Product Category?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				is-confirm-action
				@actionConfirmed="remove(row.id)"
			/>
		</template>
	</Table>
</template>

<script>
import ProductService from "@/services/ProductService";
import ButtonAction from "@/components/ButtonAction";
import Table from "@/components/DataGrid/Table";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import { TABLE } from "@/consts";

export default {
	name: "CategoriesList",

	components: {
		Table,
		ButtonAction,
	},

	mixins: [grid, permissions],

	data() {
		return {
			TABLE,
			table: {
				data: [],
				columns: generateColumns([
					{ key: "name" },
					{ key: "type", type: "svgIcon", sortable: false },
					{ type: "image", key: "image", sortable: false },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.PRODUCTS_CATEGORIES.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.PRODUCTS_CATEGORIES.key,
				searchPhrase: "",
			},
		};
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				this.isLoadingList = true;

				const { data: { data, totalCount } } = await ProductService.getListOfCategories(
					this.table.currentPage,
					this.perPage,
					this.table.sortColumn !== ""
						? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
						: "",
					this.table.searchPhrase,
				);

				this.table.data = [];
				this.table.total = totalCount;
				this.prepareDataForTable(data);
			} catch (e) {
				Notification(`${this.$t("Categories")} ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = item;

				this.table.data[key].type = [{ code: item.type, value: item.type }];
			});
		},
	},
};
</script>
