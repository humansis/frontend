<template>
	<Table
		v-show="show"
		ref="assistanceList"
		has-search
		paginated
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:backend-pagination="false"
		:backend-sorting="false"
		:backend-searching="false"
		:columns="table.visibleColumns"
		@resetSort="resetSort"
	>
		<template v-for="column in table.columns">
			<b-table-column
				v-bind="column"
				sortable
				:key="column.id"
				:custom-sort="column.customSort"
			>
				<template v-slot="props">
					{{ props.row[column.field] }}
				</template>
			</b-table-column>
		</template>

		<template #progress><span /></template>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import BeneficiariesService from "@/services/BeneficiariesService";
import AssistancesService from "@/services/AssistancesService";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";

export default {
	name: "HouseholdAssistanceList",

	components: { Table },

	mixins: [grid, baseHelper],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "commodity", width: "60", searchable: true },
					{ key: "amount", label: "Amount", width: "60", searchable: true, customSort: this.sortAmount },
					{ key: "dateOfDistribution", label: "Date", width: "100", searchable: true, customSort: this.sortDate },
					{ key: "assistance", width: "100", searchable: true },
					{ key: "beneficiary", width: "100", searchable: true },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
			},
		};
	},

	created() {
		this.fetchData();
	},

	methods: {
		sortAmount(a, b, c) {
			if (!c) {
				return a.commodityObject.value - b.commodityObject.value;
			}
			return b.commodityObject.value - a.commodityObject.value;
		},

		sortDate(a, b, c) {
			if (!c) {
				return new Date(a.dateOfDistribution) - new Date(b.dateOfDistribution);
			}
			return new Date(b.dateOfDistribution) - new Date(a.dateOfDistribution);
		},

		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await BeneficiariesService.getListOfDistributedItems(this.$route.params.householdId)
				.then(async ({ data, totalCount }) => {
					this.table.total = totalCount;
					this.table.data = [];
					if (totalCount > 0) {
						await this.prepareDataForTable(data);
					}
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Assistances")} ${e}`, "is-danger");
				});

			this.isLoadingList = false;
		},

		prepareDataForTable(data) {
			const beneficiaryIds = [];
			const assistanceIds = [];
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].dateOfDistribution = this.$moment(item.dateOfDistribution).format("YYYY-MM-DD hh:mm:ss");
				beneficiaryIds.push(item.beneficiaryId);
				assistanceIds.push(item.assistanceId);
			});

			this.reload();

			this.prepareBeneficiaryForTable([...new Set(beneficiaryIds)]);

			this.prepareCommodityForTable([...new Set(assistanceIds)]);

			this.prepareAssistanceForTable([...new Set(assistanceIds)]);
		},

		async prepareBeneficiaryForTable(beneficiaryIds) {
			const beneficiaries = await this.getBeneficiaries(beneficiaryIds);
			this.table.data.forEach((item, key) => {
				const beneficiary = beneficiaries.find(({ id }) => id === item.beneficiaryId);
				this.table.data[key].beneficiary = this
					.prepareName(beneficiary.localGivenName, beneficiary.localFamilyName);
			});
			this.reload();
		},

		async prepareCommodityForTable(assistanceIds) {
			const commodities = await this.getCommodities(assistanceIds);
			this.table.data.forEach((item, key) => {
				const commodity = this.prepareEntityForTable(item.commodityIds[0], commodities);
				this.table.data[key].commodityObject = commodity;
				this.table.data[key].commodity = commodity.modalityType;
				this.table.data[key].amount = `${commodity.value} ${commodity.unit}`;
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
	},
};
</script>
