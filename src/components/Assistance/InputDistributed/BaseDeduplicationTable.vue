<template>
	<DataGrid
		:headers="table.columns"
		:items="data"
		is-row-click-disabled
		is-custom-footer-disabled
		is-default-footer-visible
	/>
</template>

<script>
import DataGrid from "@/components/DataGrid";
import { generateColumns } from "@/utils/datagrid";

export default {
	name: "BaseDeduplicationTable",

	components: {
		DataGrid,
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
				columns: generateColumns([
					{ key: "documentNumber", title: "Document number", sortable: false },
					{ key: "beneficiaryId", title: "Beneficiary ID", sortable: false },
					{ key: "message", sortable: false },
				]),
				total: 0,
			},
		};
	},

	mounted() {
		if (this.showOnlyIdNumber) {
			this.table.columns = [this.table.columns[0]];
		}
	},
};
</script>
