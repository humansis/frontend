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
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.USERS)"
		@rowClicked="(row) => onShowDetail(row.item)"
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row)"
			/>

			<ButtonAction
				v-if="userCan.addEditUsers"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row)"
			/>

			<ButtonAction
				v-if="userCan.addEditUsers"
				icon="trash"
				tooltip-text="Delete"
				icon-color="red"
				confirm-title="Deleting User"
				confirm-message="Are you sure sure you want to delete User?"
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
				@export="onExportUsers"
			/>
		</template>
	</DataGrid>
</template>

<script>
import { mapState } from "vuex";
import SystemService from "@/services/SystemService";
import UsersService from "@/services/UsersService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import ExportControl from "@/components/Inputs/ExportControl";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, TABLE } from "@/consts";

export default {
	name: "UsersList",

	components: {
		ExportControl,
		ButtonAction,
		DataGrid,
	},

	mixins: [grid, permissions],

	data() {
		return {
			TABLE,
			exportControl: {
				loading: false,
				location: "users",
				types: [EXPORT.USERS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			roles: [],
			table: {
				data: [],
				columns: generateColumns([
					{ key: "id", title: "ID" },
					{ key: "email" },
					{ key: "role", title: "Rights", sortKey: "rights" },
					{ key: "phonePrefix", title: "Prefix", sortKey: "prefix" },
					{ key: "phoneNumber", sortKey: "phone" },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.USERS.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.USERS.key,
				searchPhrase: "",
			},
		};
	},

	computed: {
		...mapState(["user"]),
	},

	async created() {
		await this.fetchRoles();
		await this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			await UsersService.getListOfUsers(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "",
				this.table.searchPhrase,
				null,
				null,
				false,
			).then(({ data, totalCount }) => {
				this.table.total = totalCount;
				this.table.data = this.prepareDataForTable(data);
			}).catch((e) => {
				Notification(`${this.$t("Users")} ${e.message || e}`, "error");
			});

			this.isLoadingList = false;
		},

		prepareDataForTable(data) {
			const filledData = [];
			data.forEach((item, key) => {
				filledData[key] = item;
				filledData[key].role = this.prepareRights(item.roles);
			});
			return filledData;
		},

		prepareRights(rights) {
			const role = this.roles.find((item) => item.code === rights[0]);
			return role?.name;
		},

		isLoggedUser(id) {
			return id === this.user?.userId;
		},

		async fetchRoles() {
			await SystemService.getRoles()
				.then(({ data }) => {
					this.roles = data;
				}).catch((e) => {
					Notification(`${this.$t("Roles")} ${e.message || e}`, "error");
				});
		},

		async onExportUsers(exportType, format) {
			if (exportType === EXPORT.USERS) {
				try {
					this.exportControl.loading = true;

					const filename = `Users ${normalizeExportDate()}`;
					const { data, status, message } = await UsersService.exportUsers(format);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Users")} ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>
