import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfAssistances(page, size, sort, upcoming, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";
		const sortText = sort ? `&sort=${sort}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances?page=${page}&size=${size}&upcoming=${upcoming + sortText + fulltext}`,
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
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = page ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `projects/${id}/assistances?${pageText + sizeText + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async getDetailOfAssistance(id) {
		const { data } = await fetcher({
			uri: `assistances/${id}`,
		});
		return data;
	},

	async createAssistance(body) {
		const { data, status } = await fetcher({ uri: "assistances", method: "POST", body });
		return { data, status };
	},

	async getAssistanceCommodities(id) {
		const { data: { data }, totalCount } = await fetcher({
			uri: `assistances/${id}/commodities`,
		});
		return { data, totalCount };
	},

	async getListOfBeneficiaries(id, page, size, sort, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = page ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances/${id}/beneficiaries?${pageText + sizeText + sortText + fulltext}`,
		});
		return { data, totalCount };
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
