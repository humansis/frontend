// TODO implement after transaction endpoint
export default {
	async getListOfTransactions() {
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
