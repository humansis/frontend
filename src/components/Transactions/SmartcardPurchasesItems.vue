<template>
	<div>
		<Table
			v-show="show"
			ref="table"
			has-reset-sort
			has-search
			:default-sort-direction="table.sortDirection"
			:default-sort-key="table.sortColumn"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			:search-phrase="table.searchPhrase"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@resetSort="resetSort"
			@search="onSearch"
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
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";
import ExportButton from "@/components/ExportButton";
import transactionHelper from "@/mixins/transactionHelper";
import ColumnField from "@/components/DataGrid/ColumnField";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";

const SmartcardPurchasesItemsFilter = () => import("@/components/Transactions/SmartcardPurchasesItemsFilter");

export default {
	name: "SmartcardPurchasesItems",

	components: {
		ExportButton,
		Table,
		SmartcardPurchasesItemsFilter,
		ColumnField,
	},

	mixins: [grid, urlFiltersHelper, transactionHelper],

	data() {
		return {
			advancedSearchVisible: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "beneficiaryId", label: "Beneficiary" },
					{ key: "localGivenName" },
					{ key: "localFamilyName" },
					{ key: "project" },
					{ key: "assistance" },
					{ key: "adm1" },
					{ key: "adm2" },
					{ key: "adm3" },
					{ key: "adm4" },
					{ key: "datePurchase", label: "Purchased Date", type: "datetime", sortable: true },
					{ key: "smartcardCode", label: "Card No." },
					{ key: "product", label: "Purchased Item" },
					{ key: "value", label: "Total", sortable: true },
					{ key: "currency" },
					{ key: "vendor" },
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
			locationsFilter: {},
		};
	},

	created() {
		this.setGridFilters();
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;
			this.table.progress = null;

			this.renameAdms();
			this.table.columns = generateColumns(this.table.visibleColumns);
			await TransactionService.getListOfSmartcardPurchasedItems(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(({ data, totalCount }) => {
				this.setGridFiltersToUrl();

				this.table.data = [];
				this.table.progress = 10;
				this.table.total = totalCount;
				if (data.length > 0) {
					this.prepareDataForTable(data);
				} else {
					this.table.progress = 100;
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Smartcard Purchases")} ${e}`, "is-danger");
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
				adm1Ids.push(item.adm1Id);
				adm2Ids.push(item.adm2Id);
				adm3Ids.push(item.adm3Id);
				adm4Ids.push(item.adm4Id);
				locationIds.push(item.locationId);
			});

			this.prepareProjectForTable([...new Set(projectIds)]);
			this.prepareBeneficiaryForTable([...new Set(beneficiaryIds)]);
			this.prepareAssistanceForTable([...new Set(assistanceIds)]);
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

		resetFilters() {
			this.$refs.purchasesFilter.eraseFilters();
		},

		resetTableSort() {
			this.$refs.table.onResetSort();
		},

		async exportPurchases(format) {
			this.exportLoading = true;
			await TransactionService.exportSmartcardPurchasesItems(
				format,
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(({ data }) => {
				const blob = new Blob([data], { type: data.type });
				const link = document.createElement("a");
				link.href = window.URL.createObjectURL(blob);
				link.download = `purchases.${format}`;
				link.click();
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Export Smartcard Purchases")} ${e}`, "is-danger");
			});
			this.exportLoading = false;
		},

		async onFiltersChange({ filters, locationsFilter }) {
			this.locationsFilter = locationsFilter;

			Object.keys(filters).forEach((key) => {
				if (Array.isArray(filters[key])) {
					this.filters[key] = [];
					filters[key].forEach((value) => {
						this.filters[key].push(value);
					});
				} else {
					this.filters[key] = filters[key];
				}
			});
			await this.fetchData();
		},
	},
};

</script>
