<template>
	<Table
		has-search
		has-reset-sort
		has-export
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:search-phrase="table.searchPhrase"
		@clicked="showDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort"
		@onSearch="onSearch"
	>
		<template v-for="column in table.columns">
			<b-table-column
				v-bind="column"
				v-slot="props"
				:sortable="column.sortable"
				:key="column.id"
			>
				<ColumnField :column="column" :data="props" />
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			width="145"
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
			</div>
		</b-table-column>
		<template #filterButton>
			<b-button
				slot="trigger"
				:icon-right="advancedSearchVisible ? 'arrow-up' : 'arrow-down'"
				@click="filtersToggle"
			>
				{{ $t('Advanced Search') }}
			</b-button>
		</template>
		<template #progress>
			<b-progress :value="table.progress" format="percent" />
		</template>
		<template slot="resetSort">
			<div class="level-right">
				<b-button
					icon-left="eraser"
					class="reset-sort-button is-small mr-2"
					@click="resetFilters"
				>
					{{ $t('Reset Filters') }}
				</b-button>
			</div>
		</template>
		<template #filter>
			<b-collapse v-model="advancedSearchVisible">
				<SyncFilter
					ref="syncFilter"
					@filtersChanged="onFiltersChange"
					@onSearch="onSearch(table.searchPhrase)"
				/>
			</b-collapse>
		</template>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import SyncService from "@/services/SyncService";
import { generateColumns } from "@/utils/datagrid";
import grid from "@/mixins/grid";
import SyncFilter from "@/components/AdministrativeSettings/SyncFilter";
import permissions from "@/mixins/permissions";
import UsersService from "@/services/UsersService";
import VendorService from "@/services/VendorService";
import { Notification } from "@/utils/UI";

export default {
	name: "SyncList",

	components: {
		ColumnField,
		Table,
		ActionButton,
		SyncFilter,
	},

	mixins: [grid, permissions],

	data() {
		return {
			advancedSearchVisible: false,
			exportLoading: false,
			filters: [],
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ type: "text", key: "id", label: "Sync Id" },
					{ type: "text", key: "username" },
					{ type: "text", key: "vendorNo" },
					{ type: "date", key: "createdAt", label: "Datetime" },
					{ type: "text", key: "validationErrors" },
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

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;
			this.table.progress = null;
			this.table.columns = generateColumns(this.table.visibleColumns);

			await SyncService.getListOfSync(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(({ data, totalCount }) => {
				this.table.data = [];
				this.table.total = totalCount;

				if (data?.length) this.prepareDataForTable(data);
			}).catch((e) => {
				if (e.message) console.error(e);
			});

			this.isLoadingList = false;
		},

		async prepareDataForTable(data) {
			const vendorIds = [];

			data.forEach((item, key) => {
				vendorIds.push(item.vendorId);

				let violations = [];

				try {
					violations = JSON.parse(item.violations) || [];
				} catch (e) {
					violations = null;
				}

				this.table.data[key] = {
					...item,
					validationErrors: violations?.length,
				};
			});

			this.table.data = [...this.table.data];
			await this.prepareVendorsForTable([...new Set(vendorIds)]);
		},

		async prepareVendorsForTable(vendorIds) {
			if (vendorIds?.length) {
				const vendors = await this.getVendors(vendorIds);
				const userIds = [];

				this.table.data.forEach((item, key) => {
					const { vendorNo, userId } = vendors?.find(({ id }) => item.vendorId === id) ?? {};

					if (userId) userIds.push(userId);

					this.table.data[key] = {
						...this.table.data[key],
						vendorNo,
						userId,
					};
				});

				this.table.data = [...this.table.data];
				await this.prepareUsersForTable([...new Set(userIds)]);
			}
		},

		async prepareUsersForTable(userIds) {
			if (userIds?.length) {
				const users = await this.getUsers(userIds);

				this.table.data.forEach((item, key) => {
					const { email } = users.find(({ id }) => item.userId === id) ?? {};

					this.table.data[key].username = email;
				});

				this.table.data = [...this.table.data];
				this.table.progress = 100;
			} else {
				this.table.progress = 100;
			}
		},

		async getUsers(ids) {
			if (!ids?.length) return [];

			try {
				const { data: { data } } = await UsersService.getListOfUsers(
					null,
					null,
					null,
					null,
					ids,
					"userId",
					{ showVendors: true },
				);

				return data;
			} catch (e) {
				if (e.message) Notification(`${this.$t("Users")} ${e}`, "is-danger");
			}

			return [];
		},

		async getVendors(ids) {
			if (!ids.length) return [];

			try {
				const { data: { data } } = await VendorService.getListOfVendors(
					null,
					null, null,
					null,
					ids,
				);

				return data;
			} catch (e) {
				if (e.message) Notification(`${this.$t("Vendors")} ${e}`, "is-danger");
			}

			return [];
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		resetFilters() {
			this.$refs.syncFilter.resetFilters();
		},

		async onFiltersChange({ filters }) {
			this.table.progress = 0;
			this.filters = filters;
			this.table.currentPage = 1;
			await this.fetchData();
		},
	},
};
</script>
