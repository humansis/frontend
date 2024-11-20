<template>
	<v-card-title :data-cy="identifierBuilder(`${header}-text`)" class="text-h6 font-weight-bold">
		{{ $t(header) }}

		<v-divider />
	</v-card-title>

	<v-card-text>
		<template v-if="!isHistory">
			<div class="d-flex justify-space-between">
				<span>
					<span
						class="text-subtitle-2 font-weight-bold"
						:data-cy="identifierBuilder(`total-no-transactions-text`)"
					>
						{{ $t("Total No. Transactions") }}:
					</span>
					{{ totalNumberOfTransactions }}
				</span>

				<v-btn
					:disabled="!isUserPermissionGranted(PERMISSIONS.VENDOR_SUMMARY)"
					:data-cy="identifierBuilder(`history-button`)"
					variant="outlined"
					class="text-none text-right"
					@click="onShowHistory"
				>
					{{ $t('See History') }}
				</v-btn>
			</div>

			<template v-if="!loading.isBatches">
				<v-row v-for="batch in batches" :key="batch.id" class="mt-2">
					<v-divider :thickness="2" color="bg-black" class="border-opacity-100" />

					<v-col>
						<p>
							<strong>{{ $t("Unpaid Transactions") }}: </strong>
							{{ batch.purchaseIds.length }}
						</p>

						<p>
							<strong>{{ $t("Project") }}: </strong> {{ batch.project.name }}
						</p>

						<p>
							<strong>{{ $t("Unpaid Transaction Value") }}: </strong>
							{{ formatPrice(batch.value, batch.currency) }}
						</p>
					</v-col>

					<v-col class="d-flex justify-end align-center">
						<v-btn
							:disabled="isRedeemDisabled(batch)"
							:loading="loading.isRedeemButton === batch"
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
			v-else-if="!isRedemptionSummary"
			:vendor-id="vendor.id"
			@showRedemptionSummary="onShowRedemptionSummary"
		/>

		<RedemptionSummary
			v-else
			:redemption-batch-id="redemptionBatch.id"
			:redemption-currency="redemptionCurrency"
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			v-if="isHistory"
			:data-cy="identifierBuilder(`back-button`)"
			class="text-none"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onGoBack"
		>
			{{ $t('Back') }}
		</v-btn>

		<v-btn
			:data-cy="identifierBuilder(`close-button`)"
			class="text-none ml-2"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="$emit('close')"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			v-if="isRedemptionSummary"
			:disabled="isPrintButtonDisabled"
			:loading="loading.isLegacyPrintButton"
			class="text-none ml-2"
			color="primary"
			variant="elevated"
			@click="onLegacyPrint"
		>
			{{ $t('Legacy Print') }}
		</v-btn>

		<v-btn
			v-if="isRedemptionSummary && isPrintButtonVisible"
			:disabled="isPrintButtonDisabled"
			:loading="loading.isPrintButton"
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
import { mapState } from "vuex";
import SmartcardService from "@/services/SmartcardService";
import VendorService from "@/services/VendorService";
import RedeemedBatches from "@/components/Beneficiaries/Smartcard/RedeemedBatches";
import RedemptionSummary from "@/components/Beneficiaries/Smartcard/RedemptionSummary";
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";
import { checkResponseStatus } from "@/utils/fetcher";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";

