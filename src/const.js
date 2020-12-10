// TODO remove unnecessary host and prefix
const API_HOST = process.env.VUE_APP_API_HOST || "http://localhost:8091";
const API_PREFIX = process.env.VUE_APP_API_PREFIX || "/api/v2";
const API = API_HOST + API_PREFIX;

const API_HOST2 = "http://localhost:8087";
const API_PREFIX2 = "/api/basic";
const API2 = API_HOST2 + API_PREFIX2;

export default {
	API_HOST,
	API_HOST2,
	API_PREFIX,
	API_PREFIX2,
	API,
	API2,
};
