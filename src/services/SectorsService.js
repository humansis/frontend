import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfSectors() {
		const { data: { data, totalCount } } = await fetcher({ uri: "sectors" });
		return { data, totalCount };
	},

	async getListOfProjectSectors(projectId) {
		// TODO Endpoint needs to have a different prefix
		const { data: { data, totalCount } } = await fetcher({ uri: `projects/${projectId}/sectors` });
		return { data, totalCount };
	},

	async getListOfSubSectors(code) {
		const { data: { data, totalCount } } = await fetcher({ uri: `sectors/${code}/subsectors` });
		return { data, totalCount };
	},
};
