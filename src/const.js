// TODO remove unnecessary host and prefix and API_ON
const API_ON = false;
const API_HOST_MOCK = process.env.VUE_APP_API_HOST_MOCK || "http://localhost:8091";
const API_PREFIX_MOCK = process.env.VUE_APP_API_PREFIX_MOCK || "/api/v2";
const API_MOCK = API_HOST_MOCK + API_PREFIX_MOCK;

const API_HOST = process.env.VUE_APP_API_HOST || "http://localhost:8087";
const API_PREFIX = process.env.VUE_APP_API_PREFIX || "/api/basic";
const API = API_HOST + API_PREFIX;

const DEFAULT_COUNTRY = "KHM";
const DEFAULT_LANGUAGE = "EN";

export default {
	API_HOST,
	API_HOST_MOCK,
	API_PREFIX,
	API_PREFIX_MOCK,
	API,
	API_MOCK,
	API_ON,
	DEFAULT_COUNTRY,
	DEFAULT_LANGUAGE,
};
