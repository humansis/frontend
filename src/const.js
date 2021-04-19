const API_HOST = process.env.VUE_APP_API_HOST || "http://localhost:8087";
const API_PREFIX = process.env.VUE_APP_API_PREFIX || "/api/basic";
const JWT_PREFIX = process.env.VUE_APP_JWT_PREFIX || "/api/jwt";
const API = API_HOST + API_PREFIX;
const API_JWT = API_HOST + JWT_PREFIX;

const DEFAULT_COUNTRY = {
	currency: "KHR",
	iso3: "KHM",
	name: "Cambodia",
};

const DEFAULT_LANGUAGE = "en";

export default {
	API_HOST,
	API_PREFIX,
	JWT_PREFIX,
	API,
	API_JWT,
	DEFAULT_COUNTRY,
	DEFAULT_LANGUAGE,
};
