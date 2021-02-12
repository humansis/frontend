import { fetcher } from "@/utils/fetcher";

export default {
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
