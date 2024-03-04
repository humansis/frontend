import { download, fetcher } from "@/utils/fetcher";

export default {
	async getSmartCardPurchases() {
		const { data: { data, totalCount } } = await fetcher({ uri: `smartcard-purchases` });
		return { data, totalCount };
	},

	async getSmartCardRedemption(id) {
		const { data: { data, totalCount } } = await fetcher({ uri: `vendors/${id}/smartcard-redemption-candidates` });
		return { data, totalCount };
	},

	async getSmartcardRedemptionBatches(id) {
		const { data: { data, totalCount } } = await fetcher({ uri: `vendors/${id}/smartcard-redemption-batches` });
		return { data, totalCount };
	},

	getSmartcardRedemptionPurchases(id) {
		return fetcher({
			uri: `smartcard-redemption-batches/${id}/redemption-summaries`,
		});
	},

	async printSmartcardBatches(id) {
		return download({ uri: `smartcard-redemption-batches/${id}/exports` });
	},

	async legacyPrintSmartcardBatches(id) {
		return download({ uri: `smartcard-redemption-batches/${id}/legacy-exports` });
	},

	async redeemBatch(id, purchaseIds) {
		const { data } = await fetcher({
			uri: `vendors/${id}/smartcard-redemption-batches`,
			method: "POST",
			body: {
				purchaseIds,
			},
		});
		return { data };
	},
};
