import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfInstitutions(page, size, sort, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `institutions?page=${page}&size=${size}&sort=${sort + fulltext}`,
		});
		return { data, totalCount };
	},

	async createInstitution(body) {
		const { data, status } = await fetcher({ uri: "institutions", method: "POST", body });
		return { data, status };
	},

	async getDetailOfInstitution(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `institutions/${id}`,
		});
		return { data, totalCount };
	},

	async updateInstitution(id, body) {
		const { data, status } = await fetcher({
			uri: `institutions/${id}`, method: "PUT", body,
		});
		return { data, status };
	},

	async removeInstitution(id) {
		const { data, status } = await fetcher({
			uri: `institutions/${id}`, method: "DELETE",
		});
		return { data, status };
	},

	async getListOfInstitutionTypes() {
		const { data: { data, totalCount } } = await fetcher({ uri: "institutions/types" });
		return { data, totalCount };
	},
};
