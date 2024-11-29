<template>
	<DataGrid
		v-show="show"
		ref="purchaseList"
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
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.PURCHASE_LIST)"
	/>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import DataGrid from "@/components/DataGrid";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { ASSISTANCE, ROUTER, TABLE } from "@/consts";

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
					{ key: "icon", type: "IconWithTooltip", sortable: false, withoutLabel: true },
					{ key: "beneficiaryId", title: "Beneficiary", sortable: false },
					{ key: "beneficiaryLocalGivenName", title: "Local Given Name", sortable: false },
					{ key: "beneficiaryLocalFamilyName", title: "Local Family Name", sortable: false },
					{ key: "beneficiaryNationalId", title: "Id Number", sortable: false },
					{ key: "projectName", title: "Project", type: "link", sortable: false },
					{ key: "assistanceName", title: "Assistance", type: "link", sortable: false },
					{ key: "fullLocationNames", title: "Location", sortable: false },
					{ key: "datePurchase", title: "Purchased Date", type: "datetime" },
					{ key: "smartcardCode", title: "Card No.", sortable: false },
					{ key: "productName", title: "Purchased Item", sortable: false },
					{ key: "value", title: "Total" },
					{ key: "currency", sortable: false },
					{ key: "vendorName", title: "Vendor", sortable: false },
					{ key: "vendorNo", title: "Vendor No.", sortable: false },
					{ key: "invoiceNumber", title: "Invoice No.", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.PURCHASE_LIST.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.PURCHASE_LIST.key,
			},
		};
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				this.isLoadingList = true;

				const sort = this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "";
				const {
					data: { data, totalCount },
					status,
					message,
				} = await BeneficiariesService.getListOfHouseholdPurchases({
					id: this.$route.params.householdId,
					page: this.table.currentPage,
					size: this.perPage,
					sort,
				});

				checkResponseStatus(status, message);

				this.table.total = totalCount;
				this.table.data = [];

				if (totalCount > 0) {
					await this.prepareDataForTable(data);
				}
			} catch (e) {
				Notification(`${this.$t("Purchases")}: ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].projectName = {
					routeName: ROUTER.ROUTE_NAME.ASSISTANCES.ROOT,
					name: item.projectName,
					routeParams: { projectId: item.projectId },
				};
				this.table.data[key].assistanceName = {
					routeName: ROUTER.ROUTE_NAME.ASSISTANCES.DETAIL,
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
