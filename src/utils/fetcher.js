import Vue from "vue";
import CONST from "@/const";

import state from "@/store/state";

export const getResponseJSON = async (response) => {
	const success = response.status < 400;
	const unauthorized = response.status === 401;
	const forbidden = response.status === 403;
	const notFound = response.status === 404;
	const noContent = response.status === 204;

	if (noContent) {
		return { data: null, status: response.status };
	}

	if (forbidden) {
		Vue.$router.push({ name: "NotFound" });
		throw new Error("You don't have a access to continue");
	}

	if (unauthorized) {
		const redirect = Vue.$router.currentRoute.query?.redirect || Vue.$router.currentRoute.fullPath;
		Vue.$router.push({ name: "Logout", query: { redirect } });
		throw new Error("You need to login to continue");
	}

	if (notFound) {
		throw new Error(response.statusText);
	}

	const data = await response.json();

	if (success) {
		return { data, status: response.status };
	}

	throw new Error(data.error.exception.pop().message || response.statusText || "Something went wrong");
};

async function fetchFromHumansisApi(uri, auth, method, body, contentType) {
	// TODO Remove second mockUrl after removing swagger api
	const url = `${CONST.API}/${uri}`;
	const mockUrl = `${CONST.API_MOCK}/${uri}`;

	let headers = {};

	headers = {
		"Content-Type": contentType || "application/json;charset=utf-8",
	};

	if (auth) {
		headers.Authentication = localStorage.getItem("user-token");
		// TODO Remove after implement authorization layer
		headers.Authorization = "Basic amFtZXMuaGFwcGVsbEBwZW9wbGVpbm5lZWQuY3o6cGluMTIzNA==";
	}

	let country = await state.country.iso3;
	if (!country) {
		country = localStorage.getItem("country");
	}
	headers.Country = country;

	const config = { headers };

	if (method) {
		config.method = method;
	}

	if (body) {
		config.body = JSON.stringify(body);
	}

	// const response = await fetch(url, config);

	// return getResponseJSON(response);

	// TODO Remove this after removing swagger api and use commented lines above
	const response = await fetch(url, config);
	if (response.status >= 400 && !(method === "POST" || method === "PUT" || method === "DELETE")) {
		const newResponse = await fetch(mockUrl, config);
		return getResponseJSON(newResponse);
	}
	return getResponseJSON(response);
}

export const fetcher = async ({ uri, auth = true, method, body, contentType }) => {
	// TODO Fix after remove swagger api
	if (CONST.API_ON) {
		return fetchFromHumansisApi(uri, auth, method, body, contentType);
	}
	const mockUrl = `${CONST.API_MOCK}/${uri}`;

	let headers = {};

	headers = {
		"Content-Type": contentType || "application/json;charset=utf-8",
	};

	if (auth) {
		headers.Authentication = localStorage.getItem("user-token");
	}

	headers.Country = state.country.iso3;

	const config = { headers };

	if (method) {
		config.method = method;
	}

	if (body) {
		config.body = JSON.stringify(body);
	}

	const response = await fetch(mockUrl, config);

	return getResponseJSON(response);
};

export const filtersToUri = (filters) => {
	let query = "";
	Object.keys(filters).forEach((key) => {
		if (filters[key].length) {
			filters[key].forEach((item) => {
				query += `&${key}[]=${item}`;
			});
		}
	});
	return query;
};
