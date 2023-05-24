import Vue from "vue";
import sanitizeHtml from "sanitize-html";

const options = {
	allowedAttributes: {
		...sanitizeHtml.defaults.allowedAttributes,
		"*": ["id", "class"],
	},
	allowedTags: ["br", "b"],
};

Vue.directive("html-secure", {
	bind(el, binding) {
		// eslint-disable-next-line no-param-reassign
		el.innerHTML = sanitizeHtml(binding.value, options);
	},
});
