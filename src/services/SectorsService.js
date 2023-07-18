import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfSectors() {
		const { data: { data, totalCount } } = await fetcher({ uri: "sectors" });
		return { data, totalCount };
	},

	async getListOfProjectSectors(projectId) {
		const { data: { data, totalCount } } = await fetcher({ uri: `projects/${projectId}/sectors`, version: 2 });
		return { data, totalCount };
	},

	async getListOfSubSectors(code) {
		const { data: { data, totalCount } } = await fetcher({ uri: `sectors/${code}/subsectors` });
		return { data, totalCount };
	},

	getListOfProjectSubSectors(projectId, code) {
		return fetcher({ uri: `projects/${projectId}/sectors/${code}/subsectors` });
	},

	getFilteredListOfSubSectors() {
		return fetcher({ uri: `subsectors` });
	},
};
