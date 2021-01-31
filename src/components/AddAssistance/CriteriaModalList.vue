<!-- TODO implement -->
<template>
	<section class="modal-card-body">
		<div class="columns">
			<Search class="column is-two-fifths" @search="onSearch" />
		</div>
		<Table
			:data="table.data"
			:total="table.total"
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
	</section>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ColumnField from "@/components/DataGrid/ColumnField";
import Search from "@/components/Search";
import { generateColumns } from "@/utils/datagrid";

export default {
	name: "CriteriaModalList",

	components: {
		Search,
		ColumnField,
		Table,
	},

	props: {
		criteria: Array,
	},

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id" },
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
			this.$store.commit("loading", true);
			// TODO get real data from API
			this.table.columns = generateColumns(this.table.visibleColumns);
		},

		onSearch(value) {
			// TODO implement after real data
			console.log(value);
		},
	},
};
</script>
