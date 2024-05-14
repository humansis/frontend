import { fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfCommunities({ page, size, sort, search, filters }) {
		return fetcher({
			uri: `communities${queryBuilder({ page, size, sort, search, filters })}`,
		});
	},
};
