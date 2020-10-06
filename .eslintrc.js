module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		"plugin:vue/essential",
		"@vue/airbnb",
	],
	parserOptions: {
		parser: "babel-eslint",
	},
	rules: {
		"import/extensions": ["warn", "ignorePackages"],
		indent: ["error", "tab", { SwitchCase: 1 }],
		"linebreak-style": "off",
		"no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
		"no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
		"no-tabs": "off",
		"object-curly-newline": "off",
		quotes: ["warn", "double", { avoidEscape: true, allowTemplateLiterals: true }],
	},
};
