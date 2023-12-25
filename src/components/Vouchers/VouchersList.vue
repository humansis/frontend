<template>
	<Table
		v-model="table.checkedRows"
		v-model:items-per-page="perPage"
		v-model:sort-by="sortValue"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		ref="vouchersList"
		show-select
		reset-sort-button
		reset-filters-button
		is-search-visible
		@update:modelValue="onRowsChecked"
		@per-page-changed="perPageChange"
		@page-changed="pageChange"
		@update:sortBy="onSort"
		@search="search"
		@resetSort="resetSort(TABLE.DEFAULT_SORT_OPTIONS.VOUCHERS)"
		@resetFilters="resetFilters"
		@rowClicked="(row) => showDetail(row.item)"
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				:disabled="!bookletsSelects"
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="showDetail(row)"
			/>

			<ButtonAction
				:disabled="!bookletsSelects"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="showEdit(row)"
			/>

			<ButtonAction
				:disabled="!row.deletable || !bookletsSelects"
				icon="trash"
				tooltip-text="Delete"
				icon-color="red"
				confirm-title="Deleting Voucher"
				confirm-message="Are you sure sure you want to delete Voucher?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				is-confirm-action
				@actionConfirmed="remove(row.id)"
			/>

			<ButtonAction
				v-if="userCan.exportPrintVouchers"
				:disabled="!bookletsSelects"
				icon="print"
				tooltip-text="Print"
				@actionConfirmed="printBooklets(row)"
			/>
		</template>

		<template v-slot:tableControls>
			<ExportControl
				:disabled="isExportDisabled"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				@onExport="exportBooklets"
			/>

			<v-btn
				:append-icon="isAdvancedSearchVisible ? 'arrow-up' : 'arrow-down'"
				size="small"
				color="blue-grey-lighten-4"
				variant="elevated"
				class="ml-4 text-none"
				@click="advancedSearchToggle"
			>
				{{ $t('Advanced Search') }}
			</v-btn>

			<v-btn
				v-show="!bookletsSelects"
				:loading="printSelectionLoading"
				size="small"
				color="primary"
				variant="elevated"
				class="ml-4 text-none"
				@click="printSelection"
			>
				{{ $t('Print Selection') }}
			</v-btn>
		</template>

		<template v-slot:advancedControls>
			<v-expansion-panels v-model="isAdvancedSearchVisible">
				<v-expansion-panel :value="true" eager>
					<v-expansion-panel-text>
						<VouchersFilter
							ref="vouchersFilter"
							:defaultFilters="{ ...filters }"
							@filtersChanged="onFiltersChange"
							@onSearch="search(table.searchPhrase)"
						/>
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
		</template>
	</Table>
</template>

<script>
import BookletsService from "@/services/BookletsService";
import ButtonAction from "@/components/ButtonAction";
import Table from "@/components/DataGrid/Table";
import ExportControl from "@/components/Inputs/ExportControl";
import VouchersFilter from "@/components/Vouchers/VouchersFilter";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import voucherHelper from "@/mixins/voucherHelper";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { downloadFile, getBookletStatus } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, TABLE } from "@/consts";

export default {
	name: "VouchersList",

	components: {
		ButtonAction,
		ExportControl,
		VouchersFilter,
		Table,
	},

	mixins: [permissions, grid, voucherHelper, urlFiltersHelper],

	data() {
		return {
			TABLE,
			isAdvancedSearchVisible: false,
			filters: {},
			printLoading: false,
			printSelectionLoading: false,
			bookletsSelects: true,
			exportControl: {
				loading: false,
				location: "vouchers",
				types: [EXPORT.VOUCHERS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			table: {
				data: [],
				columns: generateColumns([
					{ key: "project", sortable: false },
					{ key: "code" },
					{ key: "quantityOfVouchers", title: "Quantity of Vouchers", sortKey: "numberVouchers" },
					{ key: "totalValue", title: "Total Value", sortKey: "value" },
					{ key: "currency" },
					{ key: "status" },
					{ key: "beneficiary" },
					{ key: "assistance", sortKey: "distribution" },
					{ key: "actions", value: "actions", sortable: false },
				]),
				checkedRows: [],
				total: 0,
				currentPage: 1,
				searchPhrase: "",
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.VOUCHERS.key,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.VOUCHERS.order,
				progress: null,
				dataUpdated: false,
			},
		};
	},

	computed: {
		isExportDisabled() {
			return !this.userCan.exportPrintVouchers || !this.table.data.length
				|| !this.table.dataUpdated;
		},
	},

	created() {
		this.setGridFilters("vouchers", false);
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;
			this.table.progress = null;

			this.setGridFiltersToUrl("vouchers", false);
			await BookletsService.getListOfBooklets(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "",
				this.table.searchPhrase,
				this.filters,
			).then(({ data, totalCount }) => {
				this.table.data = [];
				this.table.progress = 0;
				this.table.total = totalCount;
				this.table.dataUpdated = true;
				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			});

			this.isLoadingList = false;
		},

		advancedSearchToggle() {
			this.isAdvancedSearchVisible = !this.isAdvancedSearchVisible;
		},

		getStatus(code) {
			return getBookletStatus(code).value;
		},

		async exportBooklets(exportType, format) {
			if (exportType === EXPORT.VOUCHERS) {
				try {
					this.exportControl.loading = true;

					let ids = null;

					if (!this.bookletsSelects) {
						ids = this.table.checkedRows.map((item) => item.id);
					}

					const filename = `Vouchers ${normalizeExportDate()}`;
					const { data, status, message } = await BookletsService.exportBooklets(
						format,
						ids,
					);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Booklets")} ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},

		onRowsChecked(rows) {
			this.table.checkedRows = rows;
			this.bookletsSelects = !rows?.length;
		},

		async printSelection() {
			this.printSelectionLoading = true;

			const ids = this.table.checkedRows.map((id) => id);

			await BookletsService.exportQRVouchers(ids)
				.then(({ data, status, message }) => {
					if (status === 200) {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `Booklets.pdf`;
						link.click();
					} else {
						Notification(message, "warning");
					}
				}).catch((e) => {
					Notification(`${this.$t("Print Booklet")} ${e.message || e}`, "error");
				});
			this.printSelectionLoading = false;
		},

		async printBooklets({ code, id }) {
			Notification(`${this.$t("Your Voucher Download is Starting")}`, "success");

			await BookletsService.exportQRVouchers([id])
				.then(({ data, status, message }) => {
					if (status === 200) {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `Booklet-${code}.pdf`;
						link.click();
					} else {
						Notification(message, "warning");
					}
				}).catch((e) => {
					Notification(`${this.$t("Print Booklet")} ${e.message || e}`, "error");
				});
		},

		resetFilters() {
			this.resetSearch({ tableRef: "vouchersList", filtersRef: "vouchersFilter" });
		},

		resetTableSort() {
			this.$refs.vouchersList.onResetSort();
		},
	},
};
</script>
