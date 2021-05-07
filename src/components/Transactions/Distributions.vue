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
					<DistributionsFilter
						ref="distributionFilter"
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
						@click="resetSort"
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

const DistributionsFilter = () => import("@/components/Transactions/DistributionsFilter");

export default {
	name: "Distributions",

	components: {
		ExportButton,
		Table,
		DistributionsFilter,
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
					{ key: "beneficiary", sortable: true },
					{ key: "localGivenName", sortable: true },
					{ key: "localFamilyName", sortable: true },
					{ key: "project", sortable: true },
					{ key: "assistance", label: "Name", sortable: true },
					{ key: "adm1", sortable: true },
					{ key: "adm2", sortable: true },
					{ key: "adm3", sortable: true },
					{ key: "adm4", sortable: true },
					{ key: "dateDistribution", label: "Distribution Date", type: "datetime", sortable: true },
					{ key: "commodity", sortable: true },
					{ key: "carrierNumber", sortable: true },
					{ key: "amount", sortable: true },
					{ key: "unit", sortable: true },
				],
				total: 0,
				currentPage: 1,
				searchPhrase: "",
				progress: null,
			},
			exportLoading: false,
			filters: {},
		};
	},

	watch: {
		$route: "fetchData",
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			this.table.progress = null;

			this.renameAdms();
			this.table.columns = generateColumns(this.table.visibleColumns);
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

			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].beneficiary = item.beneficiaryId;
				projectIds.push(item.projectId);
				beneficiaryIds.push(item.beneficiaryId);
				assistanceIds.push(item.assistanceId);
				commodityIds.push(item.commodityId);
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
			this.prepareAdm1ForTable([...new Set(adm1Ids)]);
			this.prepareAdm2ForTable([...new Set(adm2Ids)]);
			this.prepareAdm3ForTable([...new Set(adm3Ids)]);
			this.prepareAdm4ForTable([...new Set(adm4Ids)]);
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		resetFilters() {
			this.$refs.distributionFilter.eraseFilters();
		},

		async exportDistributions(format) {
			this.exportLoading = true;
			await TransactionService.exportDistributions(format)
				.then(({ data }) => {
					const blob = new Blob([data], { type: data.type });
					const link = document.createElement("a");
					link.href = window.URL.createObjectURL(blob);
					link.download = `distributions.${format}`;
					link.click();
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Export Distributions")} ${e}`, "is-danger");
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
