import { download, fetcher, filtersToUri, idsToUri } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	async getListOfProjects(page, size, sort, search = null, ids) {
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

	async createProject(body) {
		const { data, status } = await fetcher({ uri: "projects", method: "POST", body });
		return { data, status };
	},

	async getDetailOfProject(id) {
		const { data } = await fetcher({
			uri: `projects/${id}`,
		});
		return { data };
	},

	async updateProject(id, body) {
		const { data, status } = await fetcher({ uri: `projects/${id}`, method: "PUT", body });
		return { data, status };
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
