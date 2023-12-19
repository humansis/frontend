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

const htmlSecureDirective = {
	mounted(el, binding) {
		// eslint-disable-next-line no-param-reassign
		el.innerHTML = sanitizeHtml(binding.value, options);
	},
	updated(el, binding) {
		// eslint-disable-next-line no-param-reassign
		el.innerHTML = sanitizeHtml(binding.value, options);
	},
};

export default htmlSecureDirective;
