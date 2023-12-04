import { toast } from "vuetify-sonner";

export const Notification = (message, color, { indefinite = false, isCloseable = true } = {}) => {
	toast(message, {
		duration: indefinite ? Number.POSITIVE_INFINITY : 5000,
		color,
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
};

export default {
	Notification,
};
