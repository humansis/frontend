import { checkResponseStatus, download, fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import i18n from "@/plugins/i18n";
import CryptoJS from "crypto-js";

const { global: { t } } = i18n;

export default {
	getListOfUsers({ page, size, sort, search, ids, idsParam, filters }) {
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
		// eslint-disable-next-line no-useless-catch
		try {
			const {
				data: { salt, userId },
				status,
				message,
			} = await this.initializeUser(body.username);

			const userBody = body;

			if (userBody.password) {
				userBody.password = this.saltPassword(salt, userBody.password);
			}

			checkResponseStatus(status, message);

			return fetcher({
				uri: `users/${userId}`,
				method: "PUT",
				body: userBody,
			});
		} catch (e) {
			throw e;
		}
	},

	initializeUser(username) {
		return fetcher({
			uri: "users/initialize",
			method: "POST",
			body: { username },
		});
	},

	requestSalt(username) {
		return fetcher({
			uri: `users/salt/${username}`,
			method: "GET",
		});
	},

	saltPassword(salt, password) {
		const salted = `${password}{${salt}}`;
		let digest = CryptoJS.SHA512(salted);

		for (let i = 1; i < 5000; i += 1) {
			digest = CryptoJS.SHA512(digest.concat(CryptoJS.enc.Utf8.parse(salted)));
		}

		return CryptoJS.enc.Base64.stringify(digest);
	},

	getDetailOfUser(id) {
		return fetcher({
			uri: `users/${id}`,
		});
	},

	async updateUser({ id, body }) {
		// eslint-disable-next-line no-useless-catch
		try {
			const userBody = body;
			const {
				data: { salt },
				status,
				message,
			} = await this.requestSalt(body.username);

			userBody.password = userBody.password
				? this.saltPassword(salt, userBody.password)
				: null;

			checkResponseStatus(status, message);

			return fetcher({
				uri: `users/${id}`,
				method: "PUT",
				body: userBody,
			});
		} catch (e) {
			throw e;
		}
	},

	deleteUser(id) {
		return fetcher({
			uri: `users/${id}`,
			method: "DELETE",
		});
	},

	exportUsers(format) {
		return download({
			uri: `users/exports${queryBuilder({ format })}`,
		});
	},

	patchUser({ id, body }) {
		return fetcher({
			uri: `users/${id}`,
			method: "PATCH",
			body,
		});
	},

};
