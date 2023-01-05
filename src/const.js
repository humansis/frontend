export default {
	ENV: process.env.VUE_APP_ENV,
	API_HOST: process.env.VUE_APP_API_HOST || "http://localhost:8087",
	API_PREFIX: process.env.VUE_APP_API_PREFIX || "/api/basic",
	API: (process.env.VUE_APP_API_HOST || "http://localhost:8087")
		+ (process.env.VUE_APP_API_PREFIX || "/api/basic"),
	DEFAULT_COUNTRY: {
		currency: "KHR",
		iso3: "KHM",
		name: "Cambodia",
	},
	DEFAULT_LANGUAGE: {
		key: "en",
		name: "English",
	},
	LOCATION_TYPE: {
		camp: {
			code: "0",
			type: "camp",
		},
		residence: {
			code: "1",
			type: "residence",
		},
		temporarySettlement: {
			code: "2",
			type: "temporary_settlement",
		},
	},
};
