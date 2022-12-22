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
			@onSearch="onSearch"
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
					<DistributionsFilter
						ref="distributionFilter"
						:defaultFilters="{ ...filters, ...locationsFilter }"
						@filtersChanged="onFiltersChange"
					/>
				</b-collapse>
			</template>
			<template #export>
				<ExportButton
					v-if="table.data.length"
					space-between
					class="ml-3"
					type="is-primary"
					:loading="exportLoading"
					:formats="{ xlsx: true, csv: true, ods: true}"
					@onExport="exportDistributions"
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
import ExportButton from "@/components/ExportButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import TransactionService from "@/services/TransactionService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";
import transactionHelper from "@/mixins/transactionHelper";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";

const DistributionsFilter = () => import("@/components/Transactions/DistributionsFilter");

export default {
	name: "Distributions",

	components: {
		ExportButton,
		Table,
		DistributionsFilter,
		ColumnField,
	},

	mixins: [grid, urlFiltersHelper, transactionHelper],

	data() {
		return {
			selectedTab: 0,
			advancedSearchVisible: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "beneficiaryId", label: "Beneficiary", sortable: true },
					{ key: "localGivenName" },
					{ key: "localFamilyName" },
					{ key: "project" },
					{ key: "assistance", label: "Name" },
					{ key: "fullLocationNames", label: "Location" },
					{ key: "dateDistribution", label: "Assistance Date", type: "datetime", sortable: true },
					{ key: "commodity" },
					{ key: "carrierNumber" },
					{ key: "amount", label: "Distributed" },
					{ key: "spent" },
					{ key: "unit" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
				progress: null,
			},
			exportLoading: false,
			filters: {},
			locationsFilter: {},
		};
	},

	watch: {
		$route: "fetchData",
	},

	created() {
		this.setGridFilters("distributions");
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;
			this.table.progress = null;

			this.renameAdms();
			this.table.columns = generateColumns(this.table.visibleColumns);
			this.setGridFiltersToUrl("distributions");
			await TransactionService.getListOfDistributedItems(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(async ({ data, totalCount }) => {
				this.table.data = [];
				this.table.progress = 20;
				this.table.total = totalCount;
				if (data.length > 0) {
					await this.prepareDataForTable(data);
				} else {
					this.table.progress = 100;
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Distributed Items")} ${e}`, "is-danger");
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
			const commodityIds = [];
			const projectIds = [];

			data.forEach((item, key) => {
				this.table.data[key] = item;
				projectIds.push(item.projectId);
				beneficiaryIds.push(item.beneficiaryId);
				assistanceIds.push(item.assistanceId);
				commodityIds.push(item.commodityId);
				locationIds.push(item.locationId);
				this.table.data[key].spent = item.spent ?? 0;
			});

			this.prepareProjectForTable([...new Set(projectIds)]);
			this.prepareBeneficiaryForTable([...new Set(beneficiaryIds)]);
			this.prepareAssistanceForTable([...new Set(assistanceIds)]);
			this.prepareCommodityForTable([...new Set(commodityIds)]);
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		resetFilters() {
			this.$refs.distributionFilter.resetFilters();
		},

		resetTableSort() {
			this.$refs.table.onResetSort();
		},

		async exportDistributions(format) {
			this.exportLoading = true;
			await TransactionService.exportDistributions(
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
					link.download = `distributions.${format}`;
					link.click();
				} else {
					Notification(message, "is-warning");
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Export Distributions")} ${e}`, "is-danger");
			});
			this.exportLoading = false;
		},
	},
};

</script>
