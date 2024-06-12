import { download, fetcher, upload } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfImports({ page, size, sort, search, filters }) {
		return fetcher({
			uri: `imports${queryBuilder({ page, size, sort, search, filters })}`,
		});
	},

	createImport(body) {
		return fetcher(
			{
				uri: "imports",
				method: "POST",
				body,
			},
		);
	},

	getDetailOfImport(importId) {
		return fetcher({
			uri: `imports/${importId}`,
		});
	},

	changeImportState({ importId, body }) {
		return fetcher({
			uri: `imports/${importId}`,
			method: "PATCH",
			body,
		});
	},

	getFilesInImport(importId) {
		return fetcher({
			uri: `imports/${importId}/files`,
		});
	},

	uploadFilesIntoImport({ importId, files }) {
		const formData = new FormData();

		files.forEach((file) => {
			formData.append(file.name, file);
		});

		return upload({
			uri: `imports/${importId}/files`,
			method: "POST",
			body: formData,
		});
	},

	getDuplicitiesInImport({ importId, page, size, filter }) {
		return fetcher({
			uri: `imports/${importId}/duplicities${queryBuilder({ page, size, filter })}`,
		});
	},

	changeBulkDuplicitiesStatus({ importId, body }) {
		return fetcher({
			uri: `imports/${importId}/duplicities`,
			method: "PATCH",
			body,
			tryRequest: true,
		});
	},

	getStatisticsInImport(importId) {
		return fetcher({
			uri: `imports/${importId}/statistics`,
		});
	},

	getNotImportedRowsInImport(importId) {
		return fetcher({
			uri: `imports/${importId}/fails`,
		});
	},

	downloadFileWithInvalidEntriesFromImport(id) {
		return download({
			uri: `imports/invalid-files/${id}`,
		});
	},

	getFilesWithInvalidEntriesFromImport(importId) {
		return fetcher({
			uri: `imports/${importId}/invalid-files`,
		});
	},

	resolveImportItemDuplicity({ queueId, state, acceptedDuplicityId }) {
		return fetcher({
			uri: `imports/queue/${queueId}`,
			method: "PATCH",
			body: {
				status: state,
				acceptedDuplicityId,
			},
			tryRequest: true,
		});
	},

	exportTemplate(format) {
		return download({
			uri: `imports/template${queryBuilder({ format })}`,
		});
	},
};
