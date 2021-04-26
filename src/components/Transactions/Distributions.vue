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
					<DistributionFilter
						@filtersChanged="onFiltersChange"
					/>
				</b-collapse>
			</template>
			<template #export>
				<ExportButton
					class="ml-2"
					space-between
					:formats="{ xlsx: true, csv: true}"
					@onExport="exportDistributions"
				/>
			</template>
		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ExportButton from "@/components/ExportButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import ProjectService from "@/services/ProjectService";
import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import TransactionService from "@/services/TransactionService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import grid from "@/mixins/grid";
import baseHelper from "@/mixins/baseHelper";
import LocationsService from "@/services/LocationsService";

const DistributionFilter = () => import("@/components/Transactions/DistributionFilter");

export default {
	name: "Distributions",

	components: {
		ExportButton,
		Table,
		DistributionFilter,
		ColumnField,
	},

	mixins: [grid, baseHelper],

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
					{ key: "assistance", label: "Name" },
					{ key: "adm1" },
					{ key: "adm2" },
					{ key: "adm3" },
					{ key: "adm4" },
					{ key: "dateDistribution", label: "Distribution Date", type: "datetime" },
					{ key: "commodity" },
					{ key: "amount" },
					{ key: "unit" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
			},
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

			this.table.columns = generateColumns(this.table.visibleColumns);
			await TransactionService.getListOfDistributedItems(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(async ({ data, totalCount }) => {
				this.table.data = [];
				this.table.progress = 0;
				this.table.total = totalCount;
				if (data.length > 0) {
					await this.prepareDataForTable(data);
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

		async prepareProjectForTable(projectIds) {
			const projects = await this.getProjects(projectIds);
			this.table.data.forEach((item, key) => {
				this.table.data[key].project = this.prepareEntityForTable(item.projectId, projects, "name", "None");
			});
			this.reload();
		},

		async prepareAdm1ForTable(adm1Ids) {
			const adm1s = await this.getAdm1s(adm1Ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].adm1 = this.prepareEntityForTable(item.adm1Id, adm1s, "name", "None");
			});
			this.reload();
		},

		async prepareAdm2ForTable(adm2Ids) {
			const adm2s = await this.getAdm2s(adm2Ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].adm2 = this.prepareEntityForTable(item.adm2Id, adm2s, "name", "None");
			});
			this.reload();
		},

		async prepareAdm3ForTable(adm3Ids) {
			const adm3s = await this.getAdm3s(adm3Ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].adm3 = this.prepareEntityForTable(item.adm3Id, adm3s, "name", "None");
			});
			this.reload();
		},

		async prepareAdm4ForTable(adm4Ids) {
			const adm4s = await this.getAdm4s(adm4Ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].adm4 = this.prepareEntityForTable(item.adm4Id, adm4s, "name", "None");
			});
			this.reload();
		},

		async prepareCommodityForTable(assistanceIds) {
			const commodities = await this.getCommodities(assistanceIds);
			this.table.data.forEach((item, key) => {
				const commodity = this.prepareEntityForTable(item.commodityId, commodities);
				this.table.data[key].commodity = commodity.modalityType;
				this.table.data[key].unit = commodity.unit;
			});
			this.reload();
		},

		async prepareBeneficiaryForTable(beneficiaryIds) {
			const beneficiaries = await this.getBeneficiaries(beneficiaryIds);
			this.table.data.forEach((item, key) => {
				const beneficiary = this.prepareEntityForTable(item.beneficiaryId, beneficiaries);
				if (beneficiary) {
					this.table.data[key].localGivenName = beneficiary.localGivenName;
					this.table.data[key].localFamilyName = beneficiary.localFamilyName;
				}
			});
			this.reload();
		},

		async prepareAssistanceForTable(assistanceIds) {
			const assistances = await this.getAssistances(assistanceIds);
			this.table.data.forEach((item, key) => {
				const assistance = this.prepareEntityForTable(item.assistanceId, assistances);
				this.table.data[key].assistance = assistance.name;
			});
			this.reload();
		},

		async getCommodities(ids) {
			if (!ids.length) return [];
			return AssistancesService.getCommodities(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Commodities")} ${e}`, "is-danger");
				});
		},

		async getAdm1s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm1s(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Adm1")} ${e}`, "is-danger");
				});
		},

		async getAdm2s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm2s(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Adm2")} ${e}`, "is-danger");
				});
		},

		async getAdm3s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm3s(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Adm3")} ${e}`, "is-danger");
				});
		},

		async getAdm4s(ids) {
			if (!ids.length) return [];
			return LocationsService.getAdm4s(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Adm4")} ${e}`, "is-danger");
				});
		},

		async getAssistances(ids) {
			if (!ids.length) return [];
			return AssistancesService.getAssistances(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Assistances")} ${e}`, "is-danger");
				});
		},

		async getBeneficiaries(ids) {
			return BeneficiariesService.getBeneficiaries(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Beneficiaries")} ${e}`, "is-danger");
				});
		},

		async getProjects(ids) {
			return ProjectService.getListOfProjects(null, null, null, null, ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
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
				} else if (selectedFilters[key]) {
					const date = new Date(selectedFilters[key]);
					this.filters[key] = [date.toISOString()];
				}
			});
			await this.fetchData();
		},
	},
};

</script>
