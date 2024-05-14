import { fetcher } from "@/utils/fetcher";

export default {
	getCampsByLocation(id) {
		return fetcher({ uri: `locations/${id}/camps` });
	},

	getCamp(id) {
		return fetcher({ uri: `camps/${id}` });
	},
};
