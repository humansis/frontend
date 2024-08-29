import { filtersToUri, idsToUri } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import i18n from "@/plugins/i18n";
import moment from "moment";

const { global: { t } } = i18n;

export const queryBuilder = (param) => {
	const { page, size, sort, search, filters, upcoming, ids, idsParam, format } = param;
	const query = [];

	if (page) { query.push(`page=${page}`); }
	if (size) { query.push(`size=${size}`); }
	if (sort) { query.push(`sort[]=${sort}`); }
	if (search) { query.push(`filter[fulltext]=${search}`); }
	if (filters && Object.keys(filters).length) {
		const filterQuery = filtersToUri(filters).replace(/^&/, "");
		if (filterQuery.length) {
			query.push(filterQuery);
		}
	}
	if (upcoming) { query.push(`upcoming=${upcoming}`); }
	if (ids?.length) { query.push(idsToUri(ids, idsParam)); }
	if (format) { query.push(`type=${format}`); }

	return query.length ? `?${query.join("&").replace(/&+/g, "&")}` : "";
};

export const filterEmptyValues = (param) => {
	const originalObject = param;

	if (typeof originalObject === "object") {
		Object.keys(originalObject).forEach((key) => {
			if ((originalObject[key] === null)
				|| (originalObject[key] === undefined)
				|| (typeof originalObject[key] === "string" && !originalObject[key].length)
				|| (typeof originalObject[key] === "object" && !Object.keys(originalObject[key]).length)
			) {
				delete originalObject[key];
			}
		});
	}

	return originalObject;
};

export const replaceEmptyValuesWithNull = (param) => {
	const originalObject = param;

	if (typeof originalObject === "object") {
		Object.keys(originalObject).forEach((key) => {
			if (originalObject[key] === null || originalObject[key] instanceof Date) return;

			if ((originalObject[key] === undefined)
				|| (typeof originalObject[key] === "object" && !Object.keys(originalObject[key]).length)
				|| ((typeof originalObject[key] === "string"
					|| Array.isArray(originalObject[key]))
					&& !originalObject[key].length)
			) {
				originalObject[key] = null;
			}
		});
	}

	return originalObject;
};

export const BookletStatusArray = [
	{ code: "0", value: t("Unassigned") },
	{ code: "1", value: t("Distributed") },
	{ code: "2", value: t("Used") },
	{ code: "3", value: t("Deactivated") },
];

// TODO remove this function in other places and check functionality
export const copyObject = (obj) => JSON.parse(JSON.stringify(obj));

export const deepEqual = (x, y) => {
	const ok = Object.keys;
	const tx = typeof x;
	const ty = typeof y;

	return x && y && tx === "object" && tx === ty ? (
		ok(x).length === ok(y).length && ok(x).every((key) => deepEqual(x[key], y[key]))
	) : (x === y);
};

export const getBookletStatus = (code) => BookletStatusArray
	.find((status) => status.code === code);

export const splitBySpace = (str) => str.split(/\s+/);

export const downloadFile = (data, filename, status, format, responseMessage) => {
	if (status === 200) {
		const fileExtension = format ? `.${format}` : "";
		const blob = new Blob([data], { type: data.type });
		const link = document.createElement("a");
		link.href = window.URL.createObjectURL(blob);
		link.download = `${filename}${fileExtension}`;
		link.click();
	} else {
		Notification(responseMessage, status === 400 ? "warning" : "error");
	}
};

export const getUniqueObjectsInArray = (filterData, filterBy) => filterData.filter(
	(filteredValue, index) => index === filterData.findIndex(
		(value) => filteredValue[filterBy] === value[filterBy],
	),
);

export const isDateBeforeOrEqual = (firstDate, secondDate) => (
	moment(firstDate) <= moment(secondDate)
);

export const isFirstDateAfterSecond = (firstDate, secondDate) => (
	moment(firstDate) > moment(secondDate)
);

export default {
	BookletStatusArray,
	copyObject,
	deepEqual,
	filterEmptyValues,
	replaceEmptyValuesWithNull,
	getUniqueObjectsInArray,
	getBookletStatus,
	splitBySpace,
	downloadFile,
	isDateBeforeOrEqual,
	isFirstDateAfterSecond,
};
