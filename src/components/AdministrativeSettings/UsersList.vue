<template>
	<Table
		has-reset-sort
		has-search
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:export-format="{xlsx: true, csv: true, ods: true}"
		@clicked="showDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@search="onSearch"
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
			:label="$t('Actions')"
			centered
		>
			<div class="buttons is-right">
				<ActionButton
					icon="search"
					type="is-primary"
					:tooltip="$t('Show Detail')"
					@click.native="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					v-if="userCan.addEditUsers"
					icon="edit"
					:tooltip="$t('Edit')"
					@click.native="showEdit(props.row.id)"
				/>
				<SafeDelete
					v-if="userCan.addEditUsers"
					icon="trash"
					:entity="$t('User')"
					:tooltip="$t('Delete')"
					:id="props.row.id"
					@submitted="remove"
				/>
			</div>
		</b-table-column>
		<template #export>
			<ExportButton
				space-between
				type="is-primary"
				:loading="exportLoading"
				:formats="{ xlsx: true, csv: true, ods: true}"
				@onExport="exportUsers"
			/>
		</template>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import UsersService from "@/services/UsersService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";
import ExportButton from "@/components/ExportButton";
import permissions from "@/mixins/permissions";
import SystemService from "@/services/SystemService";

export default {
	name: "UsersList",

	components: {
		ExportButton,
		SafeDelete,
		Table,
		ActionButton,
	},

	mixins: [grid, permissions],

	data() {
		return {
			exportLoading: false,
			roles: [],
			table: {
				data: [],
				columns: [],
				visibleColumns: [
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

	watch: {
		$route: "fetchData",
	},

	async mounted() {
		await this.fetchRoles();
		await this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await UsersService.getListOfUsers(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then(({ data, totalCount }) => {
				this.table.total = totalCount;
				this.table.data = this.prepareDataForTable(data);
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Users")} ${e}`, "is-danger");
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

		async fetchRoles() {
			await SystemService.getRoles()
				.then(({ data }) => {
					this.roles = data;
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Roles")} ${e}`, "is-danger");
				});
		},

		async exportUsers(format) {
			this.exportLoading = true;
			await UsersService.exportUsers(format)
				.then(({ data }) => {
					const blob = new Blob([data], { type: data.type });
					const link = document.createElement("a");
					link.href = window.URL.createObjectURL(blob);
					link.download = `users.${format}`;
					link.click();
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Export Users")} ${e}`, "is-danger");
				});
			this.exportLoading = false;
		},
	},
};
</script>
