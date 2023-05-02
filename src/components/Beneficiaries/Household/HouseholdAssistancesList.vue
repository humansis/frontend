<template>
	<Table
		v-show="show"
		ref="assistanceList"
		paginated
		has-reset-sort
		:data="table.data"
		:total="table.total"
		default-sort-key="dateDistribution"
		default-sort-direction="desc"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:columns="table.visibleColumns"
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
	</Table>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import consts from "@/utils/assistanceConst";
import Table from "@/components/DataGrid/Table";
import ColumnField from "@/components/DataGrid/ColumnField";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";

export default {
	name: "HouseholdAssistancesList",

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
					{ key: "beneficiaryId", label: "Beneficiary Id" },
					{ key: "beneficiaryLocalGivenName", label: "First Name" },
					{ key: "beneficiaryLocalFamilyName", label: "Family Name" },
					{ key: "projectName", label: "Project", type: "link" },
					{ key: "assistanceName", label: "Assistance", type: "link" },
					{ key: "fullLocationNames", label: "Location" },
					{ key: "dateDistribution", label: "Assistance Date", type: "date", sortable: true },
					{ key: "commodity" },
					{ key: "carrierNumber" },
					{ key: "amount", label: "Distributed" },
					{ key: "spent" },
					{ key: "unit" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "desc",
				sortColumn: "dateDistribution",
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

			await BeneficiariesService.getListOfDistributedItems(
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
					if (e.message) Notification(`${this.$t("Assistances")} ${e}`, "is-danger");
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
					name: item.assistanceId,
					routeParams: { projectId: item.projectId, assistanceId: item.assistanceId },
				};
				this.table.data[key].icon = {
					type: item.type === consts.BENEFICIARY_TYPES.BENEFICIARY ? "home" : "user",
					size: "is-medium",
					tooltip: item.type === consts.BENEFICIARY_TYPES.BENEFICIARY ? "Individual" : "Household",
				};
			});
		},
	},
};
</script>
