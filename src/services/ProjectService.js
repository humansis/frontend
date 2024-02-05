import { download, fetcher, filtersToUri, idsToUri } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	async getListOfProjects(page, size, sort, ids, search = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const idsText = ids ? idsToUri(ids) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `projects?${pageText + sizeText + sortText + fulltext + idsText}`,
		});
		return { data, totalCount };
	},

	getShortListOfProjects(ids) {
		return fetcher({
			uri: `catalogs/projects${queryBuilder({ ids })}`,
		});
	},

	createProject(body) {
		return fetcher({ uri: "projects", method: "POST", body });
	},

	async getDetailOfProject(id) {
		const { data } = await fetcher({
			uri: `projects/${id}`,
		});
		return { data };
	},

	updateProject(id, body) {
		return fetcher({
			uri: `projects/${id}`, method: "PUT", body,
		});
	},

	async deleteProject(id) {
		const { data, status } = await fetcher({ uri: `projects/${id}`, method: "DELETE" });
		return { data, status };
	},

	async exportProjects(format, filters) {
		const formatText = format ? `type=${format}` : "";
		const filtersUri = filters ? filtersToUri(filters) : "";

		return download({ uri: `projects/exports?${formatText + filtersUri}` });
	},
};
