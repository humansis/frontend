import { download, fetcher, idsToUri } from "@/utils/fetcher";

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

	async exportProjects(format) {
		const formatText = format ? `type=${format}` : "";

		return download({ uri: `projects/exports?${formatText}` });
	},
};
