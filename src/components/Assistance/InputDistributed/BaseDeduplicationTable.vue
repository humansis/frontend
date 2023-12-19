<template>
	<Table
		:headers="table.columns"
		:items="data"
		is-row-click-disabled
		is-footer-disabled
	/>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import { generateColumns } from "@/utils/datagrid";

export default {
	name: "BaseDeduplicationTable",

	components: {
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
					{ key: "documentNumber", sortable: false },
					{ key: "beneficiaryId", sortable: false },
					{ key: "message", sortable: false },
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
