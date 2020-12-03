import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfBooklets(page, size, sort, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";
		const sortText = sort ? `&sort=${sort}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `booklets?page=${page}&size=${size + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async createBooklet(body) {
		const { data, status } = await fetcher({
			uri: "booklets", method: "POST", body,
		});
		return { data, status };
	},

	async getDetailOfBooklet(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `booklets/${id}`,
		});
		return { data, totalCount };
	},

	async removeBooklet(id) {
		const { data, status } = await fetcher({
			uri: `booklets/${id}`, method: "DELETE",
		});
		return { data, status };
	},
};
