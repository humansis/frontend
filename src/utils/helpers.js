import i18n from "@/plugins/i18n";

export const BookletStatusArray = [
	{ code: "0", value: i18n.t("Unassigned") },
	{ code: "1", value: i18n.t("Distributed") },
	{ code: "2", value: i18n.t("Used") },
	{ code: "3", value: i18n.t("Deactivated") },
];

export const getBookletStatus = (code) => BookletStatusArray
	.find((status) => status.code === code);

export const splitBySpace = (str) => str.split(/\s+/);

export default {
	BookletStatusArray,
	getBookletStatus,
	splitBySpace,
};
