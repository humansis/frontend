import { download, fetcher, idsToUri, filtersToUri } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getDefaultScoringType() {
		return { enabled: true, name: "Default", id: null, identifier: "Default" };
	},

	async getListOfAssistances(page, size, sort, upcoming, search = null, filter = null) {
		const fulltext = search ? `&fulltext=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const upcomingText = page ? `&upcoming=${upcoming}` : "";
		const filtersUri = filter ? filtersToUri(filter) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances?${pageText + sizeText + upcomingText + sortText + filtersUri + fulltext}`,
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

	async getListOfProjectAssistances(id, page, size, sort, search = null, filter = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const filtersUri = filter ? filtersToUri(filter) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `projects/${id}/assistances?${pageText + sizeText + sortText + fulltext + filtersUri}`,
		});
		return { data, totalCount };
	},

	async getDetailOfAssistance(id) {
		const { data } = await fetcher({
			uri: `assistances/${id}`,
		});
		return data;
	},

	async getScoringTypes(page, size, filter = null) {
		const query = [];

		if (page) { query.push(`page=${page}`); }
		if (size) { query.push(`size=${size}`); }
		if (filter) { query.push(filtersToUri(filter)); }

		const { data: { data, totalCount } } = await fetcher({
			uri: `scoring-blueprints?${query.join("&")}`,
		});
		return { data, totalCount };
	},

	async createScoring(body) {
		return new Promise((resolve, reject) => {
			const { name, note, dropFiles } = body;

			const fileBlob = new Blob([dropFiles[0]], { type: dropFiles[0].type });
			const reader = new FileReader();

			reader.readAsDataURL(fileBlob);
			reader.onload = () => {
				const base64Format = reader.result?.match(/data:.*?base64,(.*)$/)?.[1];

				fetcher({
					uri: `scoring-blueprints`,
					method: "POST",
					body: {
						name,
						note,
						content: base64Format,
					},
				}).then(({ status, message }) => {
					resolve({ status, message });
				}).catch((error) => {
					reject(error);
				});
			};
			reader.onerror = (error) => reject(error);
		});
	},

	async updateScoring({ id, enabled }) {
		const { data, status } = await fetcher({
			uri: `scoring-blueprints/${id}`,
			method: "PATCH",
			body: {
				enabled,
			},
		});
		return { data, status };
	},

	async removeScoring(id) {
		const { data, status } = await fetcher({
			uri: `scoring-blueprints/${id}`,
			method: "DELETE",
		});
		return { data, status };
	},

	async downloadScoring(scoringId) {
		return download({ uri: `scoring-blueprints/${scoringId}/content` });
	},

	async createAssistance(body) {
		const { data, status, message } = await fetcher({ uri: "assistances", method: "POST", body });
		return { data, status, message };
	},

	async calculationCommodities(body) {
		const { data, status } = await fetcher({
			uri: "assistances/commodities", method: "POST", body,
		});
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
			uri: "assistances/vulnerability-scores", method: "POST", body, version: 2,
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

	getOptimizedListOfBeneficiaries(id, page, size, sort, search = null, filters = null) {
		let fulltext = "";

		if (search.field.length && search.phrase.length) {
			fulltext = `&filter[${search.field}]=${search.phrase}`;
		} else if (search.length) {
			fulltext = `&filter[fulltext}]=${search}`;
		}

		return fetcher({
			uri: `assistances/${id}/assistances-beneficiaries${
				queryBuilder({ page, sort, size, filters }) + fulltext
			}`,
			version: 2,
		});
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

	getListOfInstitutions(id, page, size, sort, filters) {
		return fetcher({
			uri: `assistances/${id}/assistances-institutions${queryBuilder({ page, sort, size, filters })}`,
			version: 2,
		});
	},

	async getReliefPackagesForAssistance(assistanceId, reliefPackageIds) {
		const idsText = reliefPackageIds ? idsToUri(reliefPackageIds) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `assistances/${assistanceId}/relief-packages?${idsText}`,
		});
		return { data, totalCount };
	},

	async updateReliefPackage(body) {
		const { data, status } = await fetcher({
			uri: `assistances/relief-packages/distribute`,
			method: "PATCH",
			body,
		});
		return { data, status };
	},

	async updateReliefPackagesWithNumberIds(id, body) {
		const { data, status, message } = await fetcher({
			uri: `assistances/${id}/relief-packages/distribute`,
			method: "PATCH",
			body,
		});
		return { data, status, message };
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

	async moveAssistance(assistanceId, originalProjectId, targetProjectId) {
		const { status, message } = await fetcher({
			uri: `assistances/${assistanceId}/move`,
			method: "POST",
			body: {
				originalProjectId,
				targetProjectId,
			},
		});
		return { status, message };
	},

	async updateAssistance({
		id,
		name,
		formattedDateDistribution,
		formattedDateExpiration,
		round,
		note,
		locationId,
	}) {
		const { data, status } = await fetcher({
			uri: `assistances/${id}`,
			method: "PATCH",
			body: {
				name,
				...(formattedDateDistribution && { dateDistribution: formattedDateDistribution }),
				...(formattedDateExpiration && { dateExpiration: formattedDateExpiration }),
				round,
				note,
				locationId,
			},
		});
		return { data, status };
	},

	async updateAssistanceStatusValidated({ assistanceId, validated }) {
		const { data, status } = await fetcher({
			uri: `assistances/${assistanceId}`,
			method: "PATCH",
			body: {
				validated,
			},
		});
		return { data, status };
	},

	async updateAssistanceNote({ assistanceId, note }) {
		const { data, status } = await fetcher({
			uri: `assistances/${assistanceId}`,
			method: "PATCH",
			body: {
				note,
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
		const { data: { data, totalCount }, message } = await fetcher({
			uri: `assistances/${id}/selection-criteria`,
		});
		return { data, totalCount, message };
	},

	async exportAssistances(format, projectId, filters) {
		const formatText = format ? `type=${format}` : "";
		const filtersUri = filters ? filtersToUri(filters) : "";

		return download({
			uri: `projects/${projectId}/assistances/exports?${formatText + filtersUri}`,
		});
	},

	async exportVulnerabilityScores(format, body) {
		const formatText = format ? `type=${format}` : "";

		return download({
			uri: `assistances/vulnerability-scores/exports?${formatText}`,
			method: "POST",
			body,
		});
	},

	async exportAssistance(format, assistanceId) {
		const formatText = format ? `type=${format}` : "";

		return download({ uri: `assistances/${assistanceId}/exports?${formatText}` });
	},
};
