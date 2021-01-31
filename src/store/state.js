import { version } from "../../package.json";
import permissions from "@/permissions";

export default {
	packageVersion: version || "0.0.0",
	isLoading: false,
	login: {
		loading: false,
		error: null,
	},
	auth: { ...permissions },
	country: {},
	language: {},
	temporaryAssistance: null,
	temporaryProject: null,
	isFullPageLoading: false,
	perPage: 10,
};
