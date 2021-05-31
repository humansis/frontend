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

	async getSmartcardRedemptionPurchases(id) {
		const { data: { data, totalCount } } = await fetcher({ uri: `smartcard-redemption-batches/${id}/smartcard-purchases` });
		return { data, totalCount };
	},

	async printSmartcardBatches(id) {
		const { data } = await download({ uri: `smartcard-redemption-batches/${id}/exports` });
		return { data };
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
