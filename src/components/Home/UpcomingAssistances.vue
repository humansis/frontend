<template>
	<div>
		<h2 class="title">Upcoming assistances</h2>
		<Table
			ref="table"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@clicked="goToDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" sortable :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>
		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import AssistancesService from "@/services/AssistancesService";
import Table from "@/components/DataGrid/Table";
import { Toast } from "@/utils/UI";

export default {
	name: "UpcomingAssistances",

	components: {
		Table,
	},

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "id",
						label: "Assistance ID",
					},
					{
						key: "name",
					},
					{
						key: "adm1Id",
						label: "Location",
					},
					{
						key: "beneficiaries",
						label: "Beneficiaries",
					},
					{
						key: "dateDistribution",
						label: "Date of Distribution",
					},
					{
						key: "target",
						label: "Target",
					},
					{
						type: "commodity",
						key: "commodity",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
				sortDirection: "",
				sortColumn: "",
			},
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
			const loadingComponent = this.$buefy.loading.open({
				container: this.$refs.table,
			});

			await AssistancesService.getListOfAssistances(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				true,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => {
				Toast(`(Assistances) ${e}`, "is-danger");
			});

			loadingComponent.close();
		},

		goToDetail() {
			// TODO go to detail
		},

		onPageChange(currentPage) {
			this.table.currentPage = currentPage;
			this.fetchData();
		},

		onSort(column) {
			if (this.table.sortColumn === column) {
				this.table.sortDirection = this.table.sortDirection === "asc" ? "desc" : "asc";
			} else {
				this.table.sortColumn = column;
				this.table.sortDirection = "desc";
			}
			this.fetchData();
		},
	},
};
</script>
