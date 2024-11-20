<template>
	<DataGrid
		v-show="show"
		:headers="table.columns"
		:loading="isLoadingList"
		:items="table.data"
		:custom-key-sort="customSort"
		:data-cy="prepareComponentIdentifier('redeemed-batches-table')"
		is-row-click-disabled
		is-default-footer-visible
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
import identifierBuilder from "@/mixins/identifierBuilder";
import { generateColumns } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
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

	mixins: [grid, identifierBuilder],

	props: {
		vendorId: {
			type: Number,
			required: true,
		},
	},

	data() {
		return {
			customSort,
			isLoadingList: false,
			table: {
				data: [],
				columns: generateColumns([
					{ key: "date" },
					{ key: "projectName", title: "Project" },
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
			try {
				this.isLoadingList = true;

				const {
					data: { data, totalCount },
					status,
					message,
				} = await SmartcardService.getSmartcardRedemptionBatches([this.vendorId]);

				checkResponseStatus(status, message);

				this.table.total = totalCount;
				this.prepareDataForTable(data);
			} catch (e) {
				Notification(`${this.$t("Batches")}: ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = {
					...item,
					date: this.$moment(item.date).format("YYYY-MM-DD HH:mm"),
					total: this.formatPrice(item.value, item.currency),
					projectName: item.project.name,
				};
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
