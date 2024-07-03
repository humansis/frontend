import { download, fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfCustomFields({ page, size, sort, search, filters }) {
		return fetcher({
			uri: `country-specifics${queryBuilder({ page, size, sort, search, filters })}`,
		});
	},

	createCustomField(body) {
		return fetcher({
			uri: "country-specifics",
			method: "POST",
			body,
		});
	},

	updateCustomField({ id, body }) {
		return fetcher({
			uri: `country-specifics/${id}`,
			method: "PUT",
			body,
		});
	},

	deleteCustomField(id) {
		return fetcher({
			uri: `country-specifics/${id}`,
			method: "DELETE",
		});
	},

	exportCustomFields(format) {
		return download({
			uri: `country-specifics/exports${queryBuilder({ format })}`,
		});
	},
};
