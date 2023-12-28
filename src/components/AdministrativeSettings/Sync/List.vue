<template>
	<Table
		v-model:items-per-page="perPage"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		is-search-visible
		@perPageChanged="onPerPageChange"
		@pageChanged="onPageChange"
		@search="onSearch"
		@rowClicked="(row) => onShowDetail(row.item)"
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row)"
			/>
		</template>
	</Table>
</template>

<script>
import SyncService from "@/services/SyncService";
import UsersService from "@/services/UsersService";
import VendorService from "@/services/VendorService";
import SyncFilter from "@/components/AdministrativeSettings/Sync/Filter";
import ButtonAction from "@/components/ButtonAction";
import Table from "@/components/DataGrid/Table";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns } from "@/utils/datagrid";

export default {
	name: "SyncList",

	components: {
		Table,
		SyncFilter,
		ButtonAction,
	},

	mixins: [grid, permissions],

	data() {
		return {
			advancedSearchVisible: false,
			exportLoading: false,
			filters: [],
			table: {
				data: [],
				columns: generateColumns([
					{ key: "id", type: "text", title: "Sync Id" },
					{ key: "username", type: "text" },
					{ key: "vendorNo", type: "text" },
					{ key: "createdAt", type: "date", title: "Datetime" },
					{ key: "validationErrors", type: "text" },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
			},
		};
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

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
			}
		},

		async getUsers(ids) {
			if (!ids?.length) return [];
			return UsersService.getListOfUsers(null, null, null, null, ids, "userId")
				.then(({ data }) => data).catch((e) => {
					if (e.message) console.error(e.message);
				});
		},

		async getVendors(ids) {
			if (!ids.length) return [];
			return VendorService.getListOfVendors(null, null, null, null, ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) console.error(e.message);
				});
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		resetFilters() {
			this.$refs.syncFilter.resetFilters();
		},

		async onFiltersChange({ filters }) {
			this.filters = filters;
			this.table.currentPage = 1;
			await this.fetchData();
		},
	},
};
</script>
