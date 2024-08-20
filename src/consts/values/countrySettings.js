const LIST_TYPE_CODE = "list";
const SINGLE_SELECT_CODE = "single_select";
const MULTI_SELECT_CODE = "multi_select";

export default {
	CUSTOM_FIELDS: {
		LIST_TYPE_CODE,
		SINGLE_SELECT_CODE,
		MULTI_SELECT_CODE,
		TYPES: [
			{
				code: "number",
				value: "Number",
			},
			{
				code: "text",
				value: "Text",
			},
			{
				code: LIST_TYPE_CODE,
				value: "List",
			},
		],
		TARGET_TYPES: [
			{
				code: "household",
				value: "Household",
				shortCut: "HH",
			},
			{
				code: "individual",
				value: "Individual",
				shortCut: "IND",
			},
		],
		SELECTION_TYPES: [
			{
				code: SINGLE_SELECT_CODE,
				value: "Single-select",
			},
			{
				code: MULTI_SELECT_CODE,
				value: "Multi-select",
			},
		],
		CUSTOM_FIELD_MODEL: {
			id: null,
			iso3: "",
			label: "",
			note: "",
			type: null,
			targetType: null,
			selectionType: null,
			isPropagatedToSelectionCriteria: false,
			listOfValues: [
				{ value: "" },
			],
		},
	},
	SCORING: {
		SCORING_MODEL: {
			name: "",
			note: "",
			dropFiles: [],
			content: "",
		},
	},
};
