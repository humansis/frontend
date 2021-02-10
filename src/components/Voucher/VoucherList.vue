<template>
	<div>
		<Table
			has-reset-sort
			has-search
			:key="resetSortKey"
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
					<ColumnField :data="props" :column="column" />
				</b-table-column>
			</template>
			<b-table-column
				v-slot="props"
				label="Actions"
				width="145"
				centered
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-info"
						tooltip="Show Detail"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Voucher"
						tooltip="Delete"
						:disabled="!props.row.deletable"
						:id="props.row.id"
						@submitted="remove"
					/>
					<ActionButton icon="print" type="is-dark" tooltip="Print" />
				</div>
			</b-table-column>
			<template slot="filterButton">
				<div class="column">
					<button
						class="button"
						slot="trigger"
						@click="filtersToggle"
					>
						<span>Advanced search</span>
						<b-icon
							size="is-small"
							:icon="advancedSearchVisible ? 'arrow-up' : 'arrow-down'"
						/>
					</button>
				</div>
			</template>
			<template slot="filter">
				<b-collapse v-model="advancedSearchVisible">
					<VoucherFilters
						@filtersChanged="onFiltersChange"
					/>
				</b-collapse>
			</template>
		</Table>
	</div>
</template>

<script>
import { prepareDataForTable } from "@/mappers/voucherMapper";
import Table from "@/components/DataGrid/Table";
import SafeDelete from "@/components/SafeDelete";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import BookletsService from "@/services/BookletsService";
import { generateColumns } from "@/utils/datagrid";
import grid from "@/mixins/grid";
import VoucherFilters from "@/components/Voucher/VoucherFilters";

export default {
	name: "VoucherList",

	components: {
		VoucherFilters,
		SafeDelete,
		Table,
		ActionButton,
		ColumnField,
	},

	mixins: [grid],

	data() {
		return {
			advancedSearchVisible: false,
			filters: [],
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "project" },
					{ key: "code", sortable: true },
					{ key: "numberVouchers", label: "Quantity Of Vouchers", sortable: true },
					{ key: "value", label: "Total Value", sortable: true, attribute: "totalValue", type: "different" },
					{ key: "currency", sortable: true },
					{ key: "status", sortable: true },
					{ key: "beneficiary", sortable: true },
					{ key: "assistance", sortable: true },
				],
				total: 0,
				currentPage: 1,
				searchPhrase: "",
				sortColumn: "",
				sortDirection: "",
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
				result = "Detail of Voucher";
			} else {
				result = "Create new Voucher";
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

			this.table.columns = generateColumns(this.table.visibleColumns);
			await BookletsService.getListOfBooklets(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(async ({ data, totalCount }) => {
				this.table.data = await prepareDataForTable(data);
				this.table.total = totalCount;
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
	},
};
</script>
