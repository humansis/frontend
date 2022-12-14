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

	async changeImportState(importId, attribute, value) {
		const { data, status } = await fetcher({
			uri: `imports/${importId}`,
			method: "PATCH",
			body: {
				[attribute]: value,
			},
		});
		return { data, status };
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

		const { data, status } = await upload({
			uri: `imports/${importId}/files`,
			method: "POST",
			body: formData,
		});
		return { data, status };
	},

	async removeFilesFromImport(fileId) {
		const { data, status } = await fetcher({
			uri: `imports/files/${fileId}`,
			method: "DELETE",
		});
		return { data, status };
	},

	async getDuplicitiesInImport(importId) {
		const { data, status } = await fetcher({
			uri: `imports/${importId}/duplicities`,
		});
		return { data, status };
	},

	async getStatisticsInImport(importId) {
		const { data, status } = await fetcher({
			uri: `imports/${importId}/statistics`,
		});
		return { data, status };
	},

	async downloadFileWithInvalidEntriesFromImport(id) {
		const { data } = await download({ uri: `imports/invalid-files/${id}` });
		return { data };
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
		const { data, status } = await fetcher({
			uri: `imports/queue/${queueId}`,
			method: "PATCH",
			body: {
				status: state,
				acceptedDuplicityId,
			},
		});
		return { data, status };
	},
};
