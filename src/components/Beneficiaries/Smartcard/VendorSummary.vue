<template>
	<v-card-title class="text-h6 font-weight-bold">
		{{ $t(header) }}

		<v-divider />
	</v-card-title>

	<v-card-text>
		<template v-if="!history">
			<div class="d-flex justify-space-between">
				<span>
					<span class="text-subtitle-2 font-weight-bold">{{ $t("Total No. Transactions") }}: </span>
					{{ totalNumberOfTransactions }}
				</span>

				<v-btn
					:disabled="isProjectsLoading"
					variant="outlined"
					class="text-none text-right"
					@click="onShowHistory"
				>
					{{ $t('See History') }}
				</v-btn>
			</div>

			<template v-if="!isBatchesLoading">
				<v-row v-for="batch in batches" :key="batch.id" class="mt-2">
					<v-divider :thickness="2" color="bg-black" class="border-opacity-100" />

					<v-col>
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
					</v-col>

					<v-col class="d-flex justify-end align-center">
						<v-btn
							:disabled="!batch.canRedeem"
							:loading="redeemLoading === batch"
							color="primary"
							class="text-none text-right"
							@click="onRedeem(batch)"
						>
							{{ $t('Redeem') }}
						</v-btn>
					</v-col>
				</v-row>
			</template>

			<v-progress-circular
				v-else
				:size="50"
				color="primary"
				class="d-flex mx-auto"
				indeterminate
			/>

		</template>

		<RedeemedBatches
			v-else-if="!redemptionSummary"
			:projects="projects"
			:vendor-id="vendor.id"
			@showRedemptionSummary="onShowRedemptionSummary"
		/>

		<RedemptionSummary
			v-else
			:redemption-batch-id="redemptionBatch.id"
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			v-if="history"
			class="text-none"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onGoBack"
		>
			{{ $t('Back') }}
		</v-btn>

		<v-btn
			class="text-none ml-2"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="$emit('close')"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			v-if="redemptionSummary"
			:loading="legacyPrintLoading"
			class="text-none ml-2"
			color="primary"
			variant="elevated"
			@click="onLegacyPrint"
		>
			{{ $t('Legacy Print') }}
		</v-btn>

		<v-btn
			v-if="redemptionSummary && printButtonVisible"
			:loading="printLoading"
			class="text-none ml-2"
			color="primary"
			variant="elevated"
			@click="onPrint"
		>
			{{ $t('Print') }}
		</v-btn>
	</v-card-actions>
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

	components: {
		RedeemedBatches,
		RedemptionSummary,
	},

	mixins: [grid],

	props: {
		vendor: {
			type: Object,
			required: true,
		},
	},

	data() {
		return {
			header: "Vendor Transaction Summary",
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
		onShowRedemptionSummary(batch) {
			this.printButtonVisible = true;
			this.redemptionBatch = batch;

			if (!this.getProjectName(batch.projectId)) {
				this.printButtonVisible = false;
			}

			this.redemptionSummary = true;
			this.header = "Vendor Redemption Summary";
		},

		getProjectName(id) {
			return this.projects.find((project) => project.id === id)?.name;
		},

		onGoBack() {
			this.fetchSmartcardRedemptions();

			if (!this.redeemButtonPressed) {
				if (this.redemptionSummary) {
					this.redemptionSummary = false;
					this.header = "Redeemed Batches";
				} else if (this.history) {
					this.history = false;
					this.header = "Vendor Transaction Summary";
				}
			} else if (this.redeemButtonPressed && this.redemptionSummary && this.history) {
				this.redemptionSummary = false;
				this.history = false;
				this.redeemButtonPressed = false;
				this.header = "Vendor Transaction Summary";
			}
		},

		onShowHistory() {
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
			try {
				this.isBatchesLoading = true;

				const { data } = await SmartcardService.getSmartCardRedemption(this.vendor.id);

				this.batches = data;
			} catch (e) {
				Notification(`${this.$t("Smartcard Redemption")} ${e.message || e}`, "error");
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
				Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
			}
		},

		async fetchProjects() {
			try {
				this.isProjectsLoading = true;

				const { data: { data } } = await ProjectService.getShortListOfProjects();

				this.projects = data;
			} catch (e) {
				Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
			} finally {
				this.isProjectsLoading = false;
			}
		},

		async onRedeem(batch) {
			this.redeemLoading = batch;
			await SmartcardService.redeemBatch(this.vendor.id, batch.purchaseIds)
				.then(({ data }) => {
					this.history = true;
					this.redemptionSummary = true;
					this.redeemButtonPressed = true;
					this.redemptionBatch = data;
				})
				.catch((e) => {
					Notification(`${this.$t("Redeem Batch")} ${e.message || e}`, "error");
				});
			this.redeemLoading = null;
		},

		async onPrint() {
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
						Notification(message, "warning");
					}
				})
				.catch((e) => {
					Notification(`${this.$t("Print")} ${e.message || e}`, "error");
				});
			this.printLoading = false;
		},

		async onLegacyPrint() {
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
						Notification(message, "warning");
					}
				})
				.catch((e) => {
					Notification(`${this.$t("Legacy Print")} ${e.message || e}`, "error");
				});
			this.legacyPrintLoading = false;
		},
	},
};
</script>
