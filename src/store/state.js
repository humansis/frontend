import permissions from "@/permissions";
import CONST from "@/const";

export default {
	auth: { ...permissions },
	country: {
		iso3: CONST.DEFAULT_COUNTRY,
	},
	language: {
		name: CONST.DEFAULT_LANGUAGE,
	},
	temporaryAssistance: null,
	temporaryProject: null,
	isFullPageLoading: false,
	perPage: 10,
};
