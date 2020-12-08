import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfCommunities(page, size, sort, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";
		const sortText = sort ? `&sort=${sort}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `communities?page=${page}&size=${size + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async createCommunity(body) {
		const { data, status } = await fetcher({ uri: "communities", method: "POST", body });
		return { data, status };
	},

	async getDetailOfCommunity(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `communities/${id}`,
		});
		return { data, totalCount };
	},

	async updateCommunity(id, body) {
		const { data, status } = await fetcher({
			uri: `communities/${id}`, method: "PUT", body,
		});
		return { data, status };
	},

	async deleteCommunity(id) {
		const { data, status } = await fetcher({
			uri: `communities/${id}`, method: "DELETE",
		});
		return { data, status };
	},
};
