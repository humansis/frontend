import { fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	async getListOfInstitutions(page, size, sort, search = null, filters = null) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `institutions${queryBuilder({ page, size, sort, search, filters })}`,
		});
		return { data, totalCount };
	},

	createInstitution(body) {
		return fetcher({ uri: "institutions", method: "POST", body });
	},

	async getDetailOfInstitution(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `institutions/${id}`,
		});
		return { data, totalCount };
	},

	updateInstitution(id, body) {
		return fetcher({
			uri: `institutions/${id}`, method: "PUT", body,
		});
	},

	deleteInstitution(id) {
		return fetcher({
			uri: `institutions/${id}`, method: "DELETE",
		});
	},

	async getListOfInstitutionTypes() {
		const { data: { data, totalCount } } = await fetcher({ uri: "institutions/types" });
		return { data, totalCount };
	},

	getInstitutionIdNames() {
		return fetcher({ uri: "institution-id-numbers" });
	},
};
