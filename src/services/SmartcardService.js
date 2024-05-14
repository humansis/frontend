import { download, fetcher } from "@/utils/fetcher";

export default {
	getSmartCardRedemption(id) {
		return fetcher({
			uri: `vendors/${id}/smartcard-redemption-candidates`,
		});
	},

	getSmartcardRedemptionBatches(id) {
		return fetcher({
			uri: `vendors/${id}/smartcard-redemption-batches`,
		});
	},

	getSmartcardRedemptionPurchases(id) {
		return fetcher({
			uri: `smartcard-redemption-batches/${id}/redemption-summaries`,
		});
	},

	printSmartcardBatches(id) {
		return download({
			uri: `smartcard-redemption-batches/${id}/exports`,
		});
	},

	legacyPrintSmartcardBatches(id) {
		return download({
			uri: `smartcard-redemption-batches/${id}/legacy-exports`,
		});
	},

	redeemBatch({ id, purchaseIds }) {
		return fetcher({
			uri: `vendors/${id}/smartcard-redemption-batches`,
			method: "POST",
			body: {
				purchaseIds,
			},
		});
	},
};
