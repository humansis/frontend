export const normalizeText = (text) => text
	.replace(/([A-Z])/g, " $1")
	.replace(/(_)/g, " ")
	.replace(/^.| ./g, (str) => str.toUpperCase());

export const generateColumnsFromData = (data) => Object.keys(data[0]).map((key) => ({
	field: key,
	label: normalizeText(key),
}));

export default {
	generateColumnsFromData,
	normalizeText,
};
