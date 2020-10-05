import Vue from "vue";
import CONST from "@/const";

export const getResponseJSON = async (response) => {
	const success = response.status < 400;
	const unauthorized = response.status === 401;
	const forbidden = response.status === 403;
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

	const data = await response.json();

	if (success) {
		return { data, status: response.status };
	}

	throw new Error(response.statusText || data.message || "Something went wrong");
};

export const fetcher = async ({ uri, auth, method, body, contentType }) => {
	const url = `${CONST.API}/${uri}`;

	let headers = {};
	if (contentType) {
		headers = {
			"Content-Type": contentType,
		};
	}

	if (auth) {
		headers.Authentication = localStorage.getItem("user-token");
	}

	const config = { headers };

	if (method) {
		config.method = method;
	}

	if (body) {
		config.body = body;
	}

	const response = await fetch(url, config);
	return getResponseJSON(response);
};
