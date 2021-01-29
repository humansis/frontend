import permissions from "@/permissions";
import CONST from "@/const";

export default {
	isAppLoading: false,
	auth: { ...permissions },
	country: {
		iso3: CONST.DEFAULT_COUNTRY,
	},
	language: {
		name: CONST.DEFAULT_LANGUAGE,
	},
	temporaryAssistance: null,
	temporaryProject: null,
	perPage: 10,
};
