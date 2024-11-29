import sanitazeOptions from "@/plugins/vuehtmlsecure";
import sanitizeHtml from "sanitize-html";

const htmlSecureDirective = {
	mounted(el, binding) {
		// eslint-disable-next-line no-param-reassign
		el.innerHTML = sanitizeHtml(binding.value, sanitazeOptions);
	},
	updated(el, binding) {
		// eslint-disable-next-line no-param-reassign
		el.innerHTML = sanitizeHtml(binding.value, sanitazeOptions);
	},
};

export default htmlSecureDirective;
