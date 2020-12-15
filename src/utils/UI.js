import { NotificationProgrammatic, ToastProgrammatic } from "buefy";

export const Toast = (message, type) => {
	ToastProgrammatic.open({
		duration: 5000,
		message,
		position: "is-top",
		type,
	});
};

export const Notification = (message, type) => {
	NotificationProgrammatic.open({
		duration: 7000,
		message,
		position: "is-bottom-right",
		hasIcon: true,
		type,
	});
};

export default {
	Toast,
	Notification,
};
