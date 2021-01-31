import permissions from "@/permissions";
import { version } from "../../package.json";

export default {
	packageVersion: version || "0.0.0",
	isLoading: false,
	user: null,
	auth: { ...permissions },
	country: {},
	language: {},
	temporaryAssistance: null,
	temporaryProject: null,
	perPage: 10,
};
