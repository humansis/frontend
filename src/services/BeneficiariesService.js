import { download, fetcher, filtersToUri, idsToUri } from "@/utils/fetcher";
import { EXPORT } from "@/consts";
import { queryBuilder } from "@/utils/helpers";

export default {
	async getListOfHouseholds(page, size, sort, search = null, filters = null, ids = null) {
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const filtersUri = filters ? filtersToUri(filters) : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const idsText = ids ? idsToUri(ids) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `households?${pageText + sizeText + sortText + fulltext + filtersUri + idsText}`,
		});

		return { data, totalCount };
	},

	getListOfHouseholdByBulkSearch(page, size, sort, body) {
		return fetcher({
			uri: `households/search${queryBuilder({ page, size, sort })}`,
			method: "POST",
			body,
		});
	},

	async createHousehold(body) {
		const { data, status } = await fetcher({
			uri: "households",
			method: "POST",
			body,
		});
		return { data, status };
	},

	async getDetailOfHousehold(id) {
		const { data } = await fetcher({
			uri: `households/${id}`,
		});
		return data;
	},

	async updateHousehold(id, body) {
		const { data, status } = await fetcher({
			uri: `households/${id}`, method: "PUT", body,
		});
		return { data, status };
	},

	async removeHousehold(id) {
		const { data, status } = await fetcher({
			uri: `households/${id}`, method: "DELETE",
		});
		return { data, status };
	},

	async getListOfTypesOfNationalIds() {
		const { data: { data, totalCount } } = await fetcher({
			uri: "beneficiaries/national-ids/types",
		});
		return { data, totalCount };
	},

	async getListOfVulnerabilities() {
		const { data: { data, totalCount } } = await fetcher({
			uri: "beneficiaries/vulnerability-criteria",
		});
		return { data, totalCount };
	},

	async getListOfResidenceStatuses() {
		const { data: { data, totalCount } } = await fetcher({
			uri: "beneficiaries/residency-statuses",
		});
		return { data, totalCount };
	},

	async getListOfTypesOfPhones() {
		const { data: { data, totalCount } } = await fetcher({
			uri: "beneficiaries/phones/types",
		});
		return { data, totalCount };
	},

	async getListOfLivelihoods() {
		const { data: { data, totalCount } } = await fetcher({
			uri: "households/livelihoods",
		});
		return { data, totalCount };
	},

	async getListOfAssets() {
		const { data: { data, totalCount } } = await fetcher({
			uri: "households/assets",
		});
		return { data, totalCount };
	},

	async getListOfShelterStatuses() {
		const { data: { data, totalCount } } = await fetcher({
			uri: "households/shelter-statuses",
		});
		return { data, totalCount };
	},

	async getListOfLocationsTypes() {
		const { data: { data, totalCount } } = await fetcher({
			uri: "households/locations/types",
		});
		return { data, totalCount };
	},

	async getBeneficiary(id) {
		const { data } = await fetcher({
			uri: `beneficiaries/${id}`,
		});
		return data;
	},

	async getBeneficiaries(ids, filters) {
		const idsText = ids ? idsToUri(ids) : "";
		const filtersUri = filters ? filtersToUri(filters) : "";

		const { data } = await fetcher({
			uri: `beneficiaries?${idsText + filtersUri}`,
		});
		return data;
	},

	async getCommunities(ids, param = null) {
		const idsText = ids ? idsToUri(ids, param) : "";

		const { data } = await fetcher({
			uri: `communities?${idsText}`,
		});
		return data;
	},

	async getInstitutions(ids) {
		const { data } = await fetcher({
			uri: `institutions${queryBuilder({ ids })}`,
		});
		return data;
	},

	async getInstitution(id, filters) {
		const { data } = await fetcher({
			uri: `institutions/${id}${queryBuilder({ filters })}`,
		});
		return data;
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

	async addBeneficiaryToAssistance(assistanceId, target, body, endpointVersion = 1) {
		const { data, status } = await fetcher({
			uri: `assistances/${assistanceId}/assistances-${target}`,
			method: "PUT",
			body,
			version: endpointVersion,
		});
		return { data, status };
	},

	async removeBeneficiaryFromAssistance(assistanceId, target, body, endpointVersion = 1) {
		const { data, status } = await fetcher({
			uri: `assistances/${assistanceId}/assistances-${target}`,
			method: "DELETE",
			body,
			version: endpointVersion,
		});
		return { data, status };
	},

	async getListOfHouseholdPurchases(id, page, size, sort) {
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `households/${id}/smartcard-purchased-items?${sortText + pageText + sizeText}`,
		});
		return { data, totalCount };
	},

	async getListOfDistributedItems(id, page, size, sort) {
		const query = [];

		if (sort) { query.push(`sort[]=${sort}`); }
		if (page) { query.push(`page=${page}`); }
		if (size) { query.push(`size=${size}`); }

		const { data: { data, totalCount } } = await fetcher({
			uri: `households/${id}/distributed-items?${query.join("&")}`,
			version: 2,
		});
		return { data, totalCount };
	},

	exportHouseholds(format, ids, filters) {
		const idsText = ids ? idsToUri(ids) : "";
		const formatText = format ? `type=${format}` : "";
		const filtersUri = filters ? filtersToUri(filters) : "";

		return download({ uri: `households/exports?${formatText + idsText + filtersUri}` });
	},

	exportBulkSearchHouseholds(format, ids, body) {
		return download({
			uri: `households/exports${queryBuilder({ format, ids })}`,
			method: "POST",
			body,
		});
	},

	async exportAssistanceBeneficiaries(
		format,
		assistanceId,
		search,
		{ exportType },
	) {
		const formatText = `type=${format}`;
		const fulltext = search ? `&fulltext=${search}` : "";
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

		if (exportType === EXPORT.HOUSEHOLDS) {
			uri = `assistances/${assistanceId}/households/exports
				?${formatText + fulltext}`;
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

	getSmartCard(id) {
		return fetcher({ uri: `beneficiaries/${id}/smartcards` });
	},
};
