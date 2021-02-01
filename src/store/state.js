import permissions from "@/permissions";

export default {
	isAppLoading: false,
	auth: { ...permissions },
	country: null,
	language: null,
	temporaryAssistance: null,
	temporaryProject: null,
	perPage: 10,
};
