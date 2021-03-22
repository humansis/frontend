<template>
	<Table
		ref="assistanceList"
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
import AssistancesService from "@/services/AssistancesService";
import Table from "@/components/DataGrid/Table";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";

export default {
	name: "HouseholdAssistanceList",

	components: { Table },

	mixins: [grid],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "commodity", width: "60" },
					{ key: "amount", label: "Amount", width: "60" },
					{ key: "date", label: "First Name", width: "100" },
					{ key: "distribution", width: "100" },
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
			await AssistancesService.getListOfHouseholdAssistances(
				this.$route.params.householdId,
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then(async ({ data, totalCount }) => {
				this.table.total = totalCount;
				this.table.data = data;
			}).catch((e) => {
				Notification(`Assistances ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},
	},
};
</script>
