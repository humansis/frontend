<template>
	<section class="modal-card-body">
		<Table
			has-search
			:data="data"
			:total="data.length"
			:columns="table.visibleColumns"
			:backend-pagination="false"
			:backend-searching="false"
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
import { generateColumns } from "@/utils/datagrid";

export default {
	name: "BeneficiariesModalList",

	components: {
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
					{ key: "id", sortable: true, searchable: true },
					{ key: "localFamilyName", label: "Family Name", sortable: true, searchable: true },
					{ key: "localGivenName", label: "First Name", sortable: true, searchable: true },
					{ key: "vulnerabilityCriteria", type: "svgIcon", sortable: true, searchable: true },
				],
				total: 0,
			},
		};
	},

	created() {
		this.fetchData();
	},

	methods: {
		fetchData() {
			this.table.columns = generateColumns(this.table.visibleColumns);
		},
	},
};
</script>
