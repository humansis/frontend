import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfDonors() {
		const { data: { data, totalCount } } = await fetcher({ uri: "donors" });
		return { data, totalCount };
	},

	async createDonor(body) {
		const { data, status } = await fetcher({ uri: "donors", method: "POST", body });
		return { data, status };
	},

	async updateDonor(id, body) {
		const { data, status } = await fetcher({ uri: `donors/${id}`, method: "PUT", body });
		return { data, status };
	},

	async deleteDonor(id) {
		const { data, status } = await fetcher({ uri: `donors/${id}`, method: "DELETE" });
		return { data, status };
	},

	async getDetailOfDonor(id) {
		const { data: { data, totalCount } } = await fetcher({ uri: `donors/${id}` });
		return { data, totalCount };
	},

	async getDetailOfModality(id) {
		const { data: { data, totalCount } } = await fetcher({ uri: `modalities/${id}` });
		return { data, totalCount };
	},

	async getListOfModalities(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `modalities?id[]=${id}`,
		});
		return { data, totalCount };
	},

	async getSummariesForHomePage(code) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `summaries?code[]=${code}`,
		});
		return { data, totalCount };
	},
};
