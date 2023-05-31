import Vue from "vue";
import sanitizeHtml from "sanitize-html";

const options = {
	allowedAttributes: {
		...sanitizeHtml.defaults.allowedAttributes,
		"*": ["id", "class"],
		iframe: ["src", "width", "height"],
		img: ["src", "class", "style", "width", "height", "alt"],
	},
	allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
};

Vue.directive("html-secure", {
	update(el, binding) {
		// eslint-disable-next-line no-param-reassign
		el.innerHTML = sanitizeHtml(binding.value, options);
	},
});
