import { ToastProgrammatic } from "buefy";

export const Toast = (message, type) => {
	ToastProgrammatic.open({
		duration: 1500,
		message,
		position: "is-top",
		type,
	});
};

export default {
	Toast,
};
