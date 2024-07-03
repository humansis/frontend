import { fetcher } from "@/utils/fetcher";

export default {
	getListOfSectors() {
		return fetcher({
			uri: "sectors",
		});
	},

	getListOfProjectSectors(projectId) {
		return fetcher({
			uri: `projects/${projectId}/sectors`,
			version: 2,
		});
	},

	getListOfSubSectors(code) {
		return fetcher({
			uri: `sectors/${code}/subsectors`,
		});
	},

	getListOfProjectSubSectors({ projectId, code }) {
		return fetcher({
			uri: `projects/${projectId}/sectors/${code}/subsectors`,
		});
	},

	getFilteredListOfSubSectors() {
		return fetcher({
			uri: `subsectors`,
		});
	},
};
