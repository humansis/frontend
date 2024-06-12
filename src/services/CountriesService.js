import { fetcher } from "@/utils/fetcher";

export default {
	getListOfCountries() {
		return fetcher({
			uri: "countries",
		});
	},

	getListOfUsersCountries(userId) {
		return fetcher({
			uri: `users/${userId}/countries`,
		});
	},
};
