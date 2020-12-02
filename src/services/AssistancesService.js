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

	async getListOfTargetTypesForAssistances() {
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

	async createAssistance(body) {
		const { data, status } = await fetcher({ uri: "assistances", method: "POST", body });
		return { data, status };
	},

	async removeAssistance(id) {
		console.log(id);
		return { data: {}, status: 204 };
	},

	async printAssistance(id) {
		console.log(id);
		return { data: {}, status: 200 };
	},

	async saveAssistance(body) {
		console.log(body);
		return { data: {}, status: 200 };
	},

	async updateAssistance(id, body) {
		console.log(id, body);
		return { data: {}, status: 200 };
	},
};