export default {
	name: "VendorSummary",

	components: {
		RedeemedBatches,
		RedemptionSummary,
	},

	mixins: [
		identifierBuilder,
		permissions,
	],

	props: {
		vendor: {
			type: Object,
			required: true,
		},

		dataCy: {
			type: String,
			default: "modal",
		},
	},

	data() {
		return {
			header: "Vendor Transaction Summary",
			isPrintButtonDisabled: false,
			loading: {
				isLegacyPrintButton: false,
				isPrintButton: false,
				isRedeemButton: false,
				isBatches: false,
			},
			isRedemptionSummary: false,
			isRedeemButtonPressed: false,
			isPrintButtonVisible: true,
			isHistory: false,
			redemptionBatch: null,
			batches: [],
			totalNumberOfTransactions: "",
			redemptionCurrency: "",
		};
	},

	computed: {
		...mapState(["accessibleProjectIds"]),
	},

	created() {
		this.fetchVendorSummary();
		this.fetchSmartcardRedemptions();
	},

	methods: {
		onShowRedemptionSummary(batch) {
			this.isPrintButtonVisible = !!batch.project.name;
			this.isPrintButtonDisabled = !this.isUserPermissionGranted(this.PERMISSIONS.VENDOR_SUMMARY)
				|| !this.accessibleProjectIds.find(
					(accessibleProjectId) => accessibleProjectId === batch.project.id,
				);
			this.redemptionBatch = batch;

			this.redemptionCurrency = batch.currency;
			this.isRedemptionSummary = true;
			this.header = "Vendor Redemption Summary";
		},

		onGoBack() {
			this.fetchSmartcardRedemptions();

			if (!this.isRedeemButtonPressed) {
				if (this.isRedemptionSummary) {
					this.isRedemptionSummary = false;
					this.header = "Redeemed Batches";
				} else if (this.isHistory) {
					this.isHistory = false;
					this.header = "Vendor Transaction Summary";
				}
			} else if (this.isRedeemButtonPressed && this.isRedemptionSummary && this.history) {
				this.isRedemptionSummary = false;
				this.isHistory = false;
				this.isRedeemButtonPressed = false;
				this.header = "Vendor Transaction Summary";
			}
		},

		onShowHistory() {
			this.isHistory = true;
			this.header = "Redeemed Batches";
		},

		isRedeemDisabled(batch) {
			return !batch.canRedeem
				|| !this.isUserPermissionGranted(this.PERMISSIONS.VENDOR_SUMMARY)
				|| !this.accessibleProjectIds.find(
					(accessibleProjectId) => accessibleProjectId === batch.project.id,
				);
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
				this.loading.isBatches = true;

				const {
					data: { data },
					status,
					message,
				} = await SmartcardService.getSmartCardRedemption(this.vendor.id);

				checkResponseStatus(status, message);

				this.batches = data;
			} catch (e) {
				Notification(`${this.$t("Smartcard Redemption")}: ${e.message || e}`, "error");
			} finally {
				this.$emit("loaded");
				this.loading.isBatches = false;
			}
		},

		async fetchVendorSummary() {
			try {
				const {
					data,
					status,
					message,
				} = await VendorService.getSummaryOfVendor(this.vendor.id);

				checkResponseStatus(status, message);

				this.totalNumberOfTransactions = data?.redeemedSmartcardPurchasesTotalCount || 0;
			} catch (e) {
				Notification(`${this.$t("Vendor summary")}: ${e.message || e}`, "error");
			}
		},

		async onRedeem(batch) {
			try {
				this.loading.isRedeemButton = batch;

				const {
					data,
					status,
					message,
				} = await SmartcardService.redeemBatch({
					id: this.vendor.id,
					purchaseIds: batch.purchaseIds,
				});

				checkResponseStatus(status, message);

				this.isHistory = true;
				this.isRedemptionSummary = true;
				this.isRedeemButtonPressed = true;
				this.redemptionBatch = data;
				this.redemptionCurrency = batch.currency;
			} catch (e) {
				Notification(`${this.$t("Redeem Batch")}: ${e.message || e}`, "error");
			} finally {
				this.loading.isRedeemButton = null;
			}
		},

		async onPrint() {
			try {
				this.loading.isPrintButtons = true;

				const filename = `Smartcard_Invoice_${this.vendor.name}_${this.redemptionBatch.date}`;
				const {
					data,
					status,
					message,
				} = await SmartcardService.printSmartcardBatches(this.redemptionBatch.id);

				downloadFile(data, filename, status, "xlsx", message);
			} catch (e) {
				Notification(`${this.$t("Print")}: ${e.message || e}`, "error");
			} finally {
				this.loading.isPrintButtons = false;
			}
		},

		async onLegacyPrint() {
			try {
				this.loading.isLegacyPrintButton = true;

				const filename = `Legacy_Smartcard_Invoice_${this.vendor.name}_${this.redemptionBatch.date}`;
				const {
					data,
					status,
					message,
				} = await SmartcardService.legacyPrintSmartcardBatches(this.redemptionBatch.id);

				downloadFile(data, filename, status, "xlsx", message);
			} catch (e) {
				Notification(`${this.$t("Legacy Print")}: ${e.message || e}`, "error");
			} finally {
				this.loading.isLegacyPrintButton = false;
			}
		},
	},
};
</script>
