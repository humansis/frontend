<template>
	<div v-for="({ idNumber, beneficiaries }, index) of data" :key="index">
		<p>{{ $t('Conflicts with ID Number') }}
			<v-chip class="ml-2 mr-2" color="is-primary">
				{{ idNumber }}
			</v-chip>
		</p>

		<DataGrid
			:headers="table.columns"
			:items="beneficiaries"
			is-row-click-disabled
			is-footer-disabled
		/>
	</div>
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
			default: () => [],
		},
	},

	data() {
		return {
			table: {
				visibleColumns: generateColumns([
					{ key: "id", sortable: false },
					{ key: "householdId", sortable: false },
					{ key: "localGivenName", sortable: false },
					{ key: "localFamilyName", sortable: false },
					{ key: "dateOfBirth", type: "date", sortable: false },
				]),
				total: 0,
			},
		};
	},
};
</script>
