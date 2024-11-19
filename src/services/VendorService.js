import UsersService from "@/services/UsersService";
import { checkResponseStatus, download, fetcher } from "@/utils/fetcher";
import { queryBuilder, saltPassword } from "@/utils/helpers";

export default {
	getListOfVendors({ page, size, sort, filters, search, ids }) {
		return fetcher({
			uri: `vendors${queryBuilder({ page, size, sort, filters, search, ids })}`,
		});
	},

	getShortListOfVendors() {
		return fetcher({
			uri: "catalogs/vendors",
		});
	},

	async createVendorUser(body) {
		// eslint-disable-next-line no-useless-catch
		try {
			const {
				data: { salt, userId },
				status,
				message,
			} = await this.initializeVendor(body.username);

			const userBody = body;

			if (userBody.password) {
				userBody.password = saltPassword(salt, userBody.password);
			}

			checkResponseStatus(status, message);

			return fetcher({
				uri: `vendors/user/${userId}`,
				method: "PUT",
				body: userBody,
			});
		} catch (e) {
			throw e;
		}
	},

	async updateVendorUser({ id, body }) {
		// eslint-disable-next-line no-useless-catch
		try {
			const userBody = body;
			const {
				data: { salt },
				status,
				message,
			} = await UsersService.requestSalt(body.username);

			userBody.password = userBody.password
				? saltPassword(salt, userBody.password)
				: null;

			checkResponseStatus(status, message);

			return fetcher({
				uri: `vendors/user/${id}`,
				method: "PUT",
				body: userBody,
			});
		} catch (e) {
			throw e;
		}
	},

	initializeVendor(username) {
		return fetcher({
			uri: "vendors/initialize",
			method: "POST",
			body: { username },
		});
	},

	createVendor(body) {
		return fetcher({
			uri: "vendors",
			method: "POST",
			body,
		});
	},

	getSummaryOfVendor(id) {
		return fetcher({
			uri: `vendors/${id}/summaries`,
		});
	},

	updateVendor({ id, body }) {
		return fetcher({
			uri: `vendors/${id}`,
			method: "PUT",
			body,
		});
	},

	deleteVendor(id) {
		return fetcher({
			uri: `vendors/${id}`,
			method: "DELETE",
		});
	},

	exportVendors({ format, filters }) {
		return download({
			uri: `vendors/exports${queryBuilder({ format, filters })}`,
		});
	},
};
