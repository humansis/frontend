import permissions from "@/permissions";
import { version } from "../../package.json";

export default {
	packageVersion: version || "0.0.0",
	isLoading: false,
	user: null,
	isAppLoading: false,
	auth: { ...permissions },
	country: null,
	language: null,
	temporaryAssistance: null,
	temporaryProject: null,
	perPage: 10,
};
