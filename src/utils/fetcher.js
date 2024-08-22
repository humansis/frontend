import { getCookie } from "@/utils/cookie";
import { CONFIG } from "@/consts";
import router from "@/router";
import getters from "@/store/getters";
import store from "@/store/index";

async function getErrorsFromResponse(data) {
	let errors = "";
	let debugs = "";

	if (data.errors && data.errors.length) {
		const errorMessages = data.errors.map((error) => error.message);
		const uniqueErrorMessages = Array.from(new Set(errorMessages));
		errors = uniqueErrorMessages.join(" ");
	} else if (data.errors?.message) {
		errors = data.errors.message;
	} else {
		errors = data;
	}
	// TODO Please remove this code before release because it reads
	// data that is not supposed to be visible for user
	if (data.debug && data.debug.length) {
		data.debug.forEach((debug) => {
			debugs += `${debug.message}. `;
		});
	}

	return errors || debugs || "Something went wrong";
}

export const getResponseJSON = async (response, download = false) => {
	const success = response.status < 400;
	const badRequest = response.status === 400;
	const unauthorized = response.status === 401;
	const forbidden = response.status === 403;
	const notFound = response.status === 404;
	const noContent = response.status === 204;

	if (noContent) {
		return { data: null, status: response.status };
	}

	if (forbidden) {
		if (router.currentRoute.name !== "NoPermission") {
			router.push({ name: "NoPermission" }).catch((error) => {
				console.error(error);
			});
		}

		throw new Error("");
	}

	if (unauthorized) {
		const redirect = router?.currentRoute?.query?.redirect
			|| router?.currentRoute?.fullPath;

		router.push({
			name: "Logout",
			query: { redirect, notification: "login" },
		}).catch((error) => {
			console.error(error);
		});

		throw new Error("");
	}

	if (notFound) {
		router.push({ name: "NotFound" }).catch((error) => {
			console.error(error);
		});

		throw new Error(response.statusText);
	}

	let data = null;

	if (download && success) {
		data = await response.blob();
	} else {
		data = await response.json();
	}

	if (badRequest) {
		return { data, status: response.status, message: await getErrorsFromResponse(data) };
	}

	if (success) {
		return { data, status: response.status, message: response.statusText };
	}

	throw new Error(await getErrorsFromResponse(data));
};

export const fetcher = async ({
	uri,
	version = 1,
	auth = true,
	method,
	body,
	contentType,
	tryRequest = false,
	ignoreBaseUrl = false,
}) => {
	const url = ignoreBaseUrl
		? `${CONFIG.API_HOST}/${uri}`
		: `${CONFIG.API}/v${version}/${uri}`;

	const token = getCookie("token");
	const countryIso3 = store.state.country?.iso3;
	const config = {
		...(method && { method }),
		...(body && { body: JSON.stringify(body) }),
		credentials: "include",
		mode: "cors",
	};

	config.headers = {
		"Content-Type": contentType || "application/json;charset=utf-8",
		"Accept-Language": getters.getLanguageFromVuexStorage()?.key,
		"Access-Control-Allow-Credentials": true,
		...(auth && token.length && { Authorization: `Bearer ${token}` }),
		...(countryIso3 && { Country: countryIso3 }),
	};

	const response = await fetch(url, config);

	if (tryRequest) {
		return response;
	}

	return getResponseJSON(response);
};

export const upload = async ({ uri, version = 1, auth = true, method, body }) => {
	const url = `${CONFIG.API}/v${version}/${uri}`;

	const token = getCookie("token");
	const countryIso3 = store.state.country?.iso3;
	const config = {
		method,
		body,
		credentials: "include",
		mode: "cors",
	};

	config.headers = {
		"Access-Control-Allow-Credentials": true,
		...(auth && token.length && { Authorization: `Bearer ${token}` }),
		...(countryIso3 && { Country: countryIso3 }),
	};

	const response = await fetch(url, config);

	return getResponseJSON(response);
};

export const download = async ({ uri, method = "GET", body = null, version = 1 }) => {
	const url = `${CONFIG.API}/v${version}/${uri}`;

	const token = getCookie("token");
	const countryIso3 = store.state.country?.iso3;
	const config = {
		method,
		...(body && { body: JSON.stringify(body) }),
		credentials: "include",
		mode: "cors",
	};

	config.headers = {
		"Content-Type": "application/json;charset=utf-8",
		"Accept-Language": getters.getLanguageFromVuexStorage()?.key,
		"Access-Control-Allow-Credentials": true,
		...(token && { Authorization: `Bearer ${token}` }),
		...(countryIso3 && { Country: countryIso3 }),
	};

	const response = await fetch(url, config);

	return getResponseJSON(response, true);
};

export const filtersToUri = (filters) => {
	let query = "";

	Object.keys(filters).forEach((key) => {
		if (Array.isArray(filters[key]) && filters[key]?.length) {
			filters[key].forEach((item) => {
				if (typeof item === "object") {
					Object.entries(item).forEach(([objectKey, objectValue]) => {
						query += `&filter[${key}][${objectKey}]=${encodeURIComponent((objectValue))}`;
					});
				} else {
					query += `&filter[${key}][]=${encodeURIComponent(item)}`;
				}
			});
		} else if (typeof filters[key] === "string"
			|| typeof filters[key] === "boolean"
			|| typeof filters[key] === "number"
		) {
			query += `&filter[${key}]=${encodeURIComponent(filters[key])}`;
		}
	});

	return query;
};

export const idsToUri = (ids, param = null) => {
	if (!ids.length) return "";
	let query = "";

	ids.forEach((item) => {
		if (Array.isArray(item)) {
			query += idsToUri(item, param);
		} else if (param) {
			if (Array.isArray(item[param])) {
				query += item[param].length ? `&filter[id][]=${item[param]}` : "";
			} else {
				query += item[param] ? `&filter[id][]=${item[param]}` : "";
			}
		} else {
			query += item ? `&filter[id][]=${item}` : "";
		}
	});

	return query;
};

export const checkResponseStatus = (status, message, validationCode = 200) => {
	if (status !== validationCode) {
		throw new Error(message);
	}
};

export default {
	getResponseJSON,
	fetcher,
	upload,
	download,
	filtersToUri,
	idsToUri,
	checkResponseStatus,
};
