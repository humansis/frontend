<template>
	<DataGrid
		:headers="table.columns"
		:items="data"
		is-row-click-disabled
		is-footer-disabled
	/>
</template>

<script>
import DataGrid from "@/components/DataGrid";
import { generateColumns } from "@/utils/datagrid";

export default {
	name: "BeneficiariesModalList",

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
					{ key: "idNumber", sortable: false },
					{ key: "beneficiaryId", sortable: false },
					{ key: "reliefPackageId", sortable: false },
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
