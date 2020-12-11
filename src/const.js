// TODO remove unnecessary host and prefix
const API_HOST_MOCK = process.env.VUE_APP_API_HOST || "http://localhost:8091";
const API_PREFIX_MOCK = process.env.VUE_APP_API_PREFIX || "/api/v2";
const API_MOCK = API_HOST_MOCK + API_PREFIX_MOCK;

const API_HOST = "http://localhost:8087";
const API_PREFIX = "/api/basic";
const API = API_HOST + API_PREFIX;

export default {
	API_HOST,
	API_HOST_MOCK,
	API_PREFIX,
	API_PREFIX_MOCK,
	API,
	API_MOCK,
};
