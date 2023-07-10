import { fetcher, filtersToUri } from "@/utils/fetcher";

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

	getFilteredListOfSubSectors(filter) {
		const filtersUri = filter ? filtersToUri(filter) : "";

		return fetcher({
			uri: `subsectors?${filtersUri}`,
		});
	},
};
