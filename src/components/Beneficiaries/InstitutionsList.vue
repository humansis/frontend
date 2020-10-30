<template>
	<div>
		<h2 class="title">Institutions</h2>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
		>
			Add
		</b-button>
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input placeholder="Search..."
						type="search"
						icon="search"
					/>
				</b-field>
			</div>
		</div>

		<Table
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

			<b-table-column
				label="Actions"
			>
				<div class="block">
					<b-icon
						icon="edit"
						type="is-link"
						size="is-medium">
					</b-icon>
					<b-icon
						icon="search"
						type="is-info"
						size="is-medium">
					</b-icon>
					<b-icon
						icon="trash"
						type="is-danger"
						size="is-medium">
					</b-icon>
					<b-icon
						icon="print"
						type="is-dark"
						size="is-medium">
					</b-icon>
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { fetcher } from "@/utils/fetcher";
import { generateColumnsFromData } from "@/utils/datagrid";
import Table from "@/components/Table";

export default {
	name: "InstitutionsList",

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
				visibleColumns: [],
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
					container: this.$refs.projectsList,
				});

				this.tableData = [];
				this.tableColumns = [];

				const uri = "institutions?page=1&size=15&sort=asc";
				const { data: { data } } = await fetcher({ uri, auth: true });

				this.table.data = data;
				this.table.columns = generateColumnsFromData(data);

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
