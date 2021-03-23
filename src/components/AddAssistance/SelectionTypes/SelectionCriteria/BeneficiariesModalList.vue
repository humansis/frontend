<!-- TODO implement -->
<template>
	<section class="modal-card-body">
		<Search class="column is-two-fifths" @search="onSearch" />
		<Table
			:data="data"
			:total="data.length"
			:backend-pagination="false"
			:backend-sorting="false"
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
	name: "BeneficiariesModalList",

	components: {
		Search,
		ColumnField,
		Table,
	},

	props: {
		data: Array,
	},

	data() {
		return {
			table: {
				columns: [],
				visibleColumns: [
					{ key: "id", sortable: true },
					{ key: "localFamilyName", label: "Family Name", sortable: true },
					{ key: "localGivenName", label: "First Name", sortable: true },
					{ key: "vulnerability", sortable: true },
				],
				total: 0,
			},
		};
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		fetchData() {
			this.table.columns = generateColumns(this.table.visibleColumns);
			console.log(this.data);
		},

		onSearch() {
			// TODO Search in this.data and update result in the table
		},
	},
};
</script>
