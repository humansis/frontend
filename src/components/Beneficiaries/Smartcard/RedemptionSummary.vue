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
import BeneficiariesService from "@/services/BeneficiariesService";
import SmartcardService from "@/services/SmartcardService";
import DataGrid from "@/components/DataGrid";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import { generateColumns } from "@/utils/datagrid";
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
		projects: Array,
		purchaseIds: Array,
		redemptionBatchId: Number,
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
					{ key: "beneficiary", title: "Name (local)" },
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
			this.isLoadingList = true;

			await SmartcardService.getSmartcardRedemptionPurchases(this.redemptionBatchId)
				.then(({ data, totalCount }) => {
					this.table.data = data;
					this.prepareDataForTable(data);
					this.table.total = totalCount;
				}).catch((e) => {
					Notification(`${this.$t("Batches")} ${e.message || e}`, "error");
				});

			this.isLoadingList = false;
		},

		prepareDataForTable(data) {
			const beneficiaryIds = [];
			let total = 0;
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].date = this.$moment(item.dateOfPurchase).format("DD-MM-YYYY HH:mm");
				total += item.value;
				this.table.data[key].amount = this.formatPrice(item.value, item.currency);
				beneficiaryIds.push(item.beneficiaryId);
			});
			this.totalAmount = this.formatPrice(total, data[0].currency);

			this.prepareBeneficiaryForTable([...new Set(beneficiaryIds)]);
		},

		async prepareBeneficiaryForTable(beneficiaryIds) {
			const beneficiaries = await this.getBeneficiaries(beneficiaryIds);
			this.table.data.forEach((item, key) => {
				const beneficiary = beneficiaries.find(({ id }) => id === item.beneficiaryId);
				if (beneficiary) {
					this.table.data[key].beneficiary = this
						.prepareName(beneficiary.localGivenName, beneficiary.localFamilyName);
				}
			});
			this.reload();
		},

		async getBeneficiaries(ids) {
			try {
				const filters = { isArchived: true };

				const { data } = await BeneficiariesService.getBeneficiaries(ids, filters);

				return data;
			} catch (e) {
				Notification(`${this.$t("Beneficiaries")} ${e.message || e}`, "error");
			}

			return [];
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
