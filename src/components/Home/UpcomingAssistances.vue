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
				<b-table-column :key="column.id" v-bind="column">
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
			fetch: {
				error: null,
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "id",
						label: "Id",
					},
					{
						key: "name",
						label: "Name",
					},
					{
						key: "adm1Id",
						label: "Adm 1 Id",
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
						key: "type",
						label: "Type",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
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
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open({
					container: this.$refs.table,
				});

				this.table.data = [];
				this.table.columns = [];

				await AssistancesService.getListOfAssistances(
					this.table.currentPage,
					this.table.perPage,
					"desc",
					true,
				).then((response) => {
					this.table.data = response.data;
					this.table.total = response.totalCount;
					this.table.columns = generateColumns(
						this.table.visibleColumns,
					);
				}).catch((e) => { Toast(e, "is-danger"); });

				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
		},

		goToDetail() {
			// TODO go to detail
		},

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},
	},
};
</script>
