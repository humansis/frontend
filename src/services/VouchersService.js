import { fetcher } from "@/utils/fetcher";

export default {
	async getListOfVouchers(page, size, sort, search = null) {
		const fulltext = search ? `&fulltext=${search}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `vouchers?page=${page}&size=${size}&sort=${sort + fulltext}`,
		});
		return { data, totalCount };
	},

	async createVoucher(body) {
		const { data, status } = await fetcher({
			uri: "vouchers", method: "POST", body,
		});
		return { data, status };
	},

	async getDetailOfVoucher(id) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `vouchers/${id}`,
		});
		return { data, totalCount };
	},

	async updateVoucher(id, body) {
		const { data, status } = await fetcher({
			uri: `vouchers/${id}`, method: "PUT", body,
		});
		return { data, status };
	},

	async removeVoucher(id) {
		const { data, status } = await fetcher({
			uri: `vouchers/${id}`, method: "DELETE",
		});
		return { data, status };
	},
};
