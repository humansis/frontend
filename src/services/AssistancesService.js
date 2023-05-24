import { download, fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getDefaultScoringType() {
		return { enabled: true, name: "Default", id: null, identifier: "Default" };
	},

	getListOfAssistances(page, size, sort, upcoming, search = null, filters = null) {
		return fetcher({
			uri: `assistances${queryBuilder({ page, size, sort, upcoming, search, filters })}`,
		});
	},

	getListOfProjectAssistancesByType(filters) {
		return fetcher({
			uri: `assistances${queryBuilder({ filters })}`,
		});
	},

	getAssistances(ids) {
		return fetcher({ uri: `assistances${queryBuilder({ ids })}` });
	},

	getTargetTypes(filters) {
		return fetcher({
			uri: `assistances/targets${queryBuilder({ filters })}`,
		});
	},

	getAssistanceTypes(filters) {
		return fetcher({
			uri: `assistances/types${queryBuilder({ filters })}`,
		});
	},

	getAssistanceSelectionCriteriaTargets() {
		return fetcher({ uri: "selection-criteria/targets" });
	},

	getAssistanceSelectionCriteriaFields(targetCode) {
		return fetcher({
			uri: `selection-criteria/targets/${targetCode}/fields`,
		});
	},

	getAssistanceSelectionCriteriaConditions(targetCode, fieldCode) {
		return fetcher({
			uri: `selection-criteria/targets/${targetCode}/fields/${fieldCode}/conditions`,
		});
	},

	getListOfProjectAssistances(id, page, size, sort, search = null, filters = null) {
		return fetcher({
			uri: `projects/${id}/assistances${queryBuilder({ page, size, sort, search, filters })}`,
		});
	},

	getDetailOfAssistance(id) {
		return fetcher({ uri: `assistances/${id}` });
	},

	getScoringTypes(page, size, filters = null) {
		return fetcher({
			uri: `scoring-blueprints${queryBuilder({ page, size, filters })}`,
		});
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

	updateScoring({ id, enabled }) {
		return fetcher({
			uri: `scoring-blueprints/${id}`,
			method: "PATCH",
			body: {
				enabled,
			},
		});
	},

	removeScoring(id) {
		return fetcher({
			uri: `scoring-blueprints/${id}`,
			method: "DELETE",
		});
	},

	downloadScoring(scoringId) {
		return download({ uri: `scoring-blueprints/${scoringId}/content` });
	},

	createAssistance(body) {
		return fetcher({
			uri: "assistances", method: "POST", body,
		});
	},

	calculationCommodities(body) {
		return fetcher({
			uri: "assistances/commodities", method: "POST", body,
		});
	},

	calculationOfBeneficiaries(body) {
		return fetcher({
			uri: "assistances/beneficiaries", method: "POST", body,
		});
	},

	calculationOfBeneficiariesScores(body) {
		return fetcher({
			uri: "assistances/vulnerability-scores", method: "POST", body, version: 2,
		});
	},

	getAssistanceCommodities(id) {
		return fetcher({ uri: `assistances/${id}/commodities` });
	},

	getCommodities(ids) {
		return fetcher({
			uri: `assistances/commodities${queryBuilder({ ids })}`,
		});
	},

	getStatistics(ids) {
		return fetcher({
			uri: `assistances/statistics${queryBuilder({ ids })}`,
		});
	},

	getAssistanceStatistics(assistanceId) {
		return fetcher({
			uri: `assistances/${assistanceId}/statistics`,
		});
	},

	getListOfBeneficiaries(id, page, size, sort, search = null) {
		return fetcher({
			uri: `assistances/${id}/assistances-beneficiaries${queryBuilder({ page, size, sort, search })}`,
		});
	},

	getListOfCommunities(id, page, size, sort, search = null) {
		return fetcher({
			uri: `assistances/${id}/assistances-communities${queryBuilder({ page, size, sort, search })}`,
		});
	},

	getListOfInstitutions(id, page, size, sort, search = null) {
		return fetcher({
			uri: `assistances/${id}/assistances-institutions${queryBuilder({ page, size, sort, search })}`,
		});
	},

	getReliefPackagesForAssistance(assistanceId, reliefPackageIds) {
		return fetcher({
			uri: `assistances/${assistanceId}/relief-packages${queryBuilder({ ids: reliefPackageIds })}`,
		});
	},

	updateReliefPackage(body) {
		return fetcher({
			uri: `assistances/relief-packages/distribute`,
			method: "PATCH",
			body,
		});
	},

	updateReliefPackagesWithNumberIds(id, body) {
		return fetcher({
			uri: `assistances/${id}/relief-packages/distribute`,
			method: "PATCH",
			body,
		});
	},

	getSmartCardDepositsForAssistance(smartcardDepositIds) {
		return fetcher({
			uri: `smartcard-deposits${queryBuilder({ ids: smartcardDepositIds })}`,
		});
	},

	getTransactionsForAssistance(transactionIds) {
		return fetcher({
			uri: `transactions${queryBuilder({ ids: transactionIds })}`,
		});
	},

	getTransactionStatuses() {
		return fetcher({ uri: "transactions/statuses" });
	},

	getBookletsForAssistance(bookletIds) {
		return fetcher({
			uri: `booklets${queryBuilder({ ids: bookletIds })}`,
		});
	},

	getBookletStatuses() {
		return fetcher({ uri: "booklets/statuses" });
	},

	assignBookletInAssistance(assistanceId, target, beneficiaryId, bookletCode) {
		return fetcher({
			uri: `assistances/${assistanceId}/${target}/${beneficiaryId}/booklets/${bookletCode}`,
			method: "PUT",
		});
	},

	sendVerificationEmailForTransactions(assistanceId) {
		return fetcher({
			uri: `assistances/${assistanceId}/transactions/emails`,
			method: "POST",
		});
	},

	createTransactionsForBeneficiaries(assistanceId, body) {
		return fetcher({
			uri: `assistances/${assistanceId}/transactions`, method: "POST", body,
		});
	},

	getListOfModalities() {
		return fetcher({ uri: `modalities` });
	},

	getListOfModalityTypes(code) {
		return fetcher({ uri: `modalities/${code}/types` });
	},

	getListOfAllModalityTypes() {
		return fetcher({ uri: `modalities/types` });
	},

	removeAssistance(id) {
		return fetcher({ uri: `assistances/${id}`, method: "DELETE" });
	},

	moveAssistance(assistanceId, originalProjectId, targetProjectId) {
		return fetcher({
			uri: `assistances/${assistanceId}/move`,
			method: "POST",
			body: {
				originalProjectId,
				targetProjectId,
			},
		});
	},

	updateAssistance({
		id,
		name,
		formattedDateDistribution,
		formattedDateExpiration,
		round,
		note,
		locationId,
	}) {
		return fetcher({
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
	},

	updateAssistanceStatusValidated({ assistanceId, validated }) {
		return fetcher({
			uri: `assistances/${assistanceId}`,
			method: "PATCH",
			body: {
				validated,
			},
		});
	},

	updateAssistanceNote({ assistanceId, note }) {
		return fetcher({
			uri: `assistances/${assistanceId}`,
			method: "PATCH",
			body: {
				note,
			},
		});
	},

	updateAssistanceToStatusCompleted({ assistanceId, completed }) {
		return fetcher({
			uri: `assistances/${assistanceId}`,
			method: "PATCH",
			body: {
				completed,
			},
		});
	},

	getSelectionCriteria(id) {
		return fetcher({
			uri: `assistances/${id}/selection-criteria`,
		});
	},

	exportAssistances(format, projectId, filters) {
		return download({
			uri: `projects/${projectId}/assistances/exports${queryBuilder({ format, filters })}`,
		});
	},

	exportVulnerabilityScores(format, body) {
		return download({
			uri: `assistances/vulnerability-scores/exports${queryBuilder({ format })}`,
			method: "POST",
			body,
		});
	},

	exportAssistance(format, assistanceId) {
		return download({
			uri: `assistances/${assistanceId}/exports${queryBuilder({ format })}`,
		});
	},
};
