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
			field="actions"
			:label="$t('Actions')"
		>
			<div class="buttons is-right">
				<ActionButton
					icon="hand-holding-usd"
					tooltip="Show Vendor Summary"
					@click="showSummary(props.row)"
				/>
				<ActionButton
					icon="search"
					type="is-primary"
					:tooltip="$t('Show Detail')"
					@click="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					v-if="userCan.addEditVendors"
					icon="edit"
					:tooltip="$t('Edit')"
					@click="showEdit(props.row.id)"
				/>
				<SafeDelete
					v-if="userCan.addEditVendors"
					icon="trash"
					:entity="$t('Vendor')"
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
				@onExport="exportVendors"
			/>
		</template>
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
import permissions from "@/mixins/permissions";
import ExportButton from "@/components/ExportButton";

export default {
	name: "VendorsList",

	components: {
		ExportButton,
		SafeDelete,
		Table,
		ActionButton,
	},

	mixins: [grid, baseHelper, permissions],

	data() {
		return {
			exportLoading: false,
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

	created() {
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
				if (e.message) Notification(`${this.$t("Vendors")} ${e}`, "is-danger");
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
							.prepareLocationEntityForTable(item.locationId, locations, "name");
					});
					this.reload();
				});
		},

		showSummary(vendor) {
			this.$emit("onShowSummary", vendor);
		},

		async getLocations(vendors) {
			if (!vendors?.length) return [];
			return LocationsService.getLocations(vendors, "locationId")
				.then(({ data }) => data).catch((e) => {
					if (e.message) Notification(`${this.$t("Locations")} ${e}`, "is-danger");
				});
		},

		async getUsers(vendors) {
			if (!vendors?.length) return [];
			return UsersService.getListOfUsers(null, null, null, null, vendors, "userId")
				.then(({ data }) => data).catch((e) => {
					if (e.message) Notification(`${this.$t("Users")} ${e}`, "is-danger");
				});
		},

		async exportVendors(format) {
			this.exportLoading = true;
			await VendorService.exportVendors(format)
				.then(({ data }) => {
					const blob = new Blob([data], { type: data.type });
					const link = document.createElement("a");
					link.href = window.URL.createObjectURL(blob);
					link.download = `vendors.${format}`;
					link.click();
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Export Vendors")} ${e}`, "is-danger");
				});
			this.exportLoading = false;
		},
	},
};
</script>
