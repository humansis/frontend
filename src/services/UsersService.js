import { download, fetcher } from "@/utils/fetcher";
import { Toast } from "@/utils/UI";
import CryptoJS from "crypto-js";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfUsers(
		page,
		size,
		sort,
		search = null,
		ids = null,
		idsParam = null,
		filters,
	) {
		return fetcher({
			uri: `users${queryBuilder({ page, size, sort, search, ids, idsParam, filters })}`,
		});
	},

	getListOfUsersProjects(userId) {
		return fetcher({
			uri: `users/${userId}/projects`,
		});
	},

	async createUser(body) {
		try {
			const { data: { salt, userId } } = await this.initializeUser(body.username);

			const userBody = body;
			userBody.password = userBody.password
				? this.saltPassword(salt, userBody.password)
				: null;

			return fetcher({ uri: `users/${userId}`, method: "PUT", body: userBody });
		} catch (e) {
			if (e.message) Toast(`Initialize User ${e}`, "is-danger");
		}

		return null;
	},

	changeUsersAttribute(userId, attribute, value) {
		return fetcher({
			uri: `users/${userId}`,
			method: "PATCH",
			body: {
				[attribute]: value,
			},
		});
	},

	initializeUser(username) {
		return fetcher({ uri: "users/initialize", method: "POST", body: { username } });
	},

	requestSalt(username) {
		return fetcher({ uri: `users/salt/${username}`, method: "GET" });
	},

	saltPassword(salt, password) {
		const salted = `${password}{${salt}}`;
		let digest = CryptoJS.SHA512(salted);

		for (let i = 1; i < 5000; i += 1) {
			digest = CryptoJS.SHA512(digest.concat(CryptoJS.enc.Utf8.parse(salted)));
		}

		return CryptoJS.enc.Base64.stringify(digest);
	},

	async getDetailOfUser(id) {
		const { data, status } = await fetcher({
			uri: `users/${id}`,
		});
		return { data, status };
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

	async exportUsers(format) {
		const formatText = format ? `type=${format}` : "";

		return download({ uri: `users/exports?${formatText}` });
	},

	async patchUser(id, body) {
		const { data, status } = await fetcher({
			uri: `users/${id}`, method: "PATCH", body,
		});
		return { data, status };
	},

};
