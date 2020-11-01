import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfHouseholds(page, size, sort, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";

		// TODO parsing filters

		const { data: { data, totalCount } } = await fetcher({
			uri: `households?page=${page}&size=${size}&sort=${sort + fulltext}`,
		});
		return { data, totalCount };
	},

	async createHousehold(body) {
		const { data, status } = await fetcher({ uri: "households", method: "POST", body });
		return { data, status };
	},

	async getDetailOfHousehold(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `households/${id}`,
		});
		return { data, totalCount };
	},

	async updateHousehold(id, body) {
		const { data, status } = await fetcher({
			uri: `households/${id}`, method: "PUT", body,
		});
		return { data, status };
	},

	async removeHousehold(id) {
		const { data, status } = await fetcher({
			uri: `households/${id}`, method: "REMOVE",
		});
		return { data, status };
	},

	async getListOfTypesOfNationalIds() {
		const { data: { data, totalCount } } = await fetcher({
			uri: "beneficiaries/national-ids/types",
		});
		return { data, totalCount };
	},

	async getListOfTypesOfPhones() {
		const { data: { data, totalCount } } = await fetcher({ uri: "beneficiaries/phones/types" });
		return { data, totalCount };
	},

	async getListOfLivelihoods() {
		const { data: { data, totalCount } } = await fetcher({ uri: "households/livelihoods" });
		return { data, totalCount };
	},

	async getListOfAssets() {
		const { data: { data, totalCount } } = await fetcher({ uri: "households/assets" });
		return { data, totalCount };
	},

	async getListOfShelterStatuses() {
		const { data: { data, totalCount } } = await fetcher({
			uri: "households/shelter-statuses",
		});
		return { data, totalCount };
	},

	async getListOfLocationsTypes() {
		const { data: { data, totalCount } } = await fetcher({ uri: "households/locations/types" });
		return { data, totalCount };
	},
};
