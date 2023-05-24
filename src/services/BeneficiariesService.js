import { download, fetcher, filtersToUri, idsToUri } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";
import { EXPORT } from "@/consts";

export default {
	getListOfHouseholds(page, size, sort, search = null, filters = null, ids = null) {
		return fetcher({
			uri: `households${queryBuilder({ page, size, sort, search, filters, ids })}`,
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
		return fetcher({ uri: `households/${id}` });
	},

	updateHousehold(id, body) {
		return fetcher({
			uri: `households/${id}`, method: "PUT", body,
		});
	},

	removeHousehold(id) {
		return fetcher({
			uri: `households/${id}`, method: "DELETE",
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

	getBeneficiaries(ids) {
		return fetcher({
			uri: `beneficiaries${queryBuilder({ ids })}`,
		});
	},

	getCommunities(ids) {
		return fetcher({
			uri: `communities${queryBuilder({ ids })}`,
		});
	},

	getInstitutions(ids) {
		return fetcher({
			uri: `institutions${queryBuilder({ ids })}`,
		});
	},

	async getPhone(id) {
		if (!id) return null;
		const { data } = await fetcher({
			uri: `beneficiaries/phones/${id}`,
		});
		return data;
	},

	async getNationalId(id) {
		if (!id) return null;
		const { data } = await fetcher({
			uri: `beneficiaries/national-ids/${id}`,
		});
		return data;
	},

	async getNationalIds(ids, param = null) {
		const idsText = ids ? idsToUri(ids, param) : "";

		if (!idsText) return [];

		const { data } = await fetcher({
			uri: `beneficiaries/national-ids?${idsText}`,
		});
		return data;
	},

	async getPhones(ids) {
		const idsText = ids ? idsToUri(ids) : "";

		const { data } = await fetcher({
			uri: `beneficiaries/phones?${idsText}`,
		});
		return data;
	},

	async getListOfReferralTypes() {
		const { data } = await fetcher({
			uri: "households/referrals/types",
		});
		return data;
	},

	async getSupportReceivedTypes() {
		const { data } = await fetcher({
			uri: "households/support-received-types",
		});
		return data;
	},

	async getBeneficiariesByProject(id, target, assistanceId) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `projects/${id}/targets/${target}/beneficiaries?filter[excludeAssistance]=${assistanceId}`,
		});
		return { data, totalCount };
	},

	async addHouseholdsToProject(projectId, ids) {
		const { data } = await fetcher({
			uri: `projects/${projectId}/households`,
			method: "PUT",
			body: {
				householdIds: ids,
			},
		});
		return data;
	},

	async addBeneficiaryToAssistance(assistanceId, target, body) {
		const { data, status } = await fetcher({
			uri: `assistances/${assistanceId}/assistances-${target}`,
			method: "PUT",
			body,
		});
		return { data, status };
	},

	async removeBeneficiaryFromAssistance(assistanceId, target, body) {
		const { data, status } = await fetcher({
			uri: `assistances/${assistanceId}/assistances-${target}`,
			method: "DELETE",
			body,
		});
		return { data, status };
	},

	async getListOfHouseholdPurchases(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `households/${id}/purchased-items`,
		});
		return { data, totalCount };
	},

	async getListOfDistributedItems(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `households/${id}/distributed-items`,
		});
		return { data, totalCount };
	},

	async exportHouseholds(format, ids, filters) {
		const idsText = ids ? idsToUri(ids) : "";
		const formatText = format ? `type=${format}` : "";
		const filtersUri = filters ? filtersToUri(filters) : "";

		return download({ uri: `households/exports?${formatText + idsText + filtersUri}` });
	},

	async exportAssistanceBeneficiaries(
		format,
		assistanceId,
		{ exportType },
	) {
		const formatText = format ? `type=${format}` : "";
		let uri;

		if (exportType === EXPORT.DISTRIBUTION_LIST) {
			uri = `assistances/${assistanceId}/beneficiaries/exports?${formatText}`;
		}

		if (exportType === EXPORT.LIST_OF_BENEFICIARIES) {
			uri = `assistances/${assistanceId}/beneficiaries/exports-raw?${formatText}`;
		}

		if (exportType === EXPORT.BANK_DISTRIBUTION_LIST) {
			uri = `assistances/${assistanceId}/bank-report/exports?${formatText}`;
		}

		return download({ uri });
	},

	async exportBeneficiaries(format, ids, param = null) {
		const formatText = format ? `type=${format}` : "";
		const idsText = ids ? idsToUri(ids, param) : "";

		return download({ uri: `beneficiaries/exports?${formatText + idsText}` });
	},

	async getBeneficiaryTypes() {
		const { data } = await fetcher({
			uri: "beneficiaries/types",
		});
		return data;
	},
};
