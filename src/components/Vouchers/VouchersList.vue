<template>
	<Table
		ref="vouchersList"
		has-reset-sort
		has-search
		checkable
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:search-phrase="table.searchPhrase"
		:checked-rows="table.checkedRows"
		@checked="onRowsChecked"
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
				:key="column.id"
				v-slot="props"
			>
				<template v-if="column.field === 'status'">
					{{ getStatus(props.row[column.field]) }}
				</template>
				<ColumnField v-else :data="props" :column="column" />
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			width="180"
			field="actions"
			:label="$t('Actions')"
		>
			<div class="buttons is-right">
				<ActionButton
					icon="search"
					type="is-primary"
					:tooltip="$t('Show Detail')"
					:disabled="!bookletsSelects"
					@click="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					icon="edit"
					:tooltip="$t('Edit')"
					:disabled="!bookletsSelects"
					@click="showEdit(props.row.id)"
				/>
				<SafeDelete
					icon="trash"
					:entity="$t('Voucher')"
					:tooltip="$t('Delete')"
					:disabled="!props.row.deletable || !bookletsSelects"
					:id="props.row.id"
					@submitted="remove"
				/>
				<ActionButton
					v-if="userCan.exportPrintVouchers"
					icon="print"
					type="is-dark"
					:disabled="!bookletsSelects"
					:tooltip="$t('Print')"
					@click="printBooklets(props.row)"
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
				<b-button
					icon-left="eraser"
					class="reset-sort-button is-small"
					@click="resetTableSort"
				>
					{{ $t('Reset Table Sort') }}
				</b-button>
			</div>
		</template>
		<template #filter>
			<b-collapse v-model="advancedSearchVisible">
				<VouchersFilter
					ref="vouchersFilter"
					:defaultFilters="{ ...filters }"
					@filtersChanged="onFiltersChange"
					@onSearch="onSearch(table.searchPhrase)"
				/>
			</b-collapse>
		</template>
		<template #export>
			<ExportControl
				v-if="userCan.exportPrintVouchers && table.data.length"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				@onExport="exportBooklets"
			/>
			<b-button
				v-show="!bookletsSelects"
				type="is-primary"
				class="ml-3"
				:loading="printSelectionLoading"
				@click="printSelection"
			>
				<template>
					<span>{{ $t('Print Selection') }}</span>
				</template>
			</b-button>
		</template>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import SafeDelete from "@/components/SafeDelete";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import BookletsService from "@/services/BookletsService";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { getBookletStatus } from "@/utils/helpers";
import grid from "@/mixins/grid";
import VouchersFilter from "@/components/Vouchers/VouchersFilter";
import voucherHelper from "@/mixins/voucherHelper";
import { Notification } from "@/utils/UI";
import ExportControl from "@/components/Export";
import { EXPORT } from "@/consts";
import permissions from "@/mixins/permissions";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";

export default {
	name: "VouchersList",

	components: {
		ExportControl,
		VouchersFilter,
		SafeDelete,
		Table,
		ActionButton,
		ColumnField,
	},

	mixins: [permissions, grid, voucherHelper, urlFiltersHelper],

	data() {
		return {
			advancedSearchVisible: false,
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
				columns: [],
				visibleColumns: [
					{ key: "project" },
					{ key: "code", sortable: true },
					{ key: "quantityOfVouchers", label: "Quantity of Vouchers", sortable: true, sortKey: "numberVouchers" },
					{ key: "totalValue", label: "Total Value", sortable: true, sortKey: "value" },
					{ key: "currency", sortable: true },
					{ key: "status", sortable: true },
					{ key: "beneficiary", sortable: true },
					{ key: "assistance", sortable: true, sortKey: "distribution" },
				],
				checkedRows: [],
				total: 0,
				currentPage: 1,
				searchPhrase: "",
				sortColumn: "",
				sortDirection: "",
				progress: null,
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	created() {
		this.setGridFilters("vouchers", false);
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;
			this.table.progress = null;

			this.table.columns = generateColumns(this.table.visibleColumns);
			this.setGridFiltersToUrl("vouchers", false);
			await BookletsService.getListOfBooklets(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(({ data, totalCount }) => {
				this.table.data = [];
				this.table.progress = 0;
				this.table.total = totalCount;
				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			});

			this.isLoadingList = false;
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		getStatus(code) {
			return getBookletStatus(code).value;
		},

		async exportBooklets(type, format) {
			if (type === EXPORT.VOUCHERS) {
				this.exportControl.loading = true;
				let ids = null;
				if (!this.bookletsSelects) {
					ids = this.table.checkedRows.map((item) => item.id);
				}
				await BookletsService.exportBooklets(format, ids)
					.then(({ data, status, message }) => {
						if (status === 200) {
							const blob = new Blob([data], { type: data.type });
							const link = document.createElement("a");
							link.href = window.URL.createObjectURL(blob);
							link.download = `Vouchers ${normalizeExportDate()}.${format}`;
							link.click();
						} else {
							Notification(message, "is-warning");
						}
					})
					.catch((e) => {
						if (e.message) Notification(`${this.$t("Export Booklets")} ${e}`, "is-danger");
					});
				this.exportControl.loading = false;
			}
		},

		onRowsChecked(rows) {
			this.table.checkedRows = rows;
			this.bookletsSelects = !rows?.length;
		},

		async printSelection() {
			this.printSelectionLoading = true;
			const ids = this.table.checkedRows.map((item) => item.id);

			await BookletsService.exportQRVouchers(ids)
				.then(({ data, status, message }) => {
					if (status === 200) {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `Booklets.pdf`;
						link.click();
					} else {
						Notification(message, "is-warning");
					}
				}).catch((e) => {
					Notification(`${this.$t("Print Booklet")} ${e}`, "is-danger");
				});
			this.printSelectionLoading = false;
		},

		async printBooklets({ code, id }) {
			Notification(`${this.$t("Your Voucher Download is Starting")}`, "is-success");

			await BookletsService.exportQRVouchers([id])
				.then(({ data, status, message }) => {
					if (status === 200) {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `Booklet-${code}.pdf`;
						link.click();
					} else {
						Notification(message, "is-warning");
					}
				}).catch((e) => {
					Notification(`${this.$t("Print Booklet")} ${e}`, "is-danger");
				});
		},

		resetFilters() {
			this.filters = {};
			this.$refs.vouchersFilter.resetFilters();
			this.$refs.vouchersList.onResetSearch();
		},

		resetTableSort() {
			this.$refs.vouchersList.onResetSort();
		},
	},
};
</script>
