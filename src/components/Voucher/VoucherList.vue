<template>
	<Table
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
			:label="$t('Actions')"
			width="145"
			centered
		>
			<div class="buttons is-right">
				<ActionButton
					icon="search"
					type="is-primary"
					:tooltip="$t('Show Detail')"
					@click.native="showDetailWithId(props.row.id)"
				/>
				<SafeDelete
					icon="trash"
					:entity="$t('Voucher')"
					:tooltip="$t('Delete')"
					:disabled="!props.row.deletable"
					:id="props.row.id"
					@submitted="remove"
				/>
				<ActionButton
					v-if="userCan.exportPrintVouchers"
					icon="print"
					type="is-dark"
					:tooltip="$t('Print')"
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
				<VoucherFilters
					@filtersChanged="onFiltersChange"
				/>
			</b-collapse>
		</template>
		<template #export>
			<ExportButton
				v-if="userCan.exportPrintVouchers"
				class="ml-3"
				space-between
				type="is-primary"
				:loading="exportLoading"
				:formats="{ xlsx: true, csv: true, ods: true}"
				@onExport="exportBooklets"
			/>
		</template>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import SafeDelete from "@/components/SafeDelete";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import BookletsService from "@/services/BookletsService";
import { generateColumns } from "@/utils/datagrid";
import { getBookletStatus } from "@/utils/helpers";
import grid from "@/mixins/grid";
import VoucherFilters from "@/components/Voucher/VoucherFilters";
import voucherHelper from "@/mixins/voucherHelper";
import { Notification } from "@/utils/UI";
import ExportButton from "@/components/ExportButton";
import permissions from "@/mixins/permissions";

export default {
	name: "VoucherList",

	components: {
		ExportButton,
		VoucherFilters,
		SafeDelete,
		Table,
		ActionButton,
		ColumnField,
	},

	mixins: [permissions, grid, voucherHelper],

	data() {
		return {
			advancedSearchVisible: false,
			filters: [],
			exportLoading: false,
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

	computed: {
		modalHeader() {
			let result = "";
			if (this.voucherModal.isDetail) {
				result = this.$t("Detail of Voucher");
			} else {
				result = this.$t("Create New Voucher");
			}
			return result;
		},
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;
			this.table.progress = null;

			this.table.columns = generateColumns(this.table.visibleColumns);
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

		async onFiltersChange(selectedFilters) {
			this.filters = selectedFilters;
			await this.fetchData();
		},

		getStatus(code) {
			return getBookletStatus(code).value;
		},

		async exportBooklets(format) {
			this.exportLoading = true;
			await BookletsService.exportBooklets(format)
				.then(({ data }) => {
					const blob = new Blob([data], { type: data.type });
					const link = document.createElement("a");
					link.href = window.URL.createObjectURL(blob);
					link.download = `booklets.${format}`;
					link.click();
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Export Booklets")} ${e}`, "is-danger");
				});
			this.exportLoading = false;
		},
	},
};
</script>
