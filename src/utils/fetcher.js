import Vue from "vue";
import CONST from "@/const";

import store from "@/store/index";

async function getErrorsFromResponse(data) {
	let errors = "";

	if (data.errors && data.errors.length) {
		data.errors.forEach((error) => {
			errors += `${error.message} (${error.source}), `;
		});
	}

	return errors || "Something went wrong";
}

// TODO Correct process of response
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

	throw new Error(await getErrorsFromResponse(data));
};

const fetchFromHumansisApi = async ({ uri, auth, method, body, contentType }) => {
	// TODO Remove second mockUrl after removing swagger api
	const url = `${CONST.API}/${uri}`;
	const mockUrl = `${CONST.API_MOCK}/${uri}`;

	let headers = {};

	headers = {
		"Content-Type": contentType || "application/json;charset=utf-8",
	};

	if (auth) {
		const user = JSON.parse(localStorage.getItem("user"));

		if (user?.authdata) {
			headers.Authentication = `Basic ${user.authdata}`;
		}

		// TODO Remove after implement authorization layer
		headers.Authorization = "Basic amFtZXMuaGFwcGVsbEBwZW9wbGVpbm5lZWQuY3o6cGluMTIzNA==";
	}

	headers.Country = store.state.country.iso3 || localStorage.getItem("country") || CONST.DEFAULT_COUNTRY;

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
};

export const fetcher = async ({ uri, auth = true, method, body, contentType }) => {
	// TODO Fix after remove swagger api
	if (CONST.API_ON) {
		return fetchFromHumansisApi({ uri, auth, method, body, contentType });
	}
	const mockUrl = `${CONST.API_MOCK}/${uri}`;

	let headers = {};

	headers = {
		"Content-Type": contentType || "application/json;charset=utf-8",
	};

	if (auth) {
		const user = JSON.parse(localStorage.getItem("user"));

		if (user?.authdata) {
			headers.Authentication = `Basic ${user.authdata}`;
		}

		// TODO Remove after implement authorization layer
		headers.Authorization = "Basic amFtZXMuaGFwcGVsbEBwZW9wbGVpbm5lZWQuY3o6cGluMTIzNA==";
	}

	headers.Country = store.state.country.iso3 || localStorage.getItem("country") || CONST.DEFAULT_COUNTRY;

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
