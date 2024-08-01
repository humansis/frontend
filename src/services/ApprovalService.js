import { fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfApprovals({ filters }) {
		return fetcher({
			uri: `approvals${queryBuilder({ filters })}`,
		});
	},

	createNewApproval(body) {
		return fetcher({
			uri: `approvals`,
			method: "POST",
			body,
		});
	},

	changeStatusOfApproval({ body, id }) {
		return fetcher({
			uri: `approvals/${id}`,
			method: "PATCH",
			body,
		});
	},
};
