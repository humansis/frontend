import { download, fetcher, idsToUri } from "@/utils/fetcher";
import { Toast } from "@/utils/UI";
import CryptoJS from "crypto-js";

export default {
	async getListOfUsers(
		page,
		size,
		sort,
		search = null,
		ids = null,
		param = null,
		showVendors = true,
	) {
		const fulltext = search ? `&filter[fulltext]=${search}` : "";
		const sortText = sort ? `&sort[]=${sort}` : "";
		const pageText = page ? `&page=${page}` : "";
		const sizeText = size ? `&size=${size}` : "";
		const idsText = ids ? idsToUri(ids, param) : "";
		const showVendorsText = `&filter[showVendors]=${showVendors}`;

		const { data: { data, totalCount } } = await fetcher({
			uri: `users?${pageText + sizeText + sortText + fulltext + idsText + showVendorsText}`,
		});
		return { data, totalCount };
	},

	async getListOfUsersProjects(userId) {
		const { data: { data, totalCount } } = await fetcher({
			uri: `users/${userId}/projects`,
		});
		return { data, totalCount };
	},

	async createUser(body) {
		return this.initializeUser(body.username)
			.then(({ data: { salt, userId }, status, message }) => {
				const userBody = body;
				userBody.password = userBody.password
					? this.saltPassword(salt, userBody.password)
					: null;

				if (status === 400) {
					throw new Error(message);
				}

				return fetcher({ uri: `users/${userId}`, method: "PUT", body: userBody });
			})
			.catch((e) => {
				Toast(`Initialize User ${e}`, "is-danger");
			});
	},

	async changeUsersAttribute(userId, attribute, value) {
		const { data, status } = await fetcher({
			uri: `users/${userId}`,
			method: "PATCH",
			body: {
				[attribute]: value,
			},
		});
		return { data, status };
	},

	async initializeUser(username) {
		return fetcher({ uri: "users/initialize", method: "POST", body: { username } });
	},

	async requestSalt(username) {
		const { data, status } = await fetcher({ uri: `users/salt/${username}`, method: "GET" });
		return { data, status };
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
