import { download, fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfProjects({ page, size, sort, ids, search }) {
		return fetcher({
			uri: `projects${queryBuilder({ page, size, sort, ids, search })}`,
		});
	},

	getShortListOfProjects(ids) {
		return fetcher({
			uri: `catalogs/projects${queryBuilder({ ids })}`,
		});
	},

	getShortListOfAllProjects() {
		return fetcher({
			uri: "catalogs/projects/all",
		});
	},

	createProject(body) {
		return fetcher({
			uri: "projects",
			method: "POST",
			body,
		});
	},

	getDetailOfProject(id) {
		return fetcher({
			uri: `projects/${id}`,
		});
	},

	updateProject({ id, body }) {
		return fetcher({
			uri: `projects/${id}`,
			method: "PUT",
			body,
		});
	},

	deleteProject(id) {
		return fetcher({
			uri: `projects/${id}`,
			method: "DELETE",
		});
	},

	exportProjects({ format, filters }) {
		return download({
			uri: `projects/exports${queryBuilder({ format, filters })}`,
		});
	},
};
