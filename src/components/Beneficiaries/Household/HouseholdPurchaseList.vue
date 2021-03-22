<template>
	<Table
		ref="purchaseList"
		has-search
		paginated
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@search="onSearch"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort"
	>
		<template v-for="column in table.columns">
			<b-table-column v-bind="column" sortable :key="column.id">
				<template v-slot="props">
					{{ props.row[column.field] }}
				</template>
			</b-table-column>
		</template>

		<template #progress><span /></template>
	</Table>
</template>

<script>
import grid from "@/mixins/grid";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import Table from "@/components/DataGrid/Table";
import BeneficiariesService from "@/services/BeneficiariesService";

export default {
	name: "HouseholdPurchaseList",

	components: { Table },

	mixins: [grid],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "date", width: "60" },
					{ key: "product", width: "60" },
					{ key: "amount", width: "100" },
					{ key: "price", width: "100" },
					{ key: "commodity", width: "100" },
					{ key: "beneficiary", width: "100" },
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
		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await BeneficiariesService.getListOfHouseholdPurchases(
				this.$route.params.householdId,
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then(async ({ data, totalCount }) => {
				this.table.total = totalCount;
				this.table.data = data;
			}).catch((e) => {
				Notification(`Purchases ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},
	},
};
</script>
