import { NotificationProgrammatic, ToastProgrammatic } from "buefy";

export const Toast = (message, type, duration = 5000) => {
	ToastProgrammatic.open({
		duration,
		message,
		position: "is-top",
		queue: false,
		type,
	});
};

export const Notification = (message, type, position = "is-bottom-right", indefinite = false) => {
	NotificationProgrammatic.open({
		duration: 30000,
		message,
		position,
		hasIcon: true,
		queue: false,
		indefinite,
		type,
	});
};

export default {
	Toast,
	Notification,
};
