<template>
	<div>
		<div>
			<h1 class="title has-text-centered">{{ $t('Transactions') }}</h1>
			<b-tabs v-model="selectedTab" @input="redirectToTab">
				<b-tab-item
					icon="hand-holding-water"
					:label="$t('Assistances')"
				/>
				<b-tab-item
					icon="shopping-cart"
					:label="$t('Smartcard Purchased Items')"
				/>
			</b-tabs>
		</div>
		<Table
			v-show="show"
			ref="table"
			has-reset-sort
			has-search
			default-sort-key="datePurchase"
			default-sort-direction="desc"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			:search-phrase="table.searchPhrase"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@resetSort="resetSort"
			@onSearch="onSearch"
		>
			<template v-for="column in table.columns">
				<b-table-column
					v-bind="column"
					v-slot="props"
					:sortable="column.sortable"
					:key="column.id"
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
					animation="slide"
					:open="advancedSearchVisible"
				>
					<SmartcardPurchasesItemsFilter
						ref="purchasesFilter"
						:defaultFilters="{ ...filters, ...locationsFilter }"
						@filtersChanged="onFiltersChange"
						@onSearch="onSearch(table.searchPhrase)"
					/>
				</b-collapse>
			</template>
			<template #export>
				<ExportControl
					:disabled="!table.data.length || !table.dataUpdated"
					:available-export-formats="exportControl.formats"
					:available-export-types="exportControl.types"
					:is-export-loading="exportControl.loading"
					:location="exportControl.location"
					@onExport="exportPurchases"
				/>
			</template>
			<template slot="progress">
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
		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import TransactionService from "@/services/TransactionService";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";
import ExportControl from "@/components/Export";
import { EXPORT } from "@/consts";
import transactionHelper from "@/mixins/transactionHelper";
import ColumnField from "@/components/DataGrid/ColumnField";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";

const SmartcardPurchasesItemsFilter = () => import("@/components/Transactions/SmartcardPurchasesItemsFilter");

export default {
	name: "SmartcardPurchasesItems",

	components: {
		ExportControl,
		Table,
		SmartcardPurchasesItemsFilter,
		ColumnField,
	},

	mixins: [grid, urlFiltersHelper, transactionHelper],

	data() {
		return {
			selectedTab: 1,
			advancedSearchVisible: false,
			exportControl: {
				loading: false,
				location: "transactionsPurchased",
				types: [EXPORT.PURCHASED_ITEMS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV],
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "beneficiaryId", label: "Beneficiary", type: "link" },
					{ key: "localGivenName" },
					{ key: "localFamilyName" },
					{ key: "idNumber" },
					{ key: "project", type: "link" },
					{ key: "assistance", type: "link" },
					{ key: "fullLocationNames", label: "Location" },
					{ key: "datePurchase", label: "Purchased Date", type: "datetime", sortable: true },
					{ key: "smartcardCode", label: "Card No." },
					{ key: "product", label: "Purchased Item" },
					{ key: "value", label: "Total", sortable: true },
					{ key: "currency" },
					{ key: "vendor" },
					{ key: "vendorNo" },
					{ key: "invoiceNumber", label: "Invoice No" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "desc",
				sortColumn: "datePurchase",
				progress: null,
				searchPhrase: "",
				dataUpdated: false,
			},
			filters: {},
			locationsFilter: {},
		};
	},

	created() {
		this.setGridFilters("purchases");
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;
			this.table.progress = null;

			this.renameAdms();
			this.table.columns = generateColumns(this.table.visibleColumns);
			this.setGridFiltersToUrl("purchases");
			await TransactionService.getListOfSmartcardPurchasedItems(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(({ data, totalCount }) => {
				this.table.data = [];
				this.table.progress = 10;
				this.table.total = totalCount;
				this.table.dataUpdated = true;
				if (data.length > 0) {
					this.prepareDataForTable(data);
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Smartcard Purchases")} ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		redirectToTab(tab) {
			if (tab) {
				this.$router.push({ name: "TransactionsPurchases" });
			} else {
				this.$router.push({ name: "TransactionsAssistances" });
			}
		},

		prepareDataForTable(data) {
			const locationIds = [];
			const assistanceIds = [];
			const beneficiaryIds = [];
			const projectIds = [];
			const vendorIds = [];
			const productIds = [];

			data.forEach((item, key) => {
				this.table.data[key] = item;
				projectIds.push(item.projectId);
				beneficiaryIds.push(item.beneficiaryId);
				assistanceIds.push(item.assistanceId);
				vendorIds.push(item.vendorId);
				productIds.push(item.productId);
				locationIds.push(item.locationId);
			});

			this.prepareProjectForTable([...new Set(projectIds)], true);
			this.prepareBeneficiaryForTable([...new Set(beneficiaryIds)], true);
			this.prepareAssistanceForTable([...new Set(assistanceIds)], true);
			this.prepareVendorForTable([...new Set(vendorIds)]);
			this.prepareProductForTable([...new Set(productIds)]);
			this.table.progress = 100;
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		resetFilters() {
			this.resetSearch({ tableRef: "table", filtersRef: "purchasesFilter" });
		},

		resetTableSort() {
			this.$refs.table.onResetSort();
		},

		async exportPurchases(type, format) {
			if (type === EXPORT.PURCHASED_ITEMS) {
				this.exportControl.loading = true;
				await TransactionService.exportSmartcardPurchasesItems(
					format,
					this.table.currentPage,
					this.perPage,
					this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
					this.table.searchPhrase,
					this.filters,
				).then(({ data, status, message }) => {
					if (status === 200) {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `Purchased items ${normalizeExportDate()}.${format}`;
						link.click();
					} else {
						Notification(message, "is-warning");
					}
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Export Smartcard Purchases")} ${e}`, "is-danger");
				});
				this.exportControl.loading = false;
			}
		},
	},
};

</script>
