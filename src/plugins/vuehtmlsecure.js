import sanitizeHtml from "sanitize-html";

const sanitazeOptions = {
	allowedAttributes: {
		...sanitizeHtml.defaults.allowedAttributes,
		"*": ["id", "class"],
		iframe: ["src", "width", "height"],
		img: ["src", "class", "style", "width", "height", "alt"],
	},
	allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
};
export default sanitazeOptions;
