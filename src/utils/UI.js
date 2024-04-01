import { toast } from "vuetify-sonner";

export const Notification = (message, color, { indefinite = false, isCloseable = true } = {}) => {
	setTimeout(() => {
		toast(message, {
			duration: indefinite ? Number.POSITIVE_INFINITY : 30000,
			cardProps: {
				color,
			},
			cardTextProps: {
				class: "toast",
			},
			...(isCloseable && {
				action: {
					buttonProps: {
						appendIcon: "times",
						size: "x-small",
					},
				},
			}),
		});
	}, 0);
};

export default {
	Notification,
};
