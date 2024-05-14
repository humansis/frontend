import { download, fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfDistributedItems({ page, size, sort, search, filters }) {
		return fetcher({
			uri: `distributed-items${queryBuilder({ page, size, sort, search, filters })}`,
		});
	},

	getListOfSmartcardPurchasedItems({ page, size, sort, search, filters }) {
		return fetcher({
			uri: `smartcard-purchased-items${queryBuilder({ page, size, sort, search, filters })}`,
		});
	},

	exportDistributions({ format, page, size, sort, search, filters }) {
		return download({
			uri: `distributed-items/exports${queryBuilder({ page, size, sort, search, filters, format })}`,
		});
	},

	exportSmartcardPurchasesItems({ format, page, size, sort, search, filters }) {
		return download({
			uri: `smartcard-purchased-items/exports${queryBuilder({ page, size, sort, search, filters, format })}`,
		});
	},

};
