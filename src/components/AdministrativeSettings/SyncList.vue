<template>
	<Table
		has-search
		has-reset-sort
		has-export
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		@clicked="showDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort"
		@search="onSearch"
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
		<template #filter>
			<b-collapse v-model="advancedSearchVisible">
				<SyncFilter @filtersChanged="onFiltersChange" />
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
					{ type: "text", key: "id", label: "syncId" },
					{ type: "date", key: "createdAt", label: "Datetime" },
					{ type: "text", key: "username" },
					{ type: "text", key: "vendorNo" },
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

			// TODO fetch sync data
			await SyncService.getListOfSync(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(({ data, totalCount }) => {
				this.table.data = [];
				this.table.total = totalCount;

				this.prepareDataForTable(data);

				// TODO Change progress and add this.prepareDataForTable(data)
				this.table.progress = 100;
			}).catch((e) => {
				if (e.message) console.error(e);
			});

			this.isLoadingList = false;
		},

		// TODO
		prepareDataForTable(data) {
			const vendorIds = [];

			data.forEach((item, key) => {
				vendorIds.push(item.vendorId);

				this.table.data[key] = {
					...item,
				};
			});

			this.prepareVendorsForTable([...new Set(vendorIds)]);
		},

		// TODO
		async prepareVendorsForTable(vendorIds) {
			const vendors = await this.getVendors(vendorIds);
			const userIds = [];

			this.table.data.forEach((item, key) => {
				const { vendorNo } = vendors.find(({ id }) => item.id === id);

				this.table.data[key].vendorNo = vendorNo;
			});

			await this.prepareUsersForTable([...new Set(userIds)]);
		},

		async prepareUsersForTable(userIds) {
			const users = await this.getUsers(userIds);
			this.table.data.forEach((item, key) => {
				const { email } = users.find(({ id }) => item.id === id);

				this.table.data[key].username = email;
			});
		},

		async getUsers(vendors) {
			if (!vendors?.length) return [];
			return UsersService.getListOfUsers(null, null, null, null, vendors, "userId")
				.then(({ data }) => data).catch((e) => {
					if (e.message) Notification(`${this.$t("Users")} ${e}`, "is-danger");
				});
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		async onFiltersChange(selectedFilters) {
			this.filters = selectedFilters;
			this.table.currentPage = 1;
			await this.fetchData();
		},
	},
};
</script>
