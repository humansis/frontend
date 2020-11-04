import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfAssistances(page, size, sort, upcoming, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances?page=${page}&size=${size}&sort=${sort}&upcoming=${upcoming + fulltext}`,
		});
		return { data, totalCount };
	},

	async getListOfTargetsForAssistances() {
		const { data: { data, totalCount } } = await fetcher({ uri: "assistances/targets" });
		return { data, totalCount };
	},

	async getListOfTypesForAssistances() {
		const { data: { data, totalCount } } = await fetcher({ uri: "assistances/types" });
		return { data, totalCount };
	},

	async getListOfProjectAssistances(id, page, size, sort, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";
		const { data: { data, totalCount } } = await fetcher({
			uri: `projects/${id}/assistances?page=${page}&size=${size}&sort=${sort + fulltext}`,
		});
		return { data, totalCount };
	},
};
