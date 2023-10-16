<template>
	<Table
		v-show="show"
		ref="purchaseList"
		paginated
		has-reset-sort
		:data="table.data"
		:total="table.total"
		default-sort-key="datePurchase"
		default-sort-direction="desc"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:search-phrase="table.searchPhrase"
		:columns="table.visibleColumns"
		:has-clickable-rows="false"
		@pageChanged="onPageChange"
		@changePerPage="onChangePerPage"
		@sorted="onSort"
		@resetSort="resetSort"
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

		<template #progress><span /></template>
	</Table>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import ColumnField from "@/components/DataGrid/ColumnField";
import Table from "@/components/DataGrid/Table";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";

export default {
	name: "HouseholdPurchasesList",

	components: {
		Table,
		ColumnField,
	},

	mixins: [grid, baseHelper],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
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
				],
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
			this.table.columns = generateColumns(this.table.visibleColumns);

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
					if (e.message) Notification(`${this.$t("Purchases")} ${e}`, "is-danger");
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
