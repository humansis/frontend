export const BookletStatusArray = [
	{ code: "0", value: "Unassigned" },
	{ code: "1", value: "Distributed" },
	{ code: "2", value: "Used" },
	{ code: "3", value: "Deactivated" },
];

export const getBookletStatus = (code) => BookletStatusArray
	.find((status) => status.code === code);

export default {
	BookletStatusArray,
	getBookletStatus,
};
