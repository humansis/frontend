const API_HOST = process.env.VUE_APP_API_HOST || "http://localhost:8087";
const API_PREFIX = process.env.VUE_APP_API_PREFIX || "/api/basic";

export default {
	ENV: process.env.VUE_APP_ENV,
	API_HOST,
	API_PREFIX,
	API: API_HOST + API_PREFIX,
};
