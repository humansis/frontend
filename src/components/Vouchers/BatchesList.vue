<!-- TODO Not used for now -->
<template>
	<div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="onSearch" />
			<b-button
				slot="trigger"
				:icon-right="advancedSearchVisible ? 'arrow-up' : 'arrow-down'"
				@click="filtersToggle"
			>
				Advanced Search
			</b-button>
		</div>
		<b-collapse v-model="advancedSearchVisible">
			<VouchersFilter
				@filtersChanged="onFiltersChange"
			/>
		</b-collapse>
		<b-progress :value="table.progress" format="percent" />
		<div class="batches-container" ref="batches">
			<b-collapse
				v-for="(batch, index) of getBatches()"
				class="panel"
				animation="slide"
				:key="index"
				:open="false"
				@open="isOpen = index"
			>
				<div
					slot="trigger"
					class="card-header"
					role="button"
				>
					<p class="card-header-title">
						<b-tag type="is-primary mr-1">{{ index + 1 }}. Batch</b-tag>
						<b-tag type="is-info mr-4">{{ batch.booklets.length }} x Booklets</b-tag>
						{{ batch.code }}
					</p>
					<div v-if="isLoadingList" class="card-header-icon">
						<b-icon icon="spinner" custom-class="fa-spin" />
					</div>
					<a v-else class="card-header-icon">
						<b-icon icon="arrow-down" />
					</a>
				</div>
				<div class="card-content">
					<Table
						checkable
						:data="batch.booklets"
						:is-loading="isLoadingList"
						@clicked="showDetail"
						@pageChanged="onPageChange"
						@sorted="onSort"
						@changePerPage="onChangePerPage"
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
							label="Actions"
							width="145"
						>
							<div class="buttons is-right">
								<ActionButton
									icon="search"
									type="is-primary"
									tooltip="Show Detail"
									@click="showDetailWithId(props.row.id)"
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
					</Table>
				</div>
			</b-collapse>
		</div>
	</div>
</template>

<script>
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import Search from "@/components/Search";
import Table from "@/components/DataGrid/Table";
import ColumnField from "@/components/DataGrid/ColumnField";
import BookletsService from "@/services/BookletsService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";
import VouchersFilter from "@/components/Vouchers/VouchersFilter";
import voucherHelper from "@/mixins/voucherHelper";
import { getBookletStatus } from "@/utils/helpers";

export default {
	name: "BatchesList",

	components: {
		VouchersFilter,
		Search,
		SafeDelete,
		Table,
		ActionButton,
		ColumnField,
	},

	mixins: [grid, voucherHelper],

	data() {
		return {
			batches: [],
			isOpen: 0,
			advancedSearchVisible: false,
			filters: {},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "project" },
					{ key: "code" },
					{ key: "quantityOfVouchers", label: "Quantity of Vouchers" },
					{ key: "totalValue", sortKey: "value" },
					{ key: "currency" },
					{ key: "status" },
					{ key: "beneficiary" },
					{ key: "assistance", sortable: true, sortKey: "distribution" },
				],
				total: 0,
				currentPage: 1,
				searchPhrase: "",
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
				result = "Detail of Voucher";
			} else {
				result = "Create New Voucher";
			}
			return result;
		},
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;
			this.table.progress = null;

			const loadingComponent = this.$buefy.loading.open({
				container: this.$refs.batches,
			});

			this.table.columns = generateColumns(this.table.visibleColumns);
			await BookletsService.getListOfBooklets(
				null,
				null,
				null,
				this.table.searchPhrase,
				this.filters,
			).then(async ({ data, totalCount }) => {
				this.table.data = [];
				this.table.progress = 0;
				this.table.total = totalCount;
				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			}).catch((e) => {
				if (e.message) Notification(`Booklet ${e}`, "is-danger");
			});

			this.isLoadingList = false;
			loadingComponent.close();
		},

		getBatches() {
			const batches = [];
			let bookletCounter = 0;
			this.table.data.forEach((item) => {
				if (batches.length) {
					const batch = batches.find((value) => value.code === item.code);
					if (batch) {
						const index = batches.indexOf(batch);
						batches[index].booklets.push(item);
					} else {
						batches.push({ code: item.code, booklets: [item] });
					}
				} else {
					batches.push({ code: item.code, booklets: [item] });
				}
				bookletCounter += 1;
			});
			if (this.table.total === bookletCounter) {
				this.isLoadingList = false;
			}
			return batches;
		},

		onPageChange() {},

		onSort() {},

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
	},
};
</script>

<style scoped>
.batches-container {
	min-height: 100px;
	position: relative;
}
</style>
