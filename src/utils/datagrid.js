import i18n from "@/plugins/i18n";

const { global: { t } } = i18n;

export const kebabize = (text = "") => text
	.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())
	.replace(/( )/g, "-");

export const normalizeText = (text = "") => text
	.replace(/([A-Z])/g, " $1")
	.replace(/(_)/g, " ")
	.replace(/^.| ./g, (str) => str.toUpperCase());

export const normalizeSelectorValue = (text = "") => text
	.replace(/^.| ./g, (str) => str.toUpperCase());

export const normalizeCustomFields = (text = "") => text
	.replace(/([A-Z]+[A-Z])/g, " $1")
	.replace(/(_)/g, " ")
	.replace(/^.| ./g, (str) => str.toUpperCase());

export const normalizeProjectName = (text = "") => text
	.replace(/(_)/g, " ")
	.replace(/^.| ./g, (str) => str.toUpperCase());

export const normalizeFiltersOptions = (text = "") => text
	.replace(/([A-Z])/g, " $1")
	.replace(/ /g, "_")
	.toUpperCase();

export const normalizeExportDate = (date = new Date()) => date
	.toISOString().split("T")[0];

export const normalizeFirstLetter = (text = "") => text.replace(/^.| ./g, (str) => str.toUpperCase());

export const generateColumns = ((visibleColumns) => {
	const preparedColumns = [];

	visibleColumns.forEach(
		({ key, title, type, sortKey, customTags, sortable, minWidth, value, visible }) => {
			const preparedTitle = title ? t(title) : t(normalizeText(key));

			preparedColumns.push({
				key,
				title: preparedTitle,
				type,
				sortKey,
				customTags,
				sortable,
				minWidth,
				value,
				visible,
			});
		},
	);

	return preparedColumns.filter((column) => column.visible !== false);
});

export default {
	kebabize,
	normalizeText,
	normalizeSelectorValue,
	normalizeProjectName,
	normalizeFirstLetter,
	generateColumns,
};
