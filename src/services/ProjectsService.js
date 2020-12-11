import { fetcher } from "@/utils/fetcher";

export default {
	async getSummariesForProject(id, code) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `projects/${id}/summaries?code[]=${code}`,
		});
		return { data, totalCount };
	},

	async getListOfProjects(page, size, sort, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";
		const sortText = sort ? `&sort=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = page ? `&size=${size}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `projects?${pageText + sizeText + sortText + fulltext}`,
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
};
