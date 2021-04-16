<template>
	<Table
		v-show="show"
		has-reset-sort
		has-search
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
			<b-table-column v-bind="column" sortable :key="column.id">
				<template v-slot="props">
					{{ props.row[column.field] }}
				</template>
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			width="190"
			centered
			:label="$t('Actions')"
		>
			<div class="buttons is-right">
				<ActionButton
					icon="search"
					type="is-primary"
					:tooltip="$t('Show Detail')"
					@click.native="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					icon="edit"
					:tooltip="$t('Edit')"
					@click.native="showEdit(props.row.id)"
				/>
				<SafeDelete
					icon="trash"
					:entity="$t('Vendor')"
					:tooltip="$t('Delete')"
					:id="props.row.id"
					@submitted="remove"
				/>
			</div>
		</b-table-column>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import SafeDelete from "@/components/SafeDelete";
import ActionButton from "@/components/ActionButton";
import VendorService from "@/services/VendorService";
import LocationsService from "@/services/LocationsService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";
import UsersService from "@/services/UsersService";
import baseHelper from "@/mixins/baseHelper";

export default {
	name: "VendorList",

	components: {
		SafeDelete,
		Table,
		ActionButton,
	},

	mixins: [grid, baseHelper],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "username" },
					{ key: "name" },
					{ key: "vendorNo", label: this.$t("Vendor No.") },
					{ key: "contractNo", label: this.$t("Contract No.") },
					{ key: "addressNumber" },
					{ key: "addressPostcode" },
					{ key: "addressStreet" },
					{ key: "location" },
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

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await VendorService.getListOfVendors(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then(({ data, totalCount }) => {
				this.table.data = [];
				this.table.total = totalCount;
				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			}).catch((e) => {
				Notification(`${this.$t("Vendors")} ${e}`, "is-danger");
			});
			this.isLoadingList = false;
		},

		async prepareDataForTable(data) {
			this.table.data = data;
			this.getUsers(data)
				.then((users) => {
					this.table.data.map(async (item, key) => {
						this.table.data[key] = item;
						this.table.data[key].username = this.prepareEntityForTable(item.userId, users, "username");
					});
					this.reload();
				});
			this.getLocations(data)
				.then((locations) => {
					this.table.data.map(async (item, key) => {
						this.table.data[key] = item;
						this.table.data[key].location = this
							.prepareLocationEntityForTable(item.locationId, locations);
					});
					this.reload();
				});
		},

		async getLocations(vendors) {
			if (!vendors?.length) return [];
			return LocationsService.getLocations(vendors, "locationId")
				.then(({ data }) => data).catch((e) => {
					Notification(`${this.$t("Locations")} ${e}`, "is-danger");
				});
		},

		async getUsers(vendors) {
			if (!vendors?.length) return [];
			return UsersService.getListOfUsers(null, null, null, null, vendors, "userId")
				.then(({ data }) => data).catch((e) => {
					Notification(`${this.$t("Users")} ${e}`, "is-danger");
				});
		},
	},
};
</script>
