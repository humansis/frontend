<template>
	<div class="modal-card">
		<header class="modal-card-head">
			<h2 class="modal-card-title title is-5 mb-0">{{ header }}</h2>
			<button
				type="button"
				class="delete"
				@click="$emit('close')"
			/>
		</header>
		<section class="modal-card-body">
			<div v-if="!history">
				<span>
					<span class="has-text-weight-bold">Total No. Transactions: </span>
					{{ numberOfTransactions }}
				</span>
				<span>
					<b-button class="is-right is-pulled-right" @click="showHistory">
						See History
					</b-button>
				</span>
				<div v-for="batch in batches" :key="batch.id">
					<hr class="spacer">
					<div class="columns">
						<div class="column is-four-fifths">
							<p>
								<strong>{{ $t("Unpaid Transactions") }}: </strong>
								{{ batch.purchaseIds.length }}
							</p>
							<p><strong>{{ $t("Project") }}: </strong> {{ getProjectName(batch.projectId) }}</p>
							<p>
								<strong>{{ $t("Unpaid Transaction Value") }}: </strong>
								{{ formatPrice(batch.value, batch.currency) }}
							</p>
						</div>
						<div class="column has-text-right">
							<b-button
								class="mt-3"
								type="is-primary"
								:loading="redeemLoading === batch"
								:label="$t('Redeem')"
								@click.native="redeem(batch)"
							/>
						</div>
					</div>
				</div>
			</div>
			<RedeemedBatches
				v-else-if="!redemptionSummary"
				:projects="projects"
				:vendor-id="vendor.id"
				@showRedemptionSummary="showRedemptionSummary"
			/>
			<RedemptionSummary
				v-else
				:redemption-batch-id="redemptionBatch.id"
			/>
		</section>
		<footer class="modal-card-foot level">
			<span class="level-item is-justify-content-start">
				<b-button v-if="history" @click.native="goBack">
					Back
				</b-button>
			</span>
			<span class="level-right">
				<b-button @click.native="$emit('close')">
					Close
				</b-button>
				<b-button
					v-if="redemptionSummary"
					type="is-primary"
					:loading="legacyPrintLoading"
					:label="$t('Legacy Print')"
					@click.native="legacyPrint"
				/>
				<b-button
					v-if="redemptionSummary"
					type="is-primary"
					:loading="printLoading"
					:label="$t('Print')"
					@click.native="print"
				/>
			</span>
		</footer>
	</div>
</template>

<script>
import grid from "@/mixins/grid";
import SmartcardService from "@/services/SmartcardService";
import { Notification } from "@/utils/UI";
import ProjectService from "@/services/ProjectService";
import RedeemedBatches from "@/components/Beneficiaries/Smartcard/RedeemedBatches";
import RedemptionSummary from "@/components/Beneficiaries/Smartcard/RedemptionSummary";

export default {
	name: "VendorSummary",

	components: { RedemptionSummary, RedeemedBatches },

	props: {
		vendor: Object,
	},

	mixins: [grid],

	data() {
		return {
			header: "Vendor Transaction Summary",
			legacyPrintLoading: false,
			printLoading: false,
			redeemLoading: false,
			history: false,
			redemptionBatch: null,
			redemptionSummary: false,
			batches: [],
			projects: [],
		};
	},

	computed: {
		numberOfTransactions() {
			if (!this.batches.length) return 0;
			let total = 0;
			this.batches.forEach(({ purchaseIds }) => { total += purchaseIds.length; });
			return total;
		},
	},

	created() {
		this.fetchSmartcardRedemptions();
		this.fetchProjects();
	},

	methods: {
		showRedemptionSummary(batch) {
			this.redemptionBatch = batch;
			this.redemptionSummary = true;
			this.header = "Vendor Redemption Summary";
		},

		getProjectName(id) {
			return this.projects.find((project) => project.id === id)?.name;
		},

		goBack() {
			if (this.redemptionSummary) {
				this.redemptionSummary = false;
				this.header = "Redeemed Batches";
			} else if (this.history) {
				this.history = false;
				this.header = "Vendor Transaction Summary";
			}
		},

		showHistory() {
			this.history = true;
			this.header = "Redeemed Batches";
		},

		formatPrice(price, currency) {
			const format = Intl.NumberFormat("en-US", {
				style: "currency",
				currency,
				minimumFractionDigits: 2,
			});
			return format.format(price);
		},

		async fetchSmartcardRedemptions() {
			await SmartcardService.getSmartCardRedemption(this.vendor.id)
				.then(({ data }) => {
					this.batches = data;
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Smartcard Redemption")} ${e}`, "is-danger");
				});
			this.$emit("loaded");
		},

		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.projects = data;
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});
		},

		async redeem(batch) {
			this.redeemLoading = batch;
			await SmartcardService.redeemBatch(this.vendor.id, batch.purchaseIds)
				.then(({ data }) => {
					this.history = true;
					this.redemptionBatch = data;
					this.redemptionSummary = true;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Redeem Batch")} ${e}`, "is-danger");
				});
			this.redeemLoading = null;
		},

		async print() {
			this.printLoading = true;
			await SmartcardService.printSmartcardBatches(this.redemptionBatch.id)
				.then(({ data }) => {
					const blob = new Blob([data], { type: data.type });
					const link = document.createElement("a");
					link.href = window.URL.createObjectURL(blob);
					link.download = `Smartcard_Invoice_${this.vendor.name}_${this.redemptionBatch.date}.xlsx`;
					link.click();
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Print")} ${e}`, "is-danger");
				});
			this.printLoading = false;
		},

		async legacyPrint() {
			this.legacyPrintLoading = true;
			await SmartcardService.legacyPrintSmartcardBatches(this.redemptionBatch.id)
				.then(({ data }) => {
					const blob = new Blob([data], { type: data.type });
					const link = document.createElement("a");
					link.href = window.URL.createObjectURL(blob);
					link.download = `Legacy_Smartcard_Invoice_${this.vendor.name}_${this.redemptionBatch.date}.xlsx`;
					link.click();
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Legacy Print")} ${e}`, "is-danger");
				});
			this.legacyPrintLoading = false;
		},
	},
};
</script>

<style scoped>
.modal-card-foot {
	justify-content: unset !important;
}
.spacer:nth-of-type(1) {
	height: 2px;
	background-color: black;
}
</style>
