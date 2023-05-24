import { download, fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfVendors(page, size, sort, search = null, ids = null, filters) {
		return fetcher({
			uri: `vendors${queryBuilder({ page, size, sort, search, ids, filters })}`,
		});
	},

	createVendor(body) {
		return fetcher({ uri: "vendors", method: "POST", body });
	},

	getDetailOfVendor(id) {
		return fetcher({
			uri: `vendors/${id}`,
		});
	},

	getSummaryOfVendor(id) {
		return fetcher({
			uri: `vendors/${id}/summaries`,
		});
	},

	updateVendor(id, body) {
		return fetcher({
			uri: `vendors/${id}`, method: "PUT", body,
		});
	},

	deleteVendor(id) {
		return fetcher({
			uri: `vendors/${id}`, method: "DELETE",
		});
	},

	generateInvoiceForVendor(id) {
		return fetcher({
			uri: `vendors/${id}/invoice`,
		});
	},

	generateExportFileForVendor(id) {
		return fetcher({
			uri: `vendors/${id}/export`,
		});
	},

	exportVendors(format, filters) {
		return download({ uri: `vendors/exports${queryBuilder({ format, filters })}` });
	},
};
