/* eslint-disable no-unused-vars */
// TODO implement after transaction endpoint
import { fetcher, filtersToUri } from "@/utils/fetcher";

export default {
	async getListOfTransactions(page, size, sort, search, filters) {
		const fulltext = search ? `&fulltext=${search}` : "";
		const filtersUri = filters ? filtersToUri(filters) : "";

		// const { data: { data, totalCount } } = await fetcher({
		// 	uri: `transactions?page=${page}&size=${size}&sort=${sort + fulltext + filtersUri}`,
		// });

		// return { data, totalCount };
		return {
			data: [
				{
					beneficiary: "Beneficiary One",
					type: "Distribution",
					item: "Smartcard",
					value: "100 $",
				},
				{
					beneficiary: "Beneficiary Two",
					type: "Purchase",
					item: "Rice",
					value: "10 pcs",
				},
			],
			totalCount: 2,
		};
	},

};
