<template>
	<DataGrid
		v-show="show"
		:headers="table.columns"
		:loading="isLoadingList"
		:items="table.data"
		:custom-key-sort="customSort"
		is-row-click-disabled
		show-default-footer
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				icon="search"
				tooltip-text="Vendor Redemption Summary"
				@actionConfirmed="$emit('showRedemptionSummary', row)"
			/>
		</template>
	</DataGrid>
</template>

<script>
import SmartcardService from "@/services/SmartcardService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import grid from "@/mixins/grid";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

const customSort = {
	total: (a, b) => {
		const amountA = a.match(/\d+\.\d+/);
		const amountB = b.match(/\d+\.\d+/);

		return amountA - amountB;
	},
};

export default {
	name: "RedeemedBatches",

	components: {
		DataGrid,
		ButtonAction,
	},

	mixins: [grid],

	props: {
		projects: Array,
		vendorId: Number,
	},

	data() {
		return {
			customSort,
			isLoadingList: false,
			table: {
				data: [],
				columns: generateColumns([
					{ key: "date" },
					{ key: "project" },
					{ key: "quantity" },
					{ key: "total", title: "Total" },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
			},
		};
	},

	created() {
		this.fetchBatches();
	},

	methods: {
		async fetchBatches() {
			this.isLoadingList = true;

			await SmartcardService.getSmartcardRedemptionBatches([this.vendorId])
				.then(({ data, totalCount }) => {
					this.table.total = totalCount;
					this.prepareDataForTable(data);
				}).catch((e) => {
					Notification(`${this.$t("Batches")} ${e.message || e}`, "error");
				});

			this.isLoadingList = false;
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].date = this.$moment(item.date).format("DD-MM-YYYY HH:mm");
				this.table.data[key].total = this.formatPrice(item.value, item.currency);
				this.table.data[key].project = this.projects
					.find((project) => project.id === item.projectId)?.name;
			});
		},

		formatPrice(price, currency) {
			const format = Intl.NumberFormat("en-US", {
				style: "currency",
				currency,
				minimumFractionDigits: 2,
			});
			return format.format(price);
		},
	},
};
</script>
