import { version } from "../../package.json";

export default {
	packageVersion: version || "0.0.0",
	country: {},
	language: {},
	isLoading: false,
	login: {
		loading: false,
		error: null,
	},
};
