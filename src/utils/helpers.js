import i18n from "@/plugins/i18n";

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
