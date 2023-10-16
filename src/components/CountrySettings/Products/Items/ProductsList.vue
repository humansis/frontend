<template>
	<Table
		has-reset-sort
		has-search
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:search-phrase="table.searchPhrase"
		@clicked="showDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort('id', 'asc', true)"
		@onSearch="onSearch"
	>
		<template v-for="column in table.columns">
			<b-table-column
				v-bind="column"
				:key="column.id"
				v-slot="props"
			>
				<ColumnField :data="props" :column="column" />
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			width="150"
			field="actions"
			:label="$t('Actions')"
		>
			<div class="buttons is-right">
				<ActionButton
					icon="search"
					type="is-primary"
					:tooltip="$t('Show Detail')"
					@click="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					v-if="userCan.addEditProducts"
					icon="edit"
					:tooltip="$t('Edit')"
					@click="showEdit(props.row.id)"
				/>
				<SafeDelete
					v-if="userCan.addEditProducts"
					icon="trash"
					:entity="$t('Product')"
					:tooltip="$t('Delete')"
					:id="props.row.id"
					@submitted="remove"
				/>
			</div>
		</b-table-column>
		<template #export>
			<ExportControl
				:disabled="!table.data.length"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				@onExport="exportProducts"
			/>
		</template>
	</Table>
</template>

<script>
import ProductService from "@/services/ProductService";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import Table from "@/components/DataGrid/Table";
import ExportControl from "@/components/Export";
import SafeDelete from "@/components/SafeDelete";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT } from "@/consts";

export default {
	name: "ProductsList",

	components: {
		ExportControl,
		ColumnField,
		SafeDelete,
		Table,
		ActionButton,
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
			exportControl: {
				loading: false,
				location: "products",
				types: [EXPORT.PRODUCTS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "name", width: "400", sortable: true },
					{ key: "category", type: "productCategoryImage", width: "400", sortable: true, sortKey: "productCategoryId" },
					{ key: "unit", width: "200", sortable: true },
					{ type: "image", key: "image", width: "100" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "asc",
				sortColumn: "id",
				searchPhrase: "",
			},
		};
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.productModal.isDetail) {
				result = this.$t("Detail of Product");
			} else if (this.productModal.isEditing) {
				result = this.$t("Edit Product");
			} else {
				result = this.$t("Create New Product");
			}
			return result;
		},
	},

	watch: {
		categories() {
			this.fetchData();
		},
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await ProductService.getListOfProducts(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.prepareDataForTable(response.data);
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Products")} ${e}`, "is-danger");
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
					Notification(`${this.$t("Export Products")} ${e.message || e}`, "is-danger");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>
