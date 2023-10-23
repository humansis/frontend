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
		parser: "@babel/eslint-parser",
	},
	plugins: ["simple-import-sort"],
	rules: {
		"import/extensions": ["warn", "ignorePackages"],
		"import/order": "off",
		indent: ["error", "tab", { SwitchCase: 1 }],
		"linebreak-style": "off",
		"no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
		"no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
		"no-tabs": "off",
		"no-plusplus": "off",
		"object-curly-newline": "off",
		quotes: ["warn", "double", { avoidEscape: true, allowTemplateLiterals: true }],
		"vue/html-closing-bracket-newline": "warn",
		"vue/html-closing-bracket-spacing": "warn",
		"vue/html-indent": ["error", "tab"],
		"vue/html-self-closing": "warn",
		"simple-import-sort/imports": [
			"error",
			{
				groups: [
					["^vue", "^vuelidate", "^@/services", "^@/components", "^@/mixins", "^@/utils", "^"],
					["^.+\\.css$"],
				],
			},
		],
		"vue/order-in-components": ["error", {
			order: [
				"el",
				"name",
				"parent",
				"functional",
				["delimiters", "comments"],
				["components", "directives", "filters"],
				"extends",
				"mixins",
				"validations",
				"inheritAttrs",
				["props", "propsData"],
				"data",
				"computed",
				"watch",
				"beforeCreate",
				"created",
				"beforeMount",
				"mounted",
				"beforeUpdate",
				"updated",
				"activated",
				"deactivated",
				"beforeDestroy",
				"destroyed",
				"methods",
				["template", "render"],
				"renderError",
			],
		}],
	},
};
