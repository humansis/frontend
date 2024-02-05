const API_HOST = import.meta.env.VITE_APP_API_HOST || "http://localhost:8087";
const API_PREFIX = import.meta.env.VITE_APP_API_PREFIX || "/api/basic";

export default {
	ENV: import.meta.env.VITE_APP_ENV,
	API_HOST,
	API_PREFIX,
	API: API_HOST + API_PREFIX,
};
