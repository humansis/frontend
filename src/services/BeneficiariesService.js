import { download, fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";
import { EXPORT } from "@/consts";

export default {
	getListOfHouseholds({ page, size, sort, search, filters, ids }) {
		return fetcher({
			uri: `households${queryBuilder({ page, size, sort, search, filters, ids })}`,
		});
	},

	getListOfHouseholdByBulkSearch({ page, size, sort, body }) {
		return fetcher({
			uri: `households/search${queryBuilder({ page, size, sort })}`,
			method: "POST",
			body,
		});
	},

	createHousehold(body) {
		return fetcher({
			uri: "households",
			method: "POST",
			body,
		});
	},

	getDetailOfHousehold(id) {
		return fetcher({
			uri: `households/${id}`,
		});
	},

	updateHousehold({ id, body }) {
		return fetcher({
			uri: `households/${id}`,
			method: "PUT",
			body,
		});
	},

	removeHousehold(id) {
		return fetcher({
			uri: `households/${id}`,
			method: "DELETE",
		});
	},

	getListOfTypesOfNationalIds() {
		return fetcher({
			uri: "beneficiaries/national-ids/types",
		});
	},

	getListOfVulnerabilities() {
		return fetcher({
			uri: "beneficiaries/vulnerability-criteria",
		});
	},

	getListOfResidenceStatuses() {
		return fetcher({
			uri: "beneficiaries/residency-statuses",
		});
	},

	getListOfTypesOfPhones() {
		return fetcher({
			uri: "beneficiaries/phones/types",
		});
	},

	getListOfLivelihoods() {
		return fetcher({
			uri: "households/livelihoods",
		});
	},

	getListOfAssets() {
		return fetcher({
			uri: "households/assets",
		});
	},

	getListOfShelterStatuses() {
		return fetcher({
			uri: "households/shelter-statuses",
		});
	},

	getListOfLocationsTypes() {
		return fetcher({
			uri: "households/locations/types",
		});
	},

	getBeneficiary(id) {
		return fetcher({
			uri: `beneficiaries/${id}`,
		});
	},

	getBeneficiaries({ ids, filters }) {
		return fetcher({
			uri: `beneficiaries${queryBuilder({ ids, filters })}`,
		});
	},

	getInstitutions({ ids, filters }) {
		return fetcher({
			uri: `institutions${queryBuilder({ ids, filters })}`,
		});
	},

	getInstitution({ id, filters }) {
		return fetcher({
			uri: `institutions/${id}${queryBuilder({ filters })}`,
		});
	},

	getListOfReferralTypes() {
		return fetcher({
			uri: "households/referrals/types",
		});
	},

	getSupportReceivedTypes() {
		return fetcher({
			uri: "households/support-received-types",
		});
	},

	getBeneficiariesByProject({ id, target, filters }) {
		return fetcher({
			uri: `projects/${id}/targets/${target}/beneficiaries${queryBuilder({ filters })}`,
		});
	},

	addHouseholdsToProject({ projectId, ids }) {
		return fetcher({
			uri: `projects/${projectId}/households`,
			method: "PUT",
			body: {
				householdIds: ids,
			},
		});
	},

	addBeneficiaryToAssistance({ assistanceId, target, body, endpointVersion = 1 }) {
		return fetcher({
			uri: `assistances/${assistanceId}/assistances-${target}`,
			method: "PUT",
			body,
			version: endpointVersion,
		});
	},

	removeBeneficiaryFromAssistance({ assistanceId, target, body, endpointVersion = 1 }) {
		return fetcher({
			uri: `assistances/${assistanceId}/assistances-${target}`,
			method: "DELETE",
			body,
			version: endpointVersion,
		});
	},

	getListOfHouseholdPurchases({ id, page, size, sort }) {
		return fetcher({
			uri: `households/${id}/smartcard-purchased-items${queryBuilder({ page, size, sort })}`,
		});
	},

	getListOfDistributedItems({ id, page, size, sort }) {
		return fetcher({
			uri: `households/${id}/distributed-items${queryBuilder({ page, size, sort })}`,
			version: 2,
		});
	},

	exportHouseholds({ format, ids, filters, sort }) {
		return download({
			uri: `households/exports${queryBuilder({ format, ids, filters, sort })}`,
		});
	},

	exportBulkSearchHouseholds({ format, ids, body }) {
		return download({
			uri: `households/exports${queryBuilder({ format, ids })}`,
			method: "POST",
			body,
		});
	},

	exportAssistanceBeneficiaries({
		format,
		assistanceId,
		search,
		exportType,
		sort,
	}) {
		let uri;

		if (exportType === EXPORT.DISTRIBUTION_LIST) {
			uri = `assistances/${assistanceId}/beneficiaries/exports${queryBuilder({ format })}`;
		}

		if (exportType === EXPORT.LIST_OF_BENEFICIARIES) {
			uri = `assistances/${assistanceId}/beneficiaries/exports-raw${queryBuilder({ format, sort })}`;
		}

		if (exportType === EXPORT.BANK_DISTRIBUTION_LIST) {
			uri = `assistances/${assistanceId}/bank-report/exports${queryBuilder({ format })}`;
		}

		if (exportType === EXPORT.HOUSEHOLDS) {
			uri = `assistances/${assistanceId}/households/exports
				${queryBuilder({ format, search, sort })}`;
		}

		return download({ uri });
	},

	exportBeneficiaries({ format, ids, idsParam }) {
		return download({
			uri: `beneficiaries/exports${queryBuilder({ format, ids, idsParam })}`,
		});
	},

	getBnfFile3ExportStatistics(bnfFile3Id) {
		return fetcher({
			uri: `exports/${bnfFile3Id}`,
		});
	},

	recalculateReliefPackages(id) {
		return fetcher({
			uri: `assistances/${id}/recalculate`,
			method: "POST",
		});
	},

	exportBnf3File({ format, bnfFile3Id }) {
		return download({
			uri: `exports/${bnfFile3Id}/content${queryBuilder({ format })}`,
		});
	},

	getBeneficiaryTypes() {
		return fetcher({
			uri: "beneficiaries/types",
		});
	},

	getSmartCard(id) {
		return fetcher({
			uri: `beneficiaries/${id}/smartcards`,
		});
	},
};
