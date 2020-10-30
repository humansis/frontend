export const normalizeText = (text = "") => text
	.replace(/([A-Z])/g, " $1")
	.replace(/(_)/g, " ")
	.replace(/^.| ./g, (str) => str.toUpperCase());

export const generateColumnsFromData = (data, visibleColumns = []) => Object.keys(
	data[0],
).map((key) => ({
	field: key,
	label: normalizeText(key),
	visible: (visibleColumns.length ? visibleColumns.includes(key) : true),
}));

export default {
	generateColumnsFromData,
	normalizeText,
};
