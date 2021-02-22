import { fetcher } from "@/utils/fetcher";
import { Toast } from "@/utils/UI";
import CryptoJS from "crypto-js";

export default {
	async getListOfUsers(page, size, sort, search = null) {
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";

		const { data: { data, totalCount } } = await fetcher({
			uri: `users?${pageText + sizeText + sortText + fulltext}`,
		});
		return { data, totalCount };
	},

	async createUser(body) {
		return this.initializeUser(body.username)
			.then(async ({ data: { salt, userId } }) => {
				const userBody = body;
				userBody.password = userBody.password
					? this.saltPassword(salt, userBody.password)
					: null;

				const { data, status } = await fetcher({ uri: `users/${userId}`, method: "POST", body: userBody });
				return { data, status };
			})
			.catch((e) => {
				Toast(`Initialize User ${e}`, "is-danger");
			});
	},

	async initializeUser(username) {
		return fetcher({ uri: "users/initialize", method: "POST", body: { username } });
	},

	async requestSalt(username) {
		const { data, status } = await fetcher({ uri: `users/salt/${username}`, method: "GET" });
		return { data, status };
	},

	saltPassword(salt, password) {
		const salted = `${password}{${salt}`;
		let digest = CryptoJS.SHA512(salted);

		for (let i = 1; i < 5000; i += 1) {
			digest = CryptoJS.SHA512(digest.concat(CryptoJS.enc.Utf8.parse(salted)));
		}

		return CryptoJS.enc.Base64.stringify(digest);
	},

	async getDetailOfUser(id) {
		const { data: { data } } = await fetcher({
			uri: `users/${id}`,
		});
		return { data };
	},

	async updateUser(id, body) {
		return this.requestSalt(body.username)
			.then(async ({ data: { salt } }) => {
				const userBody = body;
				userBody.password = userBody.password
					? this.saltPassword(salt, userBody.password)
					: null;
				const { data, status } = await fetcher({
					uri: `users/${id}`, method: "PUT", body: userBody,
				});
				return { data, status };
			})
			.catch((e) => {
				Toast(`Update User ${e}`, "is-danger");
			});
	},

	async deleteUser(id) {
		const { data, status } = await fetcher({
			uri: `users/${id}`, method: "DELETE",
		});
		return { data, status };
	},

	async sendHistory(id) {
		const { data: { data } } = await fetcher({
			uri: `users/${id}/logs`,
		});
		return { data };
	},

};
