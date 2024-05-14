import { download, fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfVendors({ page, size, sort, filters, search, ids }) {
		return fetcher({
			uri: `vendors${queryBuilder({ page, size, sort, filters, search, ids })}`,
		});
	},

	createVendor(body) {
		return fetcher({
			uri: "vendors",
			method: "POST",
			body,
		});
	},

	getSummaryOfVendor(id) {
		return fetcher({
			uri: `vendors/${id}/summaries`,
		});
	},

	updateVendor({ id, body }) {
		return fetcher({
			uri: `vendors/${id}`,
			method: "PUT",
			body,
		});
	},

	deleteVendor(id) {
		return fetcher({
			uri: `vendors/${id}`,
			method: "DELETE",
		});
	},

	exportVendors({ format, filters }) {
		return download({
			uri: `vendors/exports${queryBuilder({ format, filters })}`,
		});
	},
};
