import i18n from "@/plugins/i18n";
import { filtersToUri, idsToUri } from "@/utils/fetcher";

export const queryBuilder = (param) => {
	const { page, size, sort, search, filters, upcoming, ids, idsParam, format } = param;
	const query = [];

	if (page) { query.push(`page=${page}`); }
	if (size) { query.push(`size=${size}`); }
	if (sort) { query.push(`sort[]=${sort}`); }
	if (search) { query.push(`filter[fulltext]=${search}`); }
	if (filters) { query.push(filtersToUri(filters)); }
	if (upcoming) { query.push(`upcoming=${upcoming}`); }
	if (ids && ids.length) { query.push(idsToUri(ids, idsParam)); }
	if (format) { query.push(`type=${format}`); }

	return query.length ? `?${query.join("&")}` : "";
};

export const BookletStatusArray = [
	{ code: "0", value: i18n.t("Unassigned") },
	{ code: "1", value: i18n.t("Distributed") },
	{ code: "2", value: i18n.t("Used") },
	{ code: "3", value: i18n.t("Deactivated") },
];

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

export default {
	BookletStatusArray,
	copyObject,
	deepEqual,
	getBookletStatus,
	splitBySpace,
};
