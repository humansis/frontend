<template>
	<DataGrid
		v-show="show"
		ref="assistanceList"
		v-model:page="table.currentPage"
		v-model:sort-by="sortValue"
		:items-per-page="perPage"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		reset-sort-button
		is-row-click-disabled
		@update:sortBy="onSort"
		@pageChanged="onPageChange"
		@perPageChanged="onPerPageChange"
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCE_LIST)"
	/>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import DataGrid from "@/components/DataGrid";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import { ASSISTANCE, TABLE } from "@/consts";

const statusTags = [
	{ code: "To distribute", class: "status to-distribute" },
	{ code: "Distributed", class: "status distributed" },
	{ code: "Expired", class: "status expired" },
	{ code: "Invalidated", class: "status invalidated" },
	{ code: "Canceled", class: "status canceled" },
];

export default {
	name: "HouseholdAssistancesList",

	components: {
		DataGrid,
	},

	mixins: [grid, baseHelper],

	data() {
		return {
			TABLE,
			isLoadingList: false,
			table: {
				data: [],
				columns: generateColumns([
					{ key: "icon", type: "IconWithTooltip", sortable: false, withoutLabel: true },
					{ key: "beneficiaryId", title: "Beneficiary Id", sortable: false },
					{ key: "beneficiaryLocalGivenName", title: "Local Given Name", sortable: false },
					{ key: "beneficiaryLocalFamilyName", title: "Local Family Name", sortable: false },
					{ key: "state", title: "Status", type: "tag", customTags: statusTags, sortable: false },
					{ key: "projectName", title: "Project", type: "link", sortable: false },
					{ key: "assistanceName", title: "Assistance", type: "link", sortable: false },
					{ key: "fullLocationNames", title: "Location", sortable: false },
					{ key: "dateDistribution", title: "Assistance Date", type: "date" },
					{ key: "commodity", sortable: false },
					{ key: "carrierNumber", title: "Card No.", sortable: false },
					{ key: "amount", title: "Distributed", sortable: false },
					{ key: "spent", sortable: false },
					{ key: "unit", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCE_LIST.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCE_LIST.key,
			},
		};
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			await BeneficiariesService.getListOfDistributedItems(
				this.$route.params.householdId,
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "",
			)
				.then(async ({ data, totalCount }) => {
					this.table.total = totalCount;
					this.table.data = [];
					if (totalCount > 0) {
						await this.prepareDataForTable(data);
					}
				}).catch((e) => {
					Notification(`${this.$t("Assistances")} ${e.message || e}`, "error");
				});

			this.isLoadingList = false;
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].projectName = {
					routeName: "Project",
					name: item.projectName,
					routeParams: { projectId: item.projectId },
				};
				this.table.data[key].assistanceName = {
					routeName: "AssistanceDetail",
					name: item.assistanceName,
					routeParams: { projectId: item.projectId, assistanceId: item.assistanceId },
				};
				this.table.data[key].icon = {
					type: item.type === ASSISTANCE.TARGET.INDIVIDUAL ? "user" : "home",
					size: "is-medium",
					tooltip: normalizeText(item.type),
				};
			});
		},
	},
};
</script>
