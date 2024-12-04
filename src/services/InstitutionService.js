import { download, fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfInstitutions({ page, size, sort, search, filters }) {
		return fetcher({
			uri: `institutions${queryBuilder({ page, size, sort, search, filters })}`,
		});
	},

	getShortListOfProjectInstitutions(id) {
		return fetcher({
			uri: `catalogs/projects/${id}/institutions`,
		});
	},

	createInstitution(body) {
		return fetcher({
			uri: "institutions",
			method: "POST",
			body,
		});
	},

	updateInstitution({ id, body }) {
		return fetcher({
			uri: `institutions/${id}`,
			method: "PUT",
			body,
		});
	},

	deleteInstitution(id) {
		return fetcher({
			uri: `institutions/${id}`,
			method: "DELETE",
		});
	},

	getListOfInstitutionTypes() {
		return fetcher({
			uri: "institutions/types",
		});
	},

	getInstitutionIdNames() {
		return fetcher({
			uri: "institution-id-numbers",
		});
	},

	exportInstitutions({ format, sort, filters }) {
		return download({
			uri: `institutions/exports${queryBuilder({ format, sort, filters })}`,
		});
	},
};
