import { fetcher, filtersToUri, idsToUri } from "@/utils/fetcher";

export default {
	async getListOfHouseholds(page, size, sort, search = null, filters = null) {
		const fulltext = search ? `&fulltext=${search}` : "";
		const filtersUri = filters ? filtersToUri(filters) : "";
		const sortText = sort ? `&sort=${sort}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `households?page=${page}&size=${size + sortText + fulltext + filtersUri}`,
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

	async getBeneficiaries(ids) {
		const idsText = ids ? idsToUri(ids) : "";

		const { data } = await fetcher({
			uri: `beneficiaries?${idsText}`,
		});
		return data;
	},

	async getPhone(id) {
		const { data } = await fetcher({
			uri: `beneficiaries/phones/${id}`,
		});
		return data;
	},

	async getNationalId(id) {
		const { data } = await fetcher({
			uri: `beneficiaries/national-ids/${id}`,
		});
		return data;
	},

	async getNationalIds(ids, param = null) {
		const idsText = ids ? idsToUri(ids, param) : "";

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
};
