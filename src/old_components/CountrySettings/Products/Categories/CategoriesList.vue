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
					tooltip="Edit"
					@click="showEdit(props.row.id)"
				/>
				<SafeDelete
					v-if="userCan.addEditProducts"
					icon="trash"
					:entity="$t('Product Category')"
					:tooltip="$t('Delete')"
					:id="props.row.id"
					@submitted="remove"
				/>
			</div>
		</b-table-column>
	</Table>
</template>

<script>
import ProductService from "@/services/ProductService";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import Table from "@/components/DataGrid/Table";
import SafeDelete from "@/components/SafeDelete";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

export default {
	name: "CategoriesList",

	components: {
		ColumnField,
		Table,
		ActionButton,
		SafeDelete,
	},

	mixins: [grid, permissions],

	data() {
		return {
			exportLoading: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "name", width: "400", sortable: true },
					{ key: "type", width: "150", type: "svgIcon", sortable: true },
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
			if (this.categoryModal.isDetail) {
				result = this.$t("Detail of Category");
			} else if (this.categoryModal.isEditing) {
				result = this.$t("Edit Category");
			} else {
				result = this.$t("Create New Category");
			}
			return result;
		},
	},

	watch: {
		$route: "fetchData",
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await ProductService.getListOfCategories(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then((response) => {
				this.prepareDataForTable(response.data);
				this.table.total = response.totalCount;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Categories")} ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		async prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = item;

				this.table.data[key].type = [{ code: item.type, value: item.type }];
			});
		},
	},
};
</script>
