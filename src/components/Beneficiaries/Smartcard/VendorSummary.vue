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
					<span class="has-text-weight-bold">{{ $t("Total No. Transactions") }}: </span>
					{{ totalNumberOfTransactions }}
				</span>

				<span>
					<b-button
						class="is-right is-pulled-right"
						:disabled="isProjectsLoading"
						@click="showHistory"
					>
						{{ $t('See History')}}
					</b-button>
				</span>

				<template v-if="!isBatchesLoading">
					<div v-for="batch in batches" :key="batch.id">
						<hr class="spacer">

						<div class="columns">
							<div class="column is-four-fifths">
								<p>
									<strong>{{ $t("Unpaid Transactions") }}: </strong>
									{{ batch.purchaseIds.length }}
								</p>

								<p>
									<strong>{{ $t("Project") }}: </strong> {{ getProjectName(batch.projectId) }}
								</p>

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
									:disabled="!batch.canRedeem"
									@click.native="redeem(batch)"
								/>
							</div>
						</div>
					</div>
				</template>

				<b-loading v-else :is-full-page="false" :active="true" />
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
					{{ $t('Back')}}
				</b-button>
			</span>

			<span class="level-right">
				<b-button @click.native="$emit('close')">
					{{ $t('Close') }}
				</b-button>

				<b-button
					v-if="redemptionSummary"
					type="is-primary"
					:loading="legacyPrintLoading"
					:label="$t('Legacy Print')"
					@click.native="legacyPrint"
				/>

				<b-button
					v-if="redemptionSummary && printButtonVisible"
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
import ProjectService from "@/services/ProjectService";
import SmartcardService from "@/services/SmartcardService";
import VendorService from "@/services/VendorService";
import RedeemedBatches from "@/components/Beneficiaries/Smartcard/RedeemedBatches";
import RedemptionSummary from "@/components/Beneficiaries/Smartcard/RedemptionSummary";
import grid from "@/mixins/grid";
import { Notification } from "@/utils/UI";

export default {
	name: "VendorSummary",

	components: { RedemptionSummary, RedeemedBatches },

	mixins: [grid],

	props: {
		vendor: Object,
	},

	data() {
		return {
			header: this.$t("Vendor Transaction Summary"),
			legacyPrintLoading: false,
			printLoading: false,
			redeemLoading: false,
			history: false,
			redemptionBatch: null,
			redemptionSummary: false,
			redeemButtonPressed: false,
			printButtonVisible: true,
			isProjectsLoading: false,
			isBatchesLoading: false,
			batches: [],
			projects: [],
			totalNumberOfTransactions: "",
		};
	},

	created() {
		this.fetchVendorSummary();
		this.fetchSmartcardRedemptions();
		this.fetchProjects();
	},

	methods: {
		showRedemptionSummary(batch) {
			this.printButtonVisible = true;
			this.redemptionBatch = batch;

			if (!this.getProjectName(batch.projectId)) {
				this.printButtonVisible = false;
			}

			this.redemptionSummary = true;
			this.header = this.$t("Vendor Redemption Summary");
		},

		getProjectName(id) {
			return this.projects.find((project) => project.id === id)?.name;
		},

		goBack() {
			this.fetchSmartcardRedemptions();

			if (!this.redeemButtonPressed) {
				if (this.redemptionSummary) {
					this.redemptionSummary = false;
					this.header = this.$t("Redeemed Batches");
				} else if (this.history) {
					this.history = false;
					this.header = this.$t("Vendor Transaction Summary");
				}
			} else if (this.redeemButtonPressed && this.redemptionSummary && this.history) {
				this.redemptionSummary = false;
				this.history = false;
				this.redeemButtonPressed = false;
				this.header = this.$t("Vendor Transaction Summary");
			}
		},

		showHistory() {
			this.history = true;
			this.header = this.$t("Redeemed Batches");
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
			try {
				this.isBatchesLoading = true;

				const { data } = await SmartcardService.getSmartCardRedemption(this.vendor.id);

				this.batches = data;
			} catch (e) {
				Notification(`${this.$t("Smartcard Redemption")} ${e.message || e}`, "is-danger");
			} finally {
				this.$emit("loaded");
				this.isBatchesLoading = false;
			}
		},

		async fetchVendorSummary() {
			try {
				const data = await VendorService.getSummaryOfVendor(this.vendor.id);

				this.totalNumberOfTransactions = data?.redeemedSmartcardPurchasesTotalCount || 0;
			} catch (e) {
				Notification(`${this.$t("Projects")} ${e.message || e}`, "is-danger");
			}
		},

		async fetchProjects() {
			try {
				this.isProjectsLoading = true;

				const { data: { data } } = await ProjectService.getShortListOfProjects();

				this.projects = data;
			} catch (e) {
				Notification(`${this.$t("Projects")} ${e.message || e}`, "is-danger");
			} finally {
				this.isProjectsLoading = false;
			}
		},

		async redeem(batch) {
			this.redeemLoading = batch;
			await SmartcardService.redeemBatch(this.vendor.id, batch.purchaseIds)
				.then(({ data }) => {
					this.history = true;
					this.redemptionSummary = true;
					this.redeemButtonPressed = true;
					this.redemptionBatch = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Redeem Batch")} ${e}`, "is-danger");
				});
			this.redeemLoading = null;
		},

		async print() {
			this.printLoading = true;
			await SmartcardService.printSmartcardBatches(this.redemptionBatch.id)
				.then(({ data, status, message }) => {
					if (status === 200) {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `Smartcard_Invoice_${this.vendor.name}_${this.redemptionBatch.date}.xlsx`;
						link.click();
					} else {
						Notification(message, "is-warning");
					}
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Print")} ${e}`, "is-danger");
				});
			this.printLoading = false;
		},

		async legacyPrint() {
			this.legacyPrintLoading = true;
			await SmartcardService.legacyPrintSmartcardBatches(this.redemptionBatch.id)
				.then(({ data, status, message }) => {
					if (status === 200) {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `Legacy_Smartcard_Invoice_${this.vendor.name}_${this.redemptionBatch.date}.xlsx`;
						link.click();
					} else {
						Notification(message, "is-warning");
					}
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
