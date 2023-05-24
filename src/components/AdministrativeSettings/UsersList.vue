<template>
	<Table
		has-reset-sort
		has-search
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:search-phrase="table.searchPhrase"
		:export-format="{xlsx: true, csv: true, ods: true}"
		@clicked="showDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@onSearch="onSearch"
		@resetSort="resetSort"
	>
		<template v-for="column in table.columns">
			<b-table-column v-bind="column" sortable :key="column.id">
				<template v-slot="props">
					{{ props.row[column.field] }}
				</template>
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
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
					v-if="userCan.addEditUsers"
					icon="edit"
					:tooltip="$t('Edit')"
					@click="showEdit(props.row.id)"
				/>
				<SafeDelete
					v-if="userCan.addEditUsers"
					icon="trash"
					:entity="$t('User')"
					:tooltip="$t('Delete')"
					:id="props.row.id"
					:disabled="isLoggedUser(props.row.id)"
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
				@onExport="exportUsers"
			/>
		</template>
	</Table>
</template>

<script>
import { mapState } from "vuex";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import UsersService from "@/services/UsersService";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";
import ExportControl from "@/components/Export";
import { EXPORT } from "@/consts";
import permissions from "@/mixins/permissions";
import SystemService from "@/services/SystemService";

export default {
	name: "UsersList",

	components: {
		ExportControl,
		SafeDelete,
		Table,
		ActionButton,
	},

	mixins: [grid, permissions],

	data() {
		return {
			exportControl: {
				loading: false,
				location: "users",
				types: [EXPORT.USERS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			roles: [],
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id", label: "ID" },
					{ key: "email" },
					{ key: "role", label: "Rights", sortKey: "rights" },
					{ key: "phonePrefix", label: "Prefix", sortKey: "prefix" },
					{ key: "phoneNumber", sortKey: "phone" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
			},
		};
	},

	computed: {
		...mapState(["user"]),
	},

	watch: {
		$route: "fetchData",
	},

	async created() {
		await this.fetchRoles();
		await this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);

			try {
				const { data: { data, totalCount } } = await UsersService.getListOfUsers(
					this.table.currentPage,
					this.perPage,
					this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
					this.table.searchPhrase,
					null,
					null,
					{ showVendors: false },
				);

				this.table.total = totalCount;
				this.table.data = this.prepareDataForTable(data);
			} catch (e) {
				if (e.message) Notification(`${this.$t("Users")} ${e}`, "is-danger");
			}

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
					if (e.message) Notification(`${this.$t("Roles")} ${e}`, "is-danger");
				});
		},

		async exportUsers(type, format) {
			if (type === EXPORT.USERS) {
				this.exportControl.loading = true;
				await UsersService.exportUsers(format)
					.then(({ data, status, message }) => {
						if (status === 200) {
							const blob = new Blob([data], { type: data.type });
							const link = document.createElement("a");
							link.href = window.URL.createObjectURL(blob);
							link.download = `Users ${normalizeExportDate()}.${format}`;
							link.click();
						} else {
							Notification(message, "is-warning");
						}
					})
					.catch((e) => {
						if (e.message) Notification(`${this.$t("Export Users")} ${e}`, "is-danger");
					});
				this.exportControl.loading = false;
			}
		},
	},
};
</script>
