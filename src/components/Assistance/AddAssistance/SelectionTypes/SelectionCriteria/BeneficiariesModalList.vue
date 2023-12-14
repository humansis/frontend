<template>
	<v-card-text>
		<DataGrid
			v-if="table.data.length"
			:headers="table.columns"
			:items="table.data"
			is-row-click-disabled
			show-default-footer
		/>
	</v-card-text>
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

		scores: {
			type: Array,
			required: true,
		},
	},

	data() {
		return {
			table: {
				data: [],
				columns: generateColumns([
					{ key: "id" },
					{ key: "localFamilyName", label: "Local family name" },
					{ key: "localGivenName", label: "Local given name" },
					{ key: "vulnerability" },
				]),
				total: 0,
			},
		};
	},

	mounted() {
		this.prepareData();
	},

	methods: {
		async prepareData() {
			const preparedData = [...this.data];

			preparedData.forEach((item, key) => {
				const criteria = this.scores.find(({ beneficiaryId }) => item.id === beneficiaryId) || {};
				preparedData[key].vulnerability = criteria.totalScore;
			});

			this.table.data = preparedData;
		},
	},
};
</script>
