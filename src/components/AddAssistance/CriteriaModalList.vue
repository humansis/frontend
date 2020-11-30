<!-- TODO implement -->
<template>
	<div>
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input
						placeholder="Search..."
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
			@pageChanged="onPageChange"
			@sorted="onSort"
		>

			<template v-for="column in table.columns">
				<b-table-column
					v-bind="column"
					v-slot="props"
					:key="column.id"
				>
					<ColumnField :column="column" :data="props" />
				</b-table-column>
			</template>
		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import Table from "@/components/DataGrid/Table";
import ColumnField from "@/components/DataGrid/ColumnField";

export default {
	name: "CriteriaModalList",

	components: {
		ColumnField,
		Table,
	},

	props: {
		criteria: Array,
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
						label: "ID",
					},
					{
						key: "familyName",
						label: "Family Name [English]",
					},
					{
						key: "familyGivenName",
						label: "First Name [English]",
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
				const loadingComponent = this.$buefy.loading.open();
				// TODO get real data from API
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);

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

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},
	},
};
</script>
