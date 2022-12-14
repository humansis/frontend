import { download, fetcher, idsToUri } from "@/utils/fetcher";

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

	async getListOfProjectAssistancesByType(type, projectId = null) {
		const projectText = projectId ? `&filter[projects][]=${projectId}` : "";
		const typeText = projectId ? `&filter[type]=${type}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances?${projectText + typeText}`,
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

	async getTargetTypes(type) {
		const filter = type ? `&filter[type]=${type}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances/targets?${filter}`,
		});
		return { data, totalCount };
	},

	async getAssistanceTypes(subsector) {
		const filter = subsector ? `&filter[subsector]=${subsector}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances/types?${filter}`,
		});
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

	async calculationOfBeneficiaries(body) {
		const { data, status } = await fetcher({
			uri: "assistances/beneficiaries", method: "POST", body,
		});
		return { data, status };
	},

	async calculationOfBeneficiariesScores(body) {
		const { data, status } = await fetcher({
			uri: "assistances/vulnerability-scores", method: "POST", body,
		});
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

	async getAssistanceStatistics(assistanceId) {
		const { data } = await fetcher({
			uri: `assistances/${assistanceId}/statistics`,
		});

		return data;
	},

	async getListOfBeneficiaries(id, page, size, sort, search = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances/${id}/assistances-beneficiaries?${pageText + sizeText + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async getListOfCommunities(id, page, size, sort, search = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances/${id}/assistances-communities?${pageText + sizeText + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async getListOfInstitutions(id, page, size, sort, search = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances/${id}/assistances-institutions?${pageText + sizeText + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async getGeneralReliefItemsForAssistance(generalReliefItemIds) {
		const idsText = generalReliefItemIds ? idsToUri(generalReliefItemIds) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `general-relief-items?${idsText}`,
			version: 2,
		});
		return { data, totalCount };
	},

	async updateGeneralReliefItem(id, value, dateOfDistribution) {
		const { data, status } = await fetcher({
			uri: `general-relief-items/${id}`,
			method: "PATCH",
			body: {
				distributed: value,
				dateOfDistribution,
			},
		});
		return { data, status };
	},

	async getSmartCardDepositsForAssistance(smartcardDepositIds) {
		const idsText = smartcardDepositIds ? idsToUri(smartcardDepositIds) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `smartcard-deposits?${idsText}`,
		});
		return { data, totalCount };
	},

	async getTransactionsForAssistance(transactionIds) {
		const idsText = transactionIds ? idsToUri(transactionIds) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `transactions?${idsText}`,
		});
		return { data, totalCount };
	},

	async getTransactionStatuses() {
		const { data: { data, totalCount } } = await fetcher({
			uri: "transactions/statuses",
		});
		return { data, totalCount };
	},

	async getBookletsForAssistance(bookletIds) {
		const idsText = bookletIds ? idsToUri(bookletIds) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `booklets?${idsText}`,
		});
		return { data, totalCount };
	},

	async getBookletStatuses() {
		const { data: { data, totalCount } } = await fetcher({
			uri: "booklets/statuses",
		});
		return { data, totalCount };
	},

	async assignBookletInAssistance(assistanceId, target, beneficiaryId, bookletCode) {
		const { data, status } = await fetcher({
			uri: `assistances/${assistanceId}/${target}/${beneficiaryId}/booklets/${bookletCode}`,
			method: "PUT",
		});
		return { data, status };
	},

	async sendVerificationEmailForTransactions(assistanceId) {
		const { data, status } = await fetcher({
			uri: `assistances/${assistanceId}/transactions/emails`, method: "POST",
		});
		return { data, status };
	},

	async createTransactionsForBeneficiaries(assistanceId, body) {
		const { data, status } = await fetcher({
			uri: `assistances/${assistanceId}/transactions`, method: "POST", body,
		});
		return { data, status };
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

	async getListOfAllModalityTypes() {
		const { data: { data, totalCount } } = await fetcher({ uri: `modalities/types` });
		return { data, totalCount };
	},

	async removeAssistance(id) {
		const { data, status } = await fetcher({ uri: `assistances/${id}`, method: "DELETE" });
		return { data, status };
	},

	async updateAssistanceDateOfDistribution(id, date) {
		const { data, status } = await fetcher({
			uri: `assistances/${id}`,
			method: "PATCH",
			body: {
				dateDistribution: date,
			},
		});
		return { data, status };
	},

	async updateAssistanceToStatusValidated({ assistanceId, validated }) {
		const { data, status } = await fetcher({
			uri: `assistances/${assistanceId}`,
			method: "PATCH",
			body: {
				validated,
			},
		});
		return { data, status };
	},

	async updateAssistanceToStatusCompleted({ assistanceId, completed }) {
		const { data, status } = await fetcher({
			uri: `assistances/${assistanceId}`,
			method: "PATCH",
			body: {
				completed,
			},
		});
		return { data, status };
	},

	async getSelectionCriteria(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances/${id}/selection-criteria`,
		});
		return { data, totalCount };
	},

	async exportAssistances(format, projectId) {
		const formatText = format ? `type=${format}` : "";

		const { data } = await download({ uri: `projects/${projectId}/assistances/exports?${formatText}` });
		return { data };
	},

	async exportAssistance(format, assistanceId) {
		const formatText = format ? `type=${format}` : "";

		const { data } = await download({ uri: `assistances/${assistanceId}/exports?${formatText}` });
		return { data };
	},
};
