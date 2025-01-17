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
		@rowClicked="(row) => onShowVendorDetail(row.item)"
	>
		<template v-slot:actions="{ row, index }">
			<ButtonAction
				:required-permissions="PERMISSIONS.VENDOR_SUMMARY"
				:data-cy="prepareComponentIdentifier(`row-${index + 1}-show-summary-button`)"
				icon="hand-holding-usd"
				tooltip-text="Show Vendor Summary"
				@actionConfirmed="onShowSummary(row)"
			/>

			<ButtonAction
				:required-permissions="PERMISSIONS.VENDOR_DETAIL"
				:data-cy="prepareComponentIdentifier(`row-${index + 1}-show-detail-button`)"
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row)"
			/>

			<ButtonAction
				:required-permissions="PERMISSIONS.VENDOR_EDIT"
				:data-cy="prepareComponentIdentifier(`row-${index + 1}-edit-button`)"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row)"
			/>

			<ButtonAction
				:required-permissions="PERMISSIONS.VENDOR_DELETE"
				:data-cy="prepareComponentIdentifier(`row-${index + 1}-delete-button`)"
				icon="trash"
				tooltip-text="Delete"
				icon-color="red"
				confirm-title="Deleting Vendor"
				confirm-message="Are you sure you want to delete Vendor?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				is-confirm-action
				@actionConfirmed="onRemove(row.id)"
			/>
		</template>

		<template v-slot:tableControls>
			<ExportControl
				:required-permissions="PERMISSIONS.VENDOR_EXPORT"
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
import VendorService from "@/services/VendorService";
import VendorsFilter from "@/components/Beneficiaries/VendorsFilter";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import ExportControl from "@/components/Inputs/ExportControl";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
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

	mixins: [
		grid,
		baseHelper,
		permissions,
		urlFiltersHelper,
		identifierBuilder,
	],

	data() {
		return {
			TABLE,
			isAdvancedSearchVisible: false,
			isLoadingList: false,
			filters: {},
			locationsFilter: {},
			dataCy: "table",
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
			try {
				this.isLoadingList = true;
				this.table.progress = null;

				this.setGridFiltersToUrl("vendors");

				const sort = this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "";
				const {
					data: { data, totalCount },
					status,
					message,
				} = await VendorService.getListOfVendors({
					page: this.table.currentPage,
					size: this.perPage,
					filters: this.filters,
					search: this.table.searchPhrase,
					sort,
				});

				this.table.data = [];

				checkResponseStatus(status, message);

				this.table.total = totalCount;
				this.table.dataUpdated = true;

				if (totalCount > 0) {
					await this.prepareDataForTable(data);
				}
			} catch (e) {
				Notification(`${this.$t("Vendors")}: ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
				this.table.progress = 100;
			}
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

		prepareDataForTable(data) {
			data.forEach((item, key) => {
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

				this.table.data[key] = {
					...item,
					categoryType: categoryTypes,
					location: item.location.name,
					username: item.user.name,
				};
			});
		},

		onShowSummary(vendor) {
			this.$emit("showSummary", vendor);
		},

		onShowVendorDetail(item) {
			if (this.isUserPermissionGranted(this.PERMISSIONS.VENDOR_DETAIL)) {
				this.onShowDetail(item);
			}
		},

		async getLocations(locationIds) {
			if (!locationIds?.length) return [];

			try {
				const {
					data: { data },
					status,
					message,
				} = await LocationsService.getLocations({ ids: locationIds });

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Locations")}: ${e.message || e}`, "error");
			}

			return [];
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
					const {
						data,
						status,
						message,
					} = await VendorService.exportVendors({
						format,
						filters,
					});

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
