<template>
	<Table
		ref="table"
		v-show="show"
		has-reset-sort
		has-search
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
		<template #progress>
			<b-progress :value="table.progress" format="percent" />
		</template>

		<template v-for="column in table.columns">
			<b-table-column
				v-bind="column"
				v-slot="props"
				:key="column.id"
			>
				<ColumnField :column="column" :data="props" />
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
					:tooltip="$t('Show Vendor Summary')"
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

		<template #filterButton>
			<b-button
				slot="trigger"
				:icon-right="advancedSearchVisible ? 'arrow-up' : 'arrow-down'"
				@click="filtersToggle"
			>
				{{ $t('Advanced Search') }}
			</b-button>
		</template>

		<template #filter>
			<b-collapse :open="advancedSearchVisible">
				<VendorsFilter
					ref="vendorsFilter"
					:defaultFilters="{ ...filters, ...locationsFilter }"
					@filtersChanged="onFiltersChange"
					@onSearch="onSearch(table.searchPhrase)"
				/>
			</b-collapse>
		</template>

		<template #export>
			<ExportControl
				v-if="table.data.length"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				@onExport="exportVendors"
			/>
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
				<b-button
					icon-left="eraser"
					class="reset-sort-button is-small"
					@click="resetTableSort"
				>
					{{ $t('Reset Table Sort') }}
				</b-button>
			</div>
		</template>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import SafeDelete from "@/components/SafeDelete";
import ActionButton from "@/components/ActionButton";
import VendorService from "@/services/VendorService";
import LocationsService from "@/services/LocationsService";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";
import UsersService from "@/services/UsersService";
import baseHelper from "@/mixins/baseHelper";
import permissions from "@/mixins/permissions";
import ExportControl from "@/components/Export";
import { EXPORT } from "@/consts";
import ColumnField from "@/components/DataGrid/ColumnField";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import VendorsFilter from "@/components/Beneficiaries/VendorsFilter";
import { getUniqueIds } from "@/utils/customValidators";

/*
const statusTags = [
	{ code: "toRedeem", type: "is-light" },
	{ code: "syncRequired", type: "is-warning" },
	{ code: "invoiced", type: "is-success" },
];
*/

export default {
	name: "VendorsList",

	components: {
		ExportControl,
		SafeDelete,
		Table,
		ActionButton,
		ColumnField,
		VendorsFilter,
	},

	mixins: [grid, baseHelper, permissions, urlFiltersHelper],

	data() {
		return {
			advancedSearchVisible: false,
			filters: {},
			locationsFilter: {},
			exportControl: {
				loading: false,
				location: "vendors",
				types: [EXPORT.VENDORS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id", label: "ID", sortable: true },
					{ key: "username", sortable: true },
					{ key: "name", sortable: true },
					{ key: "categoryType", width: "200", type: "svgIcon" },
					{ key: "vendorNo", label: "Vendor No.", sortable: true },
					{ key: "contractNo", label: "Contract No.", sortable: true },
					// TODO Temporary hidden (not implemented yet)
					// { key: "invoicing", width: "100", type: "tag", customTags: statusTags },
					{ key: "addressNumber", sortable: true },
					{ key: "addressPostcode", sortable: true },
					{ key: "addressStreet", sortable: true },
					{ key: "location", sortable: true },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
				progress: null,
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	created() {
		this.setGridFilters("vendors");
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;
			this.table.progress = null;

			this.table.columns = generateColumns(this.table.visibleColumns);

			this.setGridFiltersToUrl("vendors");
			await VendorService.getListOfVendors(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				null,
				this.filters,
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
			this.table.progress = 100;
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		resetFilters() {
			this.$refs.vendorsFilter.resetFilters();
		},

		resetTableSort() {
			this.$refs.table.onResetSort();
		},

		async prepareDataForTable(data) {
			const locationIds = getUniqueIds(data, "locationId");
			const userIds = getUniqueIds(data, "userId");

			data.forEach((item, key) => {
				this.table.data[key] = item;

				const categoryTypes = [];

				if (item.canSellFood) {
					categoryTypes.push({ code: "Food", value: "Food" });
				}

				if (item.canSellNonFood) {
					categoryTypes.push({ code: "Non-Food", value: "Non-Food" });
				}

				if (item.canSellCashback) {
					categoryTypes.push({ code: "Cashback", value: "Cashback" });
				}

				// TODO Temporary hidden (not implemented yet)
				// this.table.data[key].invoicing = "syncRequired";
				this.table.data[key].categoryType = categoryTypes;
			});

			this.getUsers(userIds)
				.then((users) => {
					this.table.data.map(async (item, key) => {
						this.table.data[key] = item;
						this.table.data[key].username = this.prepareEntityForTable(item.userId, users, "username");
					});
					this.reload();
				});

			this.getLocations(locationIds)
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

		async getLocations(locationIds) {
			if (!locationIds?.length) return [];
			return LocationsService.getLocations(locationIds)
				.then(({ data }) => data).catch((e) => {
					if (e.message) Notification(`${this.$t("Locations")} ${e}`, "is-danger");
				});
		},

		async getUsers(userIds) {
			if (!userIds?.length) return [];
			return UsersService.getListOfUsers(null, null, null, null, userIds)
				.then(({ data }) => data).catch((e) => {
					if (e.message) Notification(`${this.$t("Users")} ${e}`, "is-danger");
				});
		},

		async exportVendors(type, format) {
			if (type === EXPORT.VENDORS) {
				this.exportControl.loading = true;
				await VendorService.exportVendors(format)
					.then(({ data, status, message }) => {
						if (status === 200) {
							const blob = new Blob([data], { type: data.type });
							const link = document.createElement("a");
							link.href = window.URL.createObjectURL(blob);
							link.download = `BNF Vendors ${normalizeExportDate()}.${format}`;
							link.click();
						} else {
							Notification(message, "is-warning");
						}
					})
					.catch((e) => {
						if (e.message) Notification(`${this.$t("Export Vendors")} ${e}`, "is-danger");
					});
				this.exportControl.loading = false;
			}
		},
	},
};
</script>
