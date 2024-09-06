<template>
	<v-container fluid>
		<h2 class="text-center mt-4" data-cy="page-title-text">{{ $t('Transactions') }}</h2>

		<v-tabs
			v-model="selectedTab"
			color="primary"
			align-tabs="start"
			class="my-5"
			@update:modelValue="onRedirectToTab"
		>
			<v-tab value="assistances" class="text-none">
				<v-icon icon="hand-holding-water" class="mr-2" />

				{{ $t('Assistances') }}
			</v-tab>

			<v-tab value="smartCardPurchasedItems" class="text-none">
				<v-icon icon="shopping-cart" class="mr-2" />

				{{ $t('Smartcard Purchased Items') }}
			</v-tab>
		</v-tabs>

		<DataGrid
			v-show="show"
			ref="distributionsList"
			v-model:items-per-page="perPage"
			v-model:sort-by="sortValue"
			:headers="table.columns"
			:items="table.data"
			:total-count="table.total"
			:loading="isLoadingList"
			:search-phrase="table.searchPhrase"
			:current-page="table.currentPage"
			reset-sort-button
			reset-filters-button
			is-search-visible
			is-row-click-disabled
			@perPageChanged="onPerPageChange"
			@pageChanged="onPageChange"
			@update:sortBy="onSort"
			@search="onSearch"
			@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.DISTRIBUTIONS)"
			@resetFilters="onResetFilters"
		>
			<template v-slot:tableControls>
				<ExportControl
					:required-permissions="PERMISSIONS.TRANSACTIONS_ASSISTANCE_EXPORT"
					:disabled="!table.data.length || !table.dataUpdated"
					:available-export-formats="exportControl.formats"
					:available-export-types="exportControl.types"
					:is-export-loading="exportControl.loading"
					:location="exportControl.location"
					@export="onExportDistributions"
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
				<v-expansion-panels v-model="visiblePanels">
					<v-expansion-panel value="advancedSearch" eager>
						<v-expansion-panel-text>
							<DistributionsFilter
								ref="distributionFilter"
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
import DistributionsFilter from "@/components/Transactions/DistributionsFilter";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import transactionHelper from "@/mixins/transactionHelper";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { ASSISTANCE, EXPORT, ROUTER, TABLE } from "@/consts";

const statusTags = [
	{ code: ASSISTANCE.RELIEF_PACKAGES.STATE.DISTRIBUTED, class: "status distributed" },
	{ code: ASSISTANCE.RELIEF_PACKAGES.STATE.INVALIDATED, class: "status invalidated" },
];

export default {
	name: "Distributions",

	components: {
		ExportControl,
		DataGrid,
		DistributionsFilter,
	},

	mixins: [
		grid,
		urlFiltersHelper,
		transactionHelper,
		permissions,
	],

	data() {
		return {
			TABLE,
			selectedTab: "assistances",
			visiblePanels: [],
			isLoadingList: false,
			exportControl: {
				loading: false,
				location: "transactionsAssistances",
				types: [EXPORT.TRANSACTIONS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			table: {
				data: [],
				columns: generateColumns([
					{ key: "beneficiaryId", title: "Beneficiary", type: "link", sortable: false },
					{ key: "localGivenName", sortable: false },
					{ key: "localFamilyName", sortable: false },
					{ key: "project", type: "link", sortable: false },
					{ key: "assistance", type: "link", sortable: false },
					{ key: "fullLocationNames", title: "Location", sortable: false },
					{ key: "dateDistribution", title: "Assistance Date", type: "datetime" },
					{ key: "commodity", sortable: false },
					{ key: "carrierNumber", title: "Card No.", sortable: false },
					{ key: "state", title: "Status", type: "tag", customTags: statusTags, sortable: false },
					{ key: "amount", title: "Distributed", sortable: false },
					{ key: "spent", sortable: false },
					{ key: "unit", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.DISTRIBUTIONS.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.DISTRIBUTIONS.key,
				searchPhrase: "",
				progress: null,
				dataUpdated: false,
			},
			filters: {},
			locationsFilter: {},
		};
	},

	computed: {
		isAdvancedSearchVisible() {
			return this.visiblePanels.includes("advancedSearch");
		},
	},

	async created() {
		this.setGridFilters("distributions");
		this.setDefaultFilters();
		await this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				this.isLoadingList = true;
				this.table.progress = null;

				this.renameAdms();
				this.setGridFiltersToUrl("distributions");

				const sort = this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "";
				const {
					data: { data, totalCount },
					status,
					message,
				} = await TransactionService.getListOfDistributedItems({
					page: this.table.currentPage,
					size: this.perPage,
					search: this.table.searchPhrase,
					filters: this.filters,
					sort,
				});

				this.table.data = [];

				checkResponseStatus(status, message);

				this.table.progress = 20;
				this.table.total = totalCount;
				this.table.dataUpdated = true;

				if (data.length > 0) {
					this.prepareDataForTable(data);
				}
			} catch (e) {
				Notification(`${this.$t("Distributed Items")}: ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},

		onRedirectToTab(tab) {
			if (tab === "smartCardPurchasedItems") {
				this.$router.push({ name: ROUTER.ROUTE_NAME.TRANSACTIONS.PURCHASES });
			}
		},

		prepareDataForTable(data) {
			const locationIds = [];
			const assistanceIds = [];
			const beneficiaryIds = [];
			const beneficiaryInstitutionIds = [];
			const commodityIds = [];
			const projectIds = [];

			data.forEach((item, key) => {
				if (item.type === "Institution") {
					beneficiaryInstitutionIds.push(item.beneficiaryId);
				} else {
					beneficiaryIds.push(item.beneficiaryId);
				}

				this.table.data[key] = item;
				projectIds.push(item.projectId);
				assistanceIds.push(item.assistanceId);
				commodityIds.push(item.commodityId);
				locationIds.push(item.locationId);
				this.table.data[key].spent = item.spent ?? 0;
			});

			this.prepareProjectForTable([...new Set(projectIds)], true);
			this.prepareBeneficiaryForTable([...new Set(beneficiaryIds)], true);
			this.prepareBeneficiaryForTable([...new Set(beneficiaryInstitutionIds)], true, true);
			this.prepareAssistanceForTable([...new Set(assistanceIds)], true);
			this.prepareCommodityForTable([...new Set(commodityIds)]);
			this.table.progress = 100;
		},

		onAdvancedSearchToggle() {
			this.visiblePanels = this.isAdvancedSearchVisible ? [] : ["advancedSearch"];
		},

		async onResetFilters() {
			this.resetSearch(
				{ tableRef: "distributionsList", filtersRef: "distributionFilter" },
				false,
			);
			await this.setDefaultFilters();
			this.$refs.distributionFilter.setDefaultFilters();
			await this.fetchData();
		},

		async onExportDistributions(exportType, format) {
			if (exportType === EXPORT.TRANSACTIONS) {
				try {
					this.exportControl.loading = true;

					const filename = `Transactions ${normalizeExportDate()}`;
					const sort = this.table.sortColumn !== ""
						? `${this.table.sortColumn}.${this.table.sortDirection}`
						: "";
					const {
						data,
						status,
						message,
					} = await TransactionService.exportDistributions({
						format,
						page: this.table.currentPage,
						size: this.perPage,
						search: this.table.searchPhrase,
						filters: this.filters,
						sort,
					});

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Distributions")}: ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};

</script>
