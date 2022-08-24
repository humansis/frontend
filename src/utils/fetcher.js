import router from "@/router";
import CONST from "@/const";
import store from "@/store/index";
import getters from "@/store/getters";

async function getErrorsFromResponse(data) {
	let errors = "";
	let debugs = "";

	if (data.errors && data.errors.length) {
		data.errors.forEach((error) => {
			errors += error.message;
		});
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
		throw new Error("You don't have a access to continue");
	}

	if (unauthorized) {
		const redirect = router?.currentRoute?.query?.redirect
			|| router?.currentRoute?.fullPath;

		router.push({ name: "Logout", query: { redirect, notification: "login" } });

		throw new Error("");
	}

	if (notFound) {
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

export const fetcher = async (
	{
		uri,
		version = 1,
		auth = true,
		method,
		body,
		contentType,
		tryRequest = false,
	}) => {
	const url = `${CONST.API}/v${version}/${uri}`;

	let headers = {};

	headers = {
		"Content-Type": contentType || "application/json;charset=utf-8",
		"Accept-Language": getters.getLanguageFromVuexStorage()?.key,
	};

	if (auth) {
		const user = getters.getUserFromVuexStorage();

		if (user?.token) {
			headers.Authorization = `Bearer ${user.token}`;
		}
	}

	headers.Country = store.state.country?.iso3 || "";

	const config = { headers };

	if (method) {
		config.method = method;
	}

	if (body) {
		config.body = JSON.stringify(body);
	}

	const response = await fetch(url, config);

	if (tryRequest) {
		return response;
	}

	return getResponseJSON(response);
};

export const upload = async ({ uri, version = 1, auth = true, method, body }) => {
	const url = `${CONST.API}/v${version}/${uri}`;

	const headers = {};

	if (auth) {
		const user = getters.getUserFromVuexStorage();

		if (user?.token) {
			headers.Authorization = `Bearer ${user.token}`;
		}
	}

	headers.Country = store.state.country?.iso3 || "";

	const config = { headers };

	config.method = method;

	config.body = body;

	const response = await fetch(url, config);

	return getResponseJSON(response);
};

export const download = async ({ uri, method = "GET", body = null, version = 1 }) => {
	const url = `${CONST.API}/v${version}/${uri}`;

	const headers = {
		"Content-Type": "application/json;charset=utf-8",
		"Accept-Language": getters.getLanguageFromVuexStorage()?.key,
	};

	const user = getters.getUserFromVuexStorage();

	if (user?.token) {
		headers.Authorization = `Bearer ${user.token}`;
	}

	headers.Country = store.state.country?.iso3 || "";

	const config = {
		headers,
		method,
		...(body && { body: JSON.stringify(body) }),
	};

	const response = await fetch(url, config);

	return getResponseJSON(response, true);
};

export const filtersToUri = (filters) => {
	let query = "";

	Object.keys(filters).forEach((key) => {
		if (Array.isArray(filters[key]) && filters[key]?.length) {
			filters[key].forEach((item) => {
				query += `&filter[${key}][]=${item}`;
			});
		} else if (typeof filters[key] === "string") {
			query += `&filter[${key}]=${filters[key]}`;
		}
	});

	return query;
};

export const idsToUri = (ids, param = null) => {
	if (!ids.length) return "";
	let query = "";

	ids.forEach((item) => {
		if (param) {
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
