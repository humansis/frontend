import { NotificationProgrammatic, ToastProgrammatic } from "buefy";

export const Toast = (message, type) => {
	ToastProgrammatic.open({
		duration: 5000,
		message,
		position: "is-top",
		queue: false,
		type,
	});
};

export const Notification = (message, type, position) => {
	NotificationProgrammatic.open({
		duration: 7000,
		message,
		position: position || "is-bottom-right",
		hasIcon: true,
		queue: false,
		type,
	});
};

export default {
	Toast,
	Notification,
};
