<template>
	<DataGrid
		v-model:items-per-page="perPage"
		v-model:sort-by="sortValue"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		:data-cy="dataCy"
		reset-sort-button
		is-search-visible
		@perPageChanged="onPerPageChange"
		@pageChanged="onPageChange"
		@update:sortBy="onSort"
		@search="onSearch"
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.PRODUCTS_ITEMS)"
		@rowClicked="(row) => onShowDetail(row.item)"
	>
		<template v-slot:actions="{ row, index }">
			<ButtonAction
				:data-cy="prepareComponentIdentifier(`row-${index + 1}-show-detail-button`)"
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row)"
			/>

			<ButtonAction
				v-if="userCan.addEditProducts"
				:data-cy="prepareComponentIdentifier(`row-${index + 1}-edit-button`)"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row)"
			/>

			<ButtonAction
				v-if="userCan.addEditProducts"
				:data-cy="prepareComponentIdentifier(`row-${index + 1}-delete-button`)"
				icon="trash"
				tooltip-text="Delete"
				icon-color="red"
				confirm-title="Deleting Product"
				confirm-message="Are you sure you want to delete Product?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				is-confirm-action
				@actionConfirmed="onRemove(row.id)"
			/>
		</template>

		<template v-slot:tableControls>
			<ExportControl
				:disabled="!table.data.length"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				@export="onExportProducts"
			/>
		</template>
	</DataGrid>
</template>

<script>
import ProductService from "@/services/ProductService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import ExportControl from "@/components/Inputs/ExportControl";
import grid from "@/mixins/grid";
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, TABLE } from "@/consts";

export default {
	name: "ProductsList",

	components: {
		ExportControl,
		DataGrid,
		ButtonAction,
	},

	mixins: [grid, permissions, identifierBuilder],

	props: {
		categories: {
			type: Array,
			default: () => [],
		},
	},

	data() {
		return {
			TABLE,
			isLoadingList: false,
			dataCy: "products-table",
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

	async mounted() {
		await this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				this.isLoadingList = true;

				const sort = this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "";
				const {
					data: { data, totalCount },
					status,
					message,
				} = await ProductService.getListOfProducts({
					page: this.table.currentPage,
					size: this.perPage,
					search: this.table.searchPhrase,
					sort,
				});

				checkResponseStatus(status, message);

				this.table.data = data;
				this.table.total = totalCount;
				this.prepareDataForTable(data);
			} catch (e) {
				Notification(`${this.$t("Products")}: ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
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

		async onExportProducts(exportType, format) {
			if (exportType === EXPORT.PRODUCTS) {
				try {
					this.exportControl.loading = true;

					const filename = `Products ${normalizeExportDate()}`;
					const {
						data,
						status,
						message,
					} = await ProductService.exportProducts(format);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Products")}: ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>
