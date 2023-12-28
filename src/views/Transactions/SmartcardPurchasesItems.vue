<template>
	<v-container fluid>
		<h2 class="text-center mt-4">{{ $t('Transactions') }}</h2>

		<v-tabs
			v-model="selectedTab"
			color="primary"
			align-tabs="start"
			class="mt-5 mb-5"
			@update:modelValue="onRedirectToTab"
		>
			<v-tab :value="0" class="text-none">
				<v-icon icon="hand-holding-water" class="mr-2" />

				{{ $t('Assistances') }}
			</v-tab>

			<v-tab :value="1" class="text-none">
				<v-icon icon="shopping-cart" class="mr-2" />

				{{ $t('Smartcard Purchased Items') }}
			</v-tab>
		</v-tabs>

		<DataGrid
			v-show="show"
			v-model:items-per-page="perPage"
			v-model:sort-by="sortValue"
			:headers="table.columns"
			:items="table.data"
			:total-count="table.total"
			:loading="isLoadingList"
			ref="table"
			reset-sort-button
			reset-filters-button
			is-search-visible
			@perPageChanged="onPerPageChange"
			@pageChanged="onPageChange"
			@update:sortBy="onSort"
			@search="onSearch"
			@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.SMARTCARD_PURCHASED)"
			@resetFilters="onResetFilters"
		>
			<template v-slot:tableControls>
				<ExportControl
					:disabled="!table.data.length || !table.dataUpdated"
					:available-export-formats="exportControl.formats"
					:available-export-types="exportControl.types"
					:is-export-loading="exportControl.loading"
					:location="exportControl.location"
					@export="onExportPurchases"
				/>

				<v-btn
					:append-icon="isAdvancedSearchVisible ? 'arrow-up' : 'arrow-down'"
					size="small"
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
							<SmartcardPurchasesItemsFilter
								ref="purchasesFilter"
								:defaultFilters="{ ...filters, ...locationsFilter }"
								@filtersChanged="onFiltersChange"
								@search="onSearch(table.searchPhrase)"
							/>
						</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>
			</template>
		</DataGrid>
	</v-container>
</template>

<script>
import TransactionService from "@/services/TransactionService";
import DataGrid from "@/components/DataGrid";
import ExportControl from "@/components/Inputs/ExportControl";
import SmartcardPurchasesItemsFilter from "@/components/Transactions/SmartcardPurchasesItemsFilter";
import grid from "@/mixins/grid";
import transactionHelper from "@/mixins/transactionHelper";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, TABLE } from "@/consts";

export default {
	name: "SmartcardPurchasesItems",

	components: {
		ExportControl,
		DataGrid,
		SmartcardPurchasesItemsFilter,
	},

	mixins: [grid, urlFiltersHelper, transactionHelper],

	data() {
		return {
			TABLE,
			selectedTab: 1,
			isAdvancedSearchVisible: false,
			exportControl: {
				loading: false,
				location: "transactionsPurchased",
				types: [EXPORT.PURCHASED_ITEMS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV],
			},
			table: {
				data: [],
				columns: generateColumns([
					{ key: "beneficiaryId", title: "Beneficiary", type: "link", sortable: false },
					{ key: "localGivenName", sortable: false },
					{ key: "localFamilyName", sortable: false },
					{ key: "idNumber", sortable: false },
					{ key: "project", type: "link", sortable: false },
					{ key: "assistance", type: "link", sortable: false },
					{ key: "fullLocationNames", title: "Location", sortable: false },
					{ key: "datePurchase", title: "Purchased Date", type: "datetime" },
					{ key: "smartcardCode", title: "Card No.", sortable: false },
					{ key: "product", title: "Purchased Item", sortable: false },
					{ key: "value", title: "Total" },
					{ key: "currency", sortable: false },
					{ key: "vendor", sortable: false },
					{ key: "vendorNo", title: "Vendor No.", sortable: false },
					{ key: "invoiceNumber", title: "Invoice No.", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.SMARTCARD_PURCHASED.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.SMARTCARD_PURCHASED.key,
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
			this.setGridFiltersToUrl("purchases");
			await TransactionService.getListOfSmartcardPurchasedItems(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "",
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
				Notification(`${this.$t("Smartcard Purchases")} ${e.message || e}`, "error");
			});

			this.isLoadingList = false;
		},

		onRedirectToTab(tab) {
			if (!tab) {
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

		onAdvancedSearchToggle() {
			this.isAdvancedSearchVisible = !this.isAdvancedSearchVisible;
		},

		onResetFilters() {
			this.resetSearch({ tableRef: "table", filtersRef: "purchasesFilter" });
		},

		resetTableSort() {
			this.$refs.table.onResetSort();
		},

		async onExportPurchases(exportType, format) {
			if (exportType === EXPORT.PURCHASED_ITEMS) {
				try {
					this.exportControl.loading = true;

					const filename = `Purchased items ${normalizeExportDate()}`;
					const { data, status, message } = await TransactionService.exportSmartcardPurchasesItems(
						format,
						this.table.currentPage,
						this.perPage,
						this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
						this.table.searchPhrase,
						this.filters,
					);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Smartcard Purchases")} ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};

</script>
