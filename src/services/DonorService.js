import { download, fetcher, upload } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfDonors({ page, size, sort, search, ids }) {
		return fetcher({
			uri: `donors${queryBuilder({ page, size, sort, search, ids })}`,
		});
	},

	getShortListOfDonors() {
		return fetcher({
			uri: "catalogs/donors",
		});
	},

	createDonor(body) {
		return fetcher({
			uri: "donors",
			method: "POST",
			body,
		});
	},

	updateDonor(id, body) {
		return fetcher({
			uri: `donors/${id}`,
			method: "PUT",
			body,
		});
	},

	deleteDonor(id) {
		return fetcher({
			uri: `donors/${id}`, method: "DELETE",
		});
	},

	exportDonors(format) {
		return download({
			uri: `donors/exports${queryBuilder({ format })}`,
		});
	},

	uploadImage({ id, image }) {
		const formData = new FormData();
		formData.append("file", image);

		return upload({
			uri: `donors/${id}/images`,
			method: "POST",
			body: formData,
		});
	},
};
