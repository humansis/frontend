<template>
	<DataGrid
		v-model:items-per-page="perPage"
		v-model:sort-by="sortValue"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		reset-sort-button
		is-search-visible
		@perPageChanged="onPerPageChange"
		@pageChanged="onPageChange"
		@update:sortBy="onSort"
		@search="onSearch"
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.ROLES)"
		@rowClicked="(row) => onShowDetail(row.item.id)"
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				:required-permissions="PERMISSIONS.ADMINISTRATIVE_SETTING_ROLE_MANAGEMENT"
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row.id)"
			/>

			<ButtonAction
				v-if="row.isEditable"
				:required-permissions="PERMISSIONS.ADMINISTRATIVE_SETTING_ROLE_MANAGEMENT"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row.id)"
			/>

			<ButtonAction
				v-if="row.isDeletable"
				:required-permissions="PERMISSIONS.ADMINISTRATIVE_SETTING_ROLE_MANAGEMENT_DELETE"
				icon="trash"
				tooltip-text="Delete"
				icon-color="red"
				confirm-title="Deleting Role"
				confirm-message="Are you sure you want to delete Role?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				is-confirm-action
				@actionConfirmed="onRemove(row.id)"
			/>
		</template>
	</DataGrid>
</template>

<script>
import RolesService from "@/services/RolesService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid/index";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { TABLE } from "@/consts";

export default {
	name: "RolesList",

	components: {
		ButtonAction,
		DataGrid,
	},

	mixins: [grid, permissions],

	data() {
		return {
			TABLE,
			isLoadingList: false,
			table: {
				data: [],
				columns: generateColumns([
					{ key: "id", title: "ID" },
					{ key: "name", title: "Role Name" },
					{ key: "usersCount", title: "Users", sortable: false },
					{ key: "actions", value: "actions", width: "250", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.ROLES.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.ROLES.key,
				searchPhrase: "",
			},
		};
	},

	async created() {
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
				} = await RolesService.getListOfRoles({
					page: this.table.currentPage,
					size: this.perPage,
					search: this.table.searchPhrase,
					sort,
				});

				checkResponseStatus(status, message);

				this.table.data = [];
				this.table.total = totalCount;

				if (data.length > 0) {
					this.prepareDataForTable(data);
				}
			} catch (e) {
				Notification(`${this.$t("Roles")}: ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},

		prepareDataForTable(data) {
			this.table.data = data.map((item) => ({
				...item,
			}));
		},
	},
};
</script>
