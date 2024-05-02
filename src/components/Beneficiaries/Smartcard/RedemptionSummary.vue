<template>
	<DataGrid
		v-show="show"
		:headers="table.columns"
		:loading="isLoadingList"
		:items="table.data"
		:custom-key-sort="customSort"
		is-row-click-disabled
		is-default-footer-visible
	/>

	<p class="text-right font-weight-bold mt-2">
		{{$t('Total amount')}}: {{ totalAmount }}
	</p>
</template>

<script>
import SmartcardService from "@/services/SmartcardService";
import DataGrid from "@/components/DataGrid";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import { generateColumns } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

const customSort = {
	amount: (a, b) => {
		const amountA = a.match(/\d+\.\d+/);
		const amountB = b.match(/\d+\.\d+/);

		return amountA - amountB;
	},
};

export default {
	name: "RedemptionSummary",

	components: { DataGrid },

	mixins: [grid, baseHelper],

	props: {
		redemptionBatchId: {
			type: Number,
			required: true,
		},

		redemptionCurrency: {
			type: String,
			required: true,
		},
	},

	data() {
		return {
			totalAmount: 0,
			isLoadingList: false,
			customSort,
			table: {
				data: [],
				columns: generateColumns([
					{ key: "date" },
					{ key: "localName", title: "Name (local)" },
					{ key: "amount" },
				]),
				total: 0,
			},
		};
	},

	created() {
		this.fetchPurchases();
	},

	methods: {
		async fetchPurchases() {
			try {
				this.isLoadingList = true;

				const {
					data: { data, totalCount },
					message,
					status,
				} = await SmartcardService.getSmartcardRedemptionPurchases(
					this.redemptionBatchId,
				);

				checkResponseStatus(status, message);

				this.table.data = [];
				this.table.total = totalCount;

				if (totalCount) {
					this.prepareDataForTable(data);
				}
			} catch (e) {
				Notification(`${this.$t("Batches")}: ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},

		prepareDataForTable(data) {
			let total = 0;

			data.forEach((item, key) => {
				this.table.data[key] = {
					...item,
					date: this.$moment(item.dateOfPurchase).format("DD-MM-YYYY HH:mm"),
					amount: this.formatPrice(item.amount, this.redemptionCurrency),
					localName: `${item.localGivenName} (${item.localFamilyName})`,
				};

				total += Number(item.amount);
			});

			this.totalAmount = this.formatPrice(total, this.redemptionCurrency);
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
