const ENV = process.env.VUE_APP_ENV;
const API_HOST = process.env.VUE_APP_API_HOST || "http://localhost:8087";
const API_PREFIX = process.env.VUE_APP_API_PREFIX || "/api/basic";
const API = API_HOST + API_PREFIX;

const DEFAULT_COUNTRY = {
	currency: "KHR",
	iso3: "KHM",
	name: "Cambodia",
};

const DEFAULT_LANGUAGE = "en";

export default {
	ENV,
	API_HOST,
	API_PREFIX,
	API,
	DEFAULT_COUNTRY,
	DEFAULT_LANGUAGE,
};
