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
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.PRODUCTS_CATEGORIES)"
		@rowClicked="(row) => onShowDetail(row.item)"
	>
		<template v-slot:actions="{ row, index }">
			<ButtonAction
				:required-permissions="PERMISSIONS.COUNTRY_SETTINGS_PRODUCT_ITEMS_CREATE"
				:data-cy="prepareComponentIdentifier(`row-${index + 1}-show-detail-button`)"
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row)"
			/>

			<ButtonAction
				:required-permissions="PERMISSIONS.COUNTRY_SETTINGS_PRODUCT_ITEMS_CREATE"
				:data-cy="prepareComponentIdentifier(`row-${index + 1}-edit-button`)"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row)"
			/>

			<ButtonAction
				:required-permissions="PERMISSIONS.COUNTRY_SETTINGS_PRODUCT_ITEMS_CREATE"
				:data-cy="prepareComponentIdentifier(`row-${index + 1}-delete-button`)"
				icon="trash"
				tooltip-text="Delete"
				icon-color="red"
				confirm-title="Deleting Product Category"
				confirm-message="Are you sure you want to delete Product Category?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				is-confirm-action
				@actionConfirmed="onRemove(row.id)"
			/>
		</template>
	</DataGrid>
</template>

<script>
import ProductService from "@/services/ProductService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import grid from "@/mixins/grid";
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";
import { generateColumns } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { TABLE } from "@/consts";

export default {
	name: "CategoriesList",

	components: {
		DataGrid,
		ButtonAction,
	},

	mixins: [
		grid,
		permissions,
		identifierBuilder,
	],

	data() {
		return {
			TABLE,
			isLoadingList: false,
			dataCy: "categories-table",
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

				const sort = this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "";
				const {
					data: { data, totalCount },
					status,
					message,
				} = await ProductService.getListOfCategories({
					page: this.table.currentPage,
					size: this.perPage,
					search: this.table.searchPhrase,
					sort,
				});

				this.table.data = [];

				checkResponseStatus(status, message);

				this.table.total = totalCount;
				this.prepareDataForTable(data);
			} catch (e) {
				Notification(`${this.$t("Categories")}: ${e.message || e}`, "error");
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
