import Vue from "vue";
import CONST from "@/const";
import store from "@/store/index";
import getters from "@/store/getters";

async function getErrorsFromResponse(data) {
	let errors = "";

	if (data.errors && data.errors.length) {
		data.errors.forEach((error) => {
			errors += `${error.message} (${error.source}), `;
		});
	}

	return errors || "Something went wrong";
}

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

export const fetcher = async ({ uri, auth = true, method, body, contentType }) => {
	const url = `${CONST.API}/${uri}`;

	let headers = {};

	headers = {
		"Content-Type": contentType || "application/json;charset=utf-8",
	};

	if (auth) {
		const user = JSON.parse(localStorage.getItem("user"));

		if (user?.authdata) {
			// headers.Authorization = `Basic ${user.authdata}`;
			// TODO Remove after Authorization will work correctly
			headers.Authorization = "Basic YWRtaW5AZXhhbXBsZS5vcmc6cGluMTIzNA==";
		}
	}

	const country = getters.getCountryFromLocalStorage();
	headers.Country = country?.iso3 || store.state.country.iso3 || CONST.DEFAULT_COUNTRY;

	const config = { headers };

	if (method) {
		config.method = method;
	}

	if (body) {
		config.body = JSON.stringify(body);
	}

	const response = await fetch(url, config);

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
