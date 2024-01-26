<template>
	<DataGrid
		ref="vendorsList"
		v-show="show"
		v-model:items-per-page="perPage"
		v-model:sort-by="sortValue"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		:search-phrase="table.searchPhrase"
		reset-sort-button
		reset-filters-button
		is-search-visible
		@perPageChanged="onPerPageChange"
		@pageChanged="onPageChange"
		@update:sortBy="onSort"
		@search="onSearch"
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.VENDORS)"
		@resetFilters="onResetVendorsFilters"
		@rowClicked="(row) => onShowDetail(row.item)"
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				icon="hand-holding-usd"
				tooltip-text="Show Vendor Summary"
				@actionConfirmed="onShowSummary(row)"
			/>

			<ButtonAction
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row)"
			/>

			<ButtonAction
				v-if="userCan.addEditVendors"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row)"
			/>

			<ButtonAction
				v-if="userCan.addEditVendors"
				icon="trash"
				tooltip-text="Delete"
				icon-color="red"
				confirm-title="Deleting Vendor"
				confirm-message="Are you sure sure you want to delete Vendor?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				is-confirm-action
				@actionConfirmed="onRemove(row.id)"
			/>
		</template>

		<template v-slot:tableControls>
			<ExportControl
				:disabled="!table.dataUpdated || !table.data.length"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				@export="onExportVendors"
			/>

			<v-btn
				:append-icon="isAdvancedSearchVisible ? 'arrow-up' : 'arrow-down'"
				color="blue-grey-lighten-4"
				variant="elevated"
				class="ml-4 text-none"
				@click="onAdvancedSearchToggle"
			>
				{{ $t('Advanced Search') }}
			</v-btn>
		</template>

		<template v-slot:advancedControls>
			<v-expansion-panels v-model="isAdvancedSearchVisible">
				<v-expansion-panel :value="true" eager>
					<v-expansion-panel-text>
						<VendorsFilter
							ref="vendorsFilter"
							:defaultFilters="{ ...filters, ...locationsFilter }"
							@filtersChanged="onFiltersChange"
							@search="onSearch(table.searchPhrase)"
						/>
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
		</template>
	</DataGrid>
</template>

<script>
import LocationsService from "@/services/LocationsService";
import UsersService from "@/services/UsersService";
import VendorService from "@/services/VendorService";
import VendorsFilter from "@/components/Beneficiaries/VendorsFilter";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import ExportControl from "@/components/Inputs/ExportControl";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import { getUniqueIds } from "@/utils/customValidators";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, TABLE } from "@/consts";

export default {
	name: "VendorsList",

	components: {
		ExportControl,
		DataGrid,
		VendorsFilter,
		ButtonAction,
	},

	mixins: [grid, baseHelper, permissions, urlFiltersHelper],

	data() {
		return {
			TABLE,
			isAdvancedSearchVisible: false,
			isLoadingList: false,
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
				columns: generateColumns([
					{ key: "id", title: "ID" },
					{ key: "username" },
					{ key: "name" },
					{ key: "categoryType", type: "svgIcon", sortable: false },
					{ key: "vendorNo", title: "Vendor No.", sortable: false },
					{ key: "contractNo", title: "Contract No.", sortable: false },
					{ key: "addressNumber" },
					{ key: "addressPostcode" },
					{ key: "addressStreet" },
					{ key: "location" },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.VENDORS.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.VENDORS.key,
				searchPhrase: "",
				sortReset: false,
				progress: null,
				dataUpdated: false,
			},
		};
	},

	created() {
		this.setGridFilters("vendors");
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;
			this.table.progress = null;

			this.setGridFiltersToUrl("vendors");
			await VendorService.getListOfVendors(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "",
				this.filters,
				this.table.searchPhrase,
			).then(({ data, totalCount }) => {
				this.table.data = [];
				this.table.total = totalCount;
				this.table.dataUpdated = true;
				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			}).catch((e) => {
				Notification(`${this.$t("Vendors")} ${e.message || e}`, "error");
			});
			this.isLoadingList = false;
			this.table.progress = 100;
		},

		onAdvancedSearchToggle() {
			this.isAdvancedSearchVisible = !this.isAdvancedSearchVisible;
		},

		onResetVendorsFilters() {
			this.resetSearch({ tableRef: "vendorsList", filtersRef: "vendorsFilter" });
		},

		resetTableSort() {
			this.$refs.vendorsList.onResetSort();
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

		onShowSummary(vendor) {
			this.$emit("showSummary", vendor);
		},

		async getLocations(locationIds) {
			if (!locationIds?.length) return [];
			return LocationsService.getLocations(locationIds)
				.then(({ data }) => data).catch((e) => {
					Notification(`${this.$t("Locations")} ${e.message || e}`, "error");
				});
		},

		async getUsers(userIds) {
			if (!userIds?.length) return [];
			return UsersService.getListOfUsers(null, null, null, null, userIds)
				.then(({ data }) => data).catch((e) => {
					Notification(`${this.$t("Users")} ${e.message || e}`, "error");
				});
		},

		async onExportVendors(exportType, format) {
			if (exportType === EXPORT.VENDORS) {
				try {
					this.exportControl.loading = true;

					const filters = {
						...this.filters,
						...(this.table.searchPhrase && { fulltext: this.table.searchPhrase }),
					};
					const filename = `BNF Vendors ${normalizeExportDate()}`;
					const { data, status, message } = await VendorService.exportVendors(format, filters);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Vendors")} ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>
