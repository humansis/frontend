<template>
	<div>
		<Table
			v-show="show"
			has-reset-sort
			has-search
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@resetSort="resetSort"
			@search="onSearch"
		>
			<template v-for="column in table.columns">
				<b-table-column
					v-bind="column"
					:sortable="column.sortable"
					:key="column.id"
					v-slot="props"
				>
					<ColumnField :data="props" :column="column" />
				</b-table-column>
			</template>
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
				<b-collapse
					:open="advancedSearchVisible"
					animation="slide"
				>
					<PurchaseFilter
						@filtersChanged="onFiltersChange"
					/>
				</b-collapse>
			</template>
			<template #export>
				<ExportButton
					class="ml-2"
					space-between
					:formats="{ xlsx: true, csv: true}"
					:loading="exportLoading"
					@onExport="exportPurchases"
				/>
			</template>
			<template slot="progress">
				<b-progress :value="table.progress" format="percent" />
			</template>
		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import TransactionService from "@/services/TransactionService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";
import ExportButton from "@/components/ExportButton";
import transactionHelper from "@/mixins/transactionHelper";
import ColumnField from "@/components/DataGrid/ColumnField";

const PurchaseFilter = () => import("@/components/Transactions/PurchaseFilter");

export default {
	name: "Purchases",

	components: {
		ExportButton,
		Table,
		PurchaseFilter,
		ColumnField,
	},

	mixins: [grid, transactionHelper],

	data() {
		return {
			advancedSearchVisible: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "beneficiary" },
					{ key: "localGivenName" },
					{ key: "localFamilyName" },
					{ key: "project" },
					{ key: "assistance", label: "Distribution" },
					{ key: "adm1" },
					{ key: "adm2" },
					{ key: "adm3" },
					{ key: "adm4" },
					{ key: "datePurchase", label: "Purchased Date", type: "datetime" },
					{ key: "commodity", label: "CommodityType" },
					{ key: "carrierNumber" },
					{ key: "product", label: "Purchased Item" },
					{ key: "value", label: "Total" },
					{ key: "currency" },
					{ key: "vendor" },
					{ key: "vendorNo" },
					{ key: "invoiceNumber", label: "Invoice No" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				progress: null,
				searchPhrase: "",
			},
			exportLoading: false,
			filters: {},
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

			this.table.progress = null;

			this.renameAdms();
			this.table.columns = generateColumns(this.table.visibleColumns);
			await TransactionService.getListOfPurchasedItems(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(({ data, totalCount }) => {
				this.table.data = [];
				this.table.progress = 10;
				this.table.total = totalCount;
				if (data.length > 0) {
					this.prepareDataForTable(data);
				} else {
					this.table.progress = 100;
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Transactions")} ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		prepareDataForTable(data) {
			const adm1Ids = [];
			const adm2Ids = [];
			const adm3Ids = [];
			const adm4Ids = [];
			const locationIds = [];
			const assistanceIds = [];
			const beneficiaryIds = [];
			const commodityIds = [];
			const projectIds = [];
			const vendorIds = [];
			const productIds = [];

			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].beneficiary = item.beneficiaryId;
				projectIds.push(item.projectId);
				beneficiaryIds.push(item.beneficiaryId);
				assistanceIds.push(item.assistanceId);
				commodityIds.push(item.commodityId);
				vendorIds.push(item.vendorId);
				productIds.push(item.productId);
				adm1Ids.push(item.adm1Id);
				adm2Ids.push(item.adm2Id);
				adm3Ids.push(item.adm3Id);
				adm4Ids.push(item.adm4Id);
				locationIds.push(item.locationId);
			});

			this.prepareProjectForTable([...new Set(projectIds)]);
			this.prepareBeneficiaryForTable([...new Set(beneficiaryIds)]);
			this.prepareAssistanceForTable([...new Set(assistanceIds)]);
			this.prepareCommodityForTable([...new Set(commodityIds)]);
			this.prepareVendorForTable([...new Set(vendorIds)]);
			this.prepareProductForTable([...new Set(productIds)]);
			this.prepareAdm1ForTable([...new Set(adm1Ids)]);
			this.prepareAdm2ForTable([...new Set(adm2Ids)]);
			this.prepareAdm3ForTable([...new Set(adm3Ids)]);
			this.prepareAdm4ForTable([...new Set(adm4Ids)]);
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		async exportPurchases(format) {
			this.exportLoading = true;
			await TransactionService.exportPurchases(format)
				.then(({ data }) => {
					const blob = new Blob([data], { type: data.type });
					const link = document.createElement("a");
					link.href = window.URL.createObjectURL(blob);
					link.download = `purchases.${format}`;
					link.click();
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Export Purchases")} ${e}`, "is-danger");
				});
			this.exportLoading = false;
		},

		async onFiltersChange(selectedFilters) {
			Object.keys(selectedFilters).forEach((key) => {
				if (Array.isArray(selectedFilters[key])) {
					this.filters[key] = [];
					selectedFilters[key].forEach((value) => {
						this.filters[key].push(value);
					});
				} else {
					this.filters[key] = selectedFilters[key];
				}
			});
			await this.fetchData();
		},
	},
};

</script>
