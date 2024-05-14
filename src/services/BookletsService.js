import { download, fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfBooklets({ page, size, sort, search, filters }) {
		return fetcher({
			uri: `booklets${queryBuilder({ page, size, sort, search, filters })}`,
		});
	},

	createBooklet(body) {
		return fetcher({
			uri: "booklets/batches",
			method: "POST",
			body,
		});
	},

	updateBooklet({ body, id }) {
		return fetcher({
			uri: `booklets/${id}`,
			method: "PUT",
			body,
		});
	},

	removeBooklet(id) {
		return fetcher({
			uri: `booklets/${id}`,
			method: "DELETE",
		});
	},

	exportBooklets({ format, ids }) {
		return download({
			uri: `booklets/exports${queryBuilder({ format, ids })}`,
		});
	},

	exportQRVouchers(ids) {
		return download({
			uri: `booklets/prints${queryBuilder({ ids })}`,
		});
	},
};
