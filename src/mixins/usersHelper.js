import UsersService from "@/services/UsersService";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	methods: {
		async getDetailOfUser(userId) {
			try {
				const {
					data,
					status,
					message,
				} = await UsersService.getDetailOfUser(userId);

				checkResponseStatus(status, message);

				return data;
			} catch (e) {
				Notification(`${this.$t("Users detail")}: ${e.message || e}`, "error");
			}

			return null;
		},
	},
};
