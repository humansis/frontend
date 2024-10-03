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
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row)"
			/>

			<ButtonAction
				v-if="row.role !== ROLE.ADMIN"
				:required-permissions="PERMISSIONS.ADMINISTRATIVE_SETTING_USER_DELETE"
				:disabled="isLoggedUser(row.id)"
				icon="trash"
				tooltip-text="Delete"
				icon-color="red"
				confirm-title="Deleting User"
				confirm-message="Are you sure you want to delete User?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				is-confirm-action
				@actionConfirmed="onRemove(row.id)"
			/>
		</template>

		<template v-slot:tableControls>
			<ExportControl
				:required-permissions="PERMISSIONS.ADMINISTRATIVE_SETTING_USER"
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
import UsersService from "@/services/UsersService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import ExportControl from "@/components/Inputs/ExportControl";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, ROLE, TABLE } from "@/consts";

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
			ROLE,
			TABLE,
			isLoadingList: false,
			exportControl: {
				loading: false,
				location: "users",
				types: [EXPORT.USERS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			table: {
				data: [],
				columns: generateColumns([
					{ key: "id", title: "ID" },
					{ key: "email" },
					{ key: "role", sortable: false },
					{ key: "dataAccess", sortable: false },
					{ key: "projects", sortable: false },
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
				} = await UsersService.getListOfUsers({
					page: this.table.currentPage,
					size: this.perPage,
					search: this.table.searchPhrase,
					filters: { showVendors: false },
					sort,
				});

				checkResponseStatus(status, message);

				this.table.data = [];
				this.table.total = totalCount;

				if (data.length > 0) {
					this.prepareDataForTable(data);
				}
			} catch (e) {
				Notification(`${this.$t("Users")}: ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = {
					...item,
					role: item.role.name,
					dataAccess: item.countries.map((country) => country.iso3).join(", "),
					projects: item.projectIds.length,
				};
			});
		},

		isLoggedUser(id) {
			return id === this.user?.userId;
		},

		async onExportUsers(exportType, format) {
			if (exportType === EXPORT.USERS) {
				try {
					this.exportControl.loading = true;

					const filename = `Users ${normalizeExportDate()}`;
					const {
						data,
						status,
						message,
					} = await UsersService.exportUsers(format);

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
