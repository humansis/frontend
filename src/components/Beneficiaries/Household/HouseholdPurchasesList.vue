<template>
	<DataGrid
		v-show="show"
		ref="purchaseList"
		v-model:page="table.currentPage"
		:items-per-page="perPage"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		reset-sort-button
		@update:sortBy="onSort"
		@pageChanged="onPageChange"
		@perPageChanged="onPerPageChange"
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.PURCHASE_LIST)"
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

export default {
	name: "HouseholdPurchasesList",

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
					{ key: "icon", type: "IconWithTooltip", withoutLabel: true },
					{ key: "beneficiaryId", label: "Beneficiary" },
					{ key: "beneficiaryLocalGivenName", label: "Local Given Name" },
					{ key: "beneficiaryLocalFamilyName", label: "Local Family Name" },
					{ key: "beneficiaryNationalId", label: "Id Number" },
					{ key: "projectName", label: "Project", type: "link" },
					{ key: "assistanceName", label: "Assistance", type: "link" },
					{ key: "fullLocationNames", label: "Location" },
					{ key: "datePurchase", label: "Purchased Date", type: "datetime", sortable: true },
					{ key: "smartcardCode", label: "Card No." },
					{ key: "productName", label: "Purchased Item" },
					{ key: "value", label: "Total", sortable: true },
					{ key: "currency" },
					{ key: "vendorName", label: "Vendor" },
					{ key: "vendorNo", label: "Vendor No." },
					{ key: "invoiceNumber", label: "Invoice No." },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: "desc",
				sortColumn: "datePurchase",
			},
		};
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			await BeneficiariesService.getListOfHouseholdPurchases(
				this.$route.params.householdId,
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
			)
				.then(async ({ data, totalCount }) => {
					this.table.total = totalCount;
					this.table.data = [];
					if (totalCount > 0) {
						await this.prepareDataForTable(data);
					}
				}).catch((e) => {
					Notification(`${this.$t("Purchases")} ${e.message || e}`, "error");
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
