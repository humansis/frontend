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
		@resetSort="resetSort(TABLE.DEFAULT_SORT_OPTIONS.PRODUCTS_ITEMS)"
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
				confirm-title="Deleting Product"
				confirm-message="Are you sure sure you want to delete Product?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				is-confirm-action
				@actionConfirmed="remove(row.id)"
			/>
		</template>

		<template v-slot:tableControls>
			<ExportControl
				:disabled="!table.data.length"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				@export="exportProducts"
			/>
		</template>
	</Table>
</template>

<script>
import ProductService from "@/services/ProductService";
import ButtonAction from "@/components/ButtonAction";
import Table from "@/components/DataGrid/Table";
import ExportControl from "@/components/Inputs/ExportControl";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, TABLE } from "@/consts";

export default {
	name: "ProductsList",

	components: {
		ExportControl,
		Table,
		ButtonAction,
	},

	mixins: [grid, permissions],

	props: {
		categories: {
			type: Array,
			default: () => [],
		},
	},

	data() {
		return {
			TABLE,
			exportControl: {
				loading: false,
				location: "products",
				types: [EXPORT.PRODUCTS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			table: {
				data: [],
				columns: generateColumns([
					{ key: "name" },
					{ key: "category", type: "productCategoryImage", sortKey: "productCategoryId" },
					{ key: "unit", width: "200" },
					{ key: "image", type: "image", sortable: false },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.PRODUCTS_ITEMS.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.PRODUCTS_ITEMS.key,
				searchPhrase: "",
			},
		};
	},

	watch: {
		categories() {
			this.fetchData();
		},
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			await ProductService.getListOfProducts(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "",
				this.table.searchPhrase,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.prepareDataForTable(response.data);
			}).catch((e) => {
				Notification(`${this.$t("Products")} ${e.message || e}`, "error");
			});

			this.isLoadingList = false;
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = item;

				const categoryImage = this.categories?.find(({ id }) => id === item
					.productCategoryId)?.image || "";

				const categoryName = this.categories?.find(({ id }) => id === item
					.productCategoryId)?.type || "";

				this.table.data[key].category = {
					image: categoryImage,
					icon: [{ code: categoryName, value: categoryName }],
					primary: "icon",
				};
			});
		},

		async exportProducts(exportType, format) {
			if (exportType === EXPORT.PRODUCTS) {
				try {
					this.exportControl.loading = true;

					const filename = `Products ${normalizeExportDate()}`;
					const { data, status, message } = await ProductService.exportProducts(format);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Products")} ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>
