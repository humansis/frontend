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
		data: {
			type: Array,
			required: true,
		},
		scores: {
			type: Array,
			required: true,
		},
	},

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id", sortable: true, searchable: true },
					{ key: "localFamilyName", label: "Family Name", sortable: true, searchable: true },
					{ key: "localGivenName", label: "First Name", sortable: true, searchable: true },
					{ key: "vulnerability", sortable: true, searchable: true },
				],
				total: 0,
			},
		};
	},

	created() {
		this.table.columns = generateColumns(this.table.visibleColumns);
	},

	mounted() {
		this.prepareData();
	},

	methods: {
		async prepareData() {
			const preparedData = [...this.data];

			preparedData.forEach((item, key) => {
				const criteria = this.scores.find(({ beneficiaryId }) => item.id === beneficiaryId);
				preparedData[key].vulnerability = criteria?.totalScore || "";
			});

			this.table.data = preparedData;
		},
	},
};
</script>
