// TODO Not used for now
export default {
	async getListOfVouchers() {
		return {
			data: [
				{
					who: "Someone",
					where: "Somewhere",
					what: "Somewhat",
					status: "OK",
				},
				{
					who: "Someone Two",
					where: "Somewhere Two",
					what: "Somewhat Two",
					status: "Not OK",
				},
			],
			totalCount: 2,
		};
	},
};
