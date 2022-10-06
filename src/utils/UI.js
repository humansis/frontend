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

export const Notification = (message, type, position = "is-bottom-right") => {
	NotificationProgrammatic.open({
		duration: 30000,
		message,
		position,
		hasIcon: true,
		queue: false,
		type,
	});
};

export default {
	Toast,
	Notification,
};
