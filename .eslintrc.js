module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		"plugin:vue/vue3-essential",
		"plugin:import/recommended",
		"@vue/airbnb",
	],
	parserOptions: {
		ecmaVersion: 2020,
	},
	plugins: ["simple-import-sort"],
	rules: {
		"import/extensions": ["error", "always", {
			js: "never",
			vue: "never",
			mjs: "never",
		}],
		indent: ["error", "tab", { SwitchCase: 1 }],
		"linebreak-style": "off",
		"no-console": "off",
		"no-debugger": "off",
		"no-tabs": "off",
		"object-curly-newline": "off",
		quotes: ["warn", "double", { avoidEscape: true, allowTemplateLiterals: true }],
		"vue/html-closing-bracket-newline": "warn",
		"vue/html-closing-bracket-spacing": "warn",
		"vue/html-indent": ["error", "tab"],
		"vue/html-self-closing": "warn",
		/*
		*	TODO For now i just turned off validation for mutating props, but in the future
		*   we need to avoid mutating props and push props into local data, then change it and emit
		* 	it back.
		*/
		"vue/no-mutating-props": "off",
		"vue/multi-word-component-names": "off",
		"vue/no-multiple-template-root": "off",
		"vue/valid-v-slot": ["error", {
			allowModifiers: true,
		}],
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
		"simple-import-sort/imports": [
			"error",
			{
				groups: [
					["^vue", "^@vuelidate", "^@/services", "^@/components", "^@/mixins", "^@/utils", "^"],
					["^.+\\.s?(css|sass)$"],
				],
			},
		],
	},
	settings: {
		"import/resolver": {
			alias: {
				map: [
					["@", "./src"],
					["vue-qrcode-reader", "./node_modules"],
				],
				extensions: [".js", ".vue"],
			},
		},
	},
};
