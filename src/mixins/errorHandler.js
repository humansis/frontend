import { Notification } from "@/utils/UI";

export default {
	methods: {
		handleError(error, message, type) {
			if (error.message) Notification(`${this.$t(message)} ${error}`, type);
		},
	},
};
