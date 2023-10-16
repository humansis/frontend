<template>
	<section class="modal-card-body">
		<Table
			v-show="show"
			:data="table.data"
			:total="table.total"
			:columns="table.visibleColumns"
			:backend-sorting="false"
			:is-loading="isLoadingList"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" sortable :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>
			<template #footer>
				<span class="is-pulled-right mr-6">
					{{ totalAmount }}
				</span>
			</template>
		</Table>
	</section>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import SmartcardService from "@/services/SmartcardService";
import Table from "@/components/DataGrid/Table";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

export default {
	name: "RedemptionSummary",

	components: { Table },

	mixins: [grid, baseHelper],

	props: {
		projects: Array,
		purchaseIds: Array,
		redemptionBatchId: Number,
	},

	data() {
		return {
			totalAmount: 0,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "date" },
					{ key: "beneficiary", label: "Name (local)" },
					{ key: "amount", customSort: this.sortAmount },
				],
				total: 0,
			},
		};
	},

	created() {
		this.fetchPurchases();
	},

	methods: {
		sortAmount(a, b, c) {
			if (!c) {
				return a.value - b.value;
			}
			return b.value - a.value;
		},

		async fetchPurchases() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await SmartcardService.getSmartcardRedemptionPurchases(this.redemptionBatchId)
				.then(({ data, totalCount }) => {
					this.table.data = data;
					this.prepareDataForTable(data);
					this.table.total = totalCount;
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Batches")} ${e}`, "is-danger");
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
			return BeneficiariesService.getBeneficiaries(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Beneficiaries")} ${e}`, "is-danger");
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
