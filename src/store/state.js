import permissions from "@/permissions";
import { version } from "../../package.json";

export default {
	packageVersion: version || "0.0.0",
	isAppLoading: false,
	user: null,
	auth: { ...permissions },
	country: null,
	language: null,
	temporaryAssistance: null,
	temporaryProject: null,
	perPage: 10,
};
