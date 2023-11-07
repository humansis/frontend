<template>
	<div>
		<Table
			class="distributed-table"
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
	</div>
</template>

<script>
import ColumnField from "@/components/DataGrid/ColumnField";
import Table from "@/components/DataGrid/Table";
import { generateColumns } from "@/utils/datagrid";

export default {
	name: "BaseDeduplicationTable",

	components: {
		ColumnField,
		Table,
	},

	props: {
		data: {
			type: Array,
			required: true,
		},

		showOnlyIdNumber: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "documentNumber", sortable: true, searchable: true },
					{ key: "beneficiaryId", sortable: true, searchable: true },
					{ key: "message", sortable: true, searchable: true },
				],
				total: 0,
			},
		};
	},

	mounted() {
		if (this.showOnlyIdNumber) {
			this.table.visibleColumns = [this.table.visibleColumns[0]];
		}

		this.table.columns = generateColumns(this.table.visibleColumns);
	},
};
</script>

<style type="text/css">
.distributed-table thead th:last-child .th-wrap {
	justify-content: flex-start !important;
}
</style>
