import { fetcher } from "@/utils/fetcher";

export default {
	async getSummariesForProject(id, code) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `projects/${id}/summaries?code[]=${code}`,
		});
		return { data, totalCount };
	},

	async getAllProjects() {
		const { data: { data, totalCount } } = await fetcher({
			uri: `projects`,
		});
		return { data, totalCount };
	},

	async getListOfProjects(page, size, sort, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `projects?page=${page}&size=${size}&sort=${sort + fulltext}`,
		});
		return { data, totalCount };
	},

	async createProject(body) {
		const { data, status } = await fetcher({ uri: "projects", method: "POST", body });
		return { data, status };
	},

	async getDetailOfProject(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `projects/${id}`,
		});
		return { data, totalCount };
	},

	async editProject(id, body) {
		const { data, status } = await fetcher({ uri: `projects/${id}`, method: "PUT", body });
		return { data, status };
	},

	async deleteProject(id) {
		const { data, status } = await fetcher({ uri: `projects/${id}`, method: "DELETE" });
		return { data, status };
	},
};
