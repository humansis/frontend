import { fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfSync({ page, size, sort, search, filters }) {
		return fetcher({
			uri: `syncs${queryBuilder({ page, size, sort, search, filters })}`,
		});
	},
};
