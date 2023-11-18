import { toast } from "vuetify-sonner";
// import { NotificationProgrammatic, ToastProgrammatic } from "buefy";

// export const Toast = (message, type, duration = 5000) => {
// 	ToastProgrammatic.open({
// 		duration,
// 		message,
// 		position: "is-top",
// 		queue: false,
// 		type,
// 	});
// };
//
// export const Notification = (message, type, position = "is-bottom-right", indefinite = false) => {
// 	NotificationProgrammatic.open({
// 		duration: 30000,
// 		message,
// 		position,
// 		hasIcon: true,
// 		queue: false,
// 		indefinite,
// 		type,
// 	});
// };

/**
 * @param {String} message
 * @param {("success"|"warning"|"error")} type
 * @param {String} position
 * @param {Boolean} indefinite
 * @param {Boolean} isCloseable
 * @returns {void}
 */
export const Notification = (message, type, { position = "bottom-right", indefinite = false, isCloseable = true } = {}) => {
	toast(message, {
		duration: 30000,
		position, // FIXME
		// hasIcon: true,
		// queue: false,
		indefinite, // FIXME
		// type, // FIXME
		color: type,
		...(isCloseable && {
			action: {
				buttonProps: {
					appendIcon: "times",
					size: "x-small",
				},
			},
		}),
	});
};

export default {
	// Toast,
	Notification,
};
