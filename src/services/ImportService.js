import { download, fetcher, filtersToUri, idsToUri, upload } from "@/utils/fetcher";

export default {
	async getListOfImports(page, size, sort, search = null, filters = null) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const filtersUri = filters ? filtersToUri(filters) : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `imports?${pageText + sizeText + sortText + fulltext + filtersUri}`,
		});
		return { data, totalCount };
	},

	async createImport(body) {
		const { data, status } = await fetcher(
			{ uri: "imports", method: "POST", body,
			},
		);
		return { data, status };
	},

	async getDetailOfImport(importId) {
		const { data, status } = await fetcher({
			uri: `imports/${importId}`,
		});
		return { data, status };
	},

	async changeImportState(importId, body) {
		const { data, status, message } = await fetcher({
			uri: `imports/${importId}`,
			method: "PATCH",
			body,
		});
		return { data, status, message };
	},

	async getFilesInImport(importId) {
		const { data, status } = await fetcher({
			uri: `imports/${importId}/files`,
		});
		return { data, status };
	},

	async uploadFilesIntoImport(importId, files) {
		const formData = new FormData();

		files.forEach((file) => {
			formData.append(file.name, file);
		});

		const { data, status, message } = await upload({
			uri: `imports/${importId}/files`,
			method: "POST",
			body: formData,
		});
		return { data, status, message };
	},

	async removeFilesFromImport(fileId) {
		const { data, status } = await fetcher({
			uri: `imports/files/${fileId}`,
			method: "DELETE",
		});
		return { data, status };
	},

	async getDuplicitiesInImport(importId, page, size, filter) {
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const filtersUri = filter ? filtersToUri(filter) : "";

		const { data, status } = await fetcher({
			uri: `imports/${importId}/duplicities?${pageText + sizeText + filtersUri}`,
		});
		return { data, status };
	},

	async changeBulkDuplicitiesStatus(importId, body) {
		const { data, status } = await fetcher({
			uri: `imports/${importId}/duplicities`,
			method: "PATCH",
			body,
			tryRequest: true,
		});

		return { data, status };
	},

	async getStatisticsInImport(importId) {
		const { data, status } = await fetcher({
			uri: `imports/${importId}/statistics`,
		});
		return { data, status };
	},

	async getNotImportedRowsInImport(importId) {
		const { data, status } = await fetcher({
			uri: `imports/${importId}/fails`,
		});
		return { data, status };
	},

	async downloadFileWithInvalidEntriesFromImport(id) {
		return download({ uri: `imports/invalid-files/${id}` });
	},

	async getFilesWithInvalidEntriesFromImport(importId) {
		const { data } = await fetcher({
			uri: `imports/${importId}/invalid-files`,
		});
		return { data };
	},

	async getImportItemsDetail(importId, queueIds) {
		const idsText = queueIds.length ? idsToUri(queueIds) : "";

		const { data, status } = await fetcher({
			uri: `imports/${importId}/queue?${idsText}`,
		});
		return { data, status };
	},

	async resolveImportItemDuplicity(queueId, state, acceptedDuplicityId) {
		const { status } = await fetcher({
			uri: `imports/queue/${queueId}`,
			method: "PATCH",
			body: {
				status: state,
				acceptedDuplicityId,
			},
			tryRequest: true,
		});

		return { status };
	},

	async exportTemplate(format) {
		const formatText = format ? `type=${format}` : "";

		return download({ uri: `imports/template?${formatText}` });
	},
};
