<template>
	<v-card-text>
		<DataGrid
			v-if="table.data.length"
			:headers="table.columns"
			:items="table.data"
			is-row-click-disabled
			is-default-footer-visible
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
					{ key: "id", sortable: false },
					{ key: "localFamilyName", title: "Local family name" },
					{ key: "localGivenName", title: "Local given name" },
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
				preparedData[key].vulnerability = criteria.totalScore
					? Math.round(criteria.totalScore * 100) / 100
					: "";
			});

			this.table.data = preparedData;
		},
	},
};
</script>
