<template>
	<div>
		<h2 class="title">Upcoming assistances</h2>
		<b-table
			:data="tableData"
			:paginated="true"
			:per-page="'15'"
			:current-page="1"
			:pagination-simple="false"
			:pagination-position="'bottom'"
			:default-sort-direction="'asc'"
			:sort-icon="'arrow-up'"
			:sort-icon-size="'is-small'"
			:striped="true"
			default-sort="date"
			aria-next-label="Next page"
			aria-previous-label="Previous page"
			aria-page-label="Page"
			aria-current-label="Current page"
		>
			<template v-for="column in tableColumns">
				<b-table-column :key="column.id" v-bind="column">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>
		</b-table>
	</div>
</template>
<script>
import { fetcher } from "@/utils/fetcher";
import { generateColumnsFromData } from "@/utils/datagrid";

export default {
	name: "UpcomingAssistances",

	data() {
		return {
			fetch: {
				error: null,
			},
			tableData: [],
			tableColumns: [],
			visibleColumns: [
				"id",
				"name",
				"adm1Id",
				"dateDistribution",
				"target",
				"type",
			],
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

				this.tableData = [];
				this.tableColumns = [];

				const uri = "assistances?page=1&size=15&sort=asc&upcoming=true";
				const { data: { data } } = await fetcher({ uri, auth: true });

				this.tableData = data;
				this.tableColumns = generateColumnsFromData(data, this.visibleColumns);
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
	},
};
</script>
