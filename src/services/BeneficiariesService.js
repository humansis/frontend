import { download, fetcher, filtersToUri, idsToUri } from "@/utils/fetcher";
import exportConsts from "@/utils/exportConst";

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

	async getBeneficiaries(ids, param = null) {
		const idsText = ids ? idsToUri(ids, param) : "";

		const { data } = await fetcher({
			uri: `beneficiaries?${idsText}`,
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

	async getInstitutions(ids, param = null) {
		const idsText = ids ? idsToUri(ids, param) : "";

		const { data } = await fetcher({
			uri: `institutions?${idsText}`,
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

	async addOrRemoveBeneficiaryFromAssistance(assistanceId, target, body) {
		const { data, status } = await fetcher({
			uri: `assistances/${assistanceId}/assistances-${target}`,
			method: "PUT",
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
		{ exportType = exportConsts.TYPE.EXP_DEFAULT },
	) {
		const formatText = format ? `type=${format}` : "";
		let uri = `assistances/${assistanceId}/beneficiaries/exports?${formatText}`;

		if (exportType === exportConsts.TYPE.EXP_RAW) {
			uri = `assistances/${assistanceId}/beneficiaries/exports-raw?${formatText}`;
		}

		if (exportType === exportConsts.TYPE.EXP_BANK) {
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
