import { fetcher, idsToUri } from "@/utils/fetcher";

export default {
	async getListOfAssistances(page, size, sort, upcoming, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = page ? `&size=${size}` : "";
		const upcomingText = page ? `&upcoming=${upcoming}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances?${pageText + sizeText + upcomingText + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async getAssistances(ids) {
		const idsText = ids ? idsToUri(ids) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances?${idsText}`,
		});
		return { data, totalCount };
	},

	async getTargetTypes() {
		const { data: { data, totalCount } } = await fetcher({ uri: "assistances/targets" });
		return { data, totalCount };
	},

	async getAssistanceTypes() {
		const { data: { data, totalCount } } = await fetcher({ uri: "assistances/types" });
		return { data, totalCount };
	},

	async getAssistanceSelectionCriteriaTargets() {
		const { data: { data, totalCount } } = await fetcher({ uri: "selection-criteria/targets" });
		return { data, totalCount };
	},

	async getAssistanceSelectionCriteriaFields(targetCode) {
		const { data: { data, totalCount } } = await fetcher(

			{ uri: `selection-criteria/targets/${targetCode}/fields` },
		);
		return { data, totalCount };
	},

	async getAssistanceSelectionCriteriaConditions(targetCode, fieldCode) {
		const { data: { data, totalCount } } = await fetcher(

			{ uri: `selection-criteria/targets/${targetCode}/fields/${fieldCode}/conditions` },
		);
		return { data, totalCount };
	},

	async getListOfProjectAssistances(id, page, size, sort, search = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
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

	async getCommodities(ids) {
		const idsText = ids ? idsToUri(ids) : "";

		const { data: { data }, totalCount } = await fetcher({
			uri: `assistances/commodities?${idsText}`,
		});
		return { data, totalCount };
	},

	async getStatistics(ids) {
		const idsText = ids ? idsToUri(ids) : "";

		const { data: { data }, totalCount } = await fetcher({
			uri: `assistances/statistics?${idsText}`,
		});
		return { data, totalCount };
	},

	async getListOfBeneficiaries(id, page, size, sort, search = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances/${id}/beneficiaries?${pageText + sizeText + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async getListOfModalities() {
		const { data: { data, totalCount } } = await fetcher({
			uri: `modalities`,
		});
		return { data, totalCount };
	},

	async getListOfModalityTypes(code) {
		const { data: { data, totalCount } } = await fetcher({ uri: `modalities/${code}/types` });
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
