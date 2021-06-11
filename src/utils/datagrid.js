import i18n from "@/plugins/i18n";

export const normalizeText = (text = "") => text
	.replace(/([A-Z])/g, " $1")
	.replace(/(_)/g, " ")
	.replace(/^.| ./g, (str) => str.toUpperCase());

export const normalizeCountrySpecifics = (text = "") => text
	.replace(/([A-Z]+[A-Z])/g, " $1")
	.replace(/(_)/g, " ")
	.replace(/^.| ./g, (str) => str.toUpperCase());

export const normalizeProjectName = (text = "") => text
	.replace(/(_)/g, " ")
	.replace(/^.| ./g, (str) => str.toUpperCase());

export const generateColumns = ((visibleColumns) => {
	const preparedColumns = [];
	visibleColumns.forEach((column) => {
		preparedColumns.push({
			field: column.key,
			label: column.label
				? i18n.t(column.label) : i18n.t(normalizeText(column.key)),
			type: column.type,
			width: column.width,
			centered: false,
			sortable: column.sortable,
			attribute: column.attribute,
			visible: column.visible,
			customSort: column.customSort,
			customTags: column.customTags,
		});
	});
	return preparedColumns;
});

export default {
	normalizeText,
	normalizeProjectName,
	generateColumns,
};
