<template>
	<div>
		<h2 class="title">Project assistances</h2>
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
			<template slot-scope="props">

				<b-table-column field="id"
					label="Distribution ID" sortable numeric>
					{{ props.row.id }}
				</b-table-column>

				<b-table-column field="name" label="Name" sortable >
					{{ props.row.name }}
				</b-table-column>

				<b-table-column field="type" label="Type" sortable >
					{{ props.row.type }}
				</b-table-column>

				<b-table-column field="target" label="Location" sortable>
					{{ props.row.target }}
				</b-table-column>

				<b-table-column field="target" label="Beneficiaries" sortable>
					{{ props.row.target }}
				</b-table-column>

				<b-table-column field="date" label="Date of Distribution" sortable centered>
					<span class="tag is-success">
						{{ props.row.date }}
					</span>
				</b-table-column>

				<b-table-column field="target" label="Target" sortable>
					{{ props.row.target }}
				</b-table-column>

				<b-table-column field="commodity" label="Commodity" sortable>
					{{ props.row.commodity }}
				</b-table-column>

			</template>
		</b-table>
	</div>
</template>
<script>
import { fetcher } from "@/utils/fetcher";

export default {
	name: "Assistances",

	data() {
		return {
			fetch: {
				error: null,
			},
			tableData: [],
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

				const uri = `assistances/${this.$route.params.id}`;
				const { data } = await fetcher({ uri, auth: true });
				this.tableData = data;
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
