export default {
	STATUS: {
		NEW: "new",
		VALIDATED: "validated",
		CLOSED: "closed",
	},
	TARGET: {
		INDIVIDUAL: "individual",
		HOUSEHOLD: "household",
		COMMUNITY: "community",
		INSTITUTION: "institution",
	},
	TYPE: {
		ACTIVITY: "activity",
		DISTRIBUTION: "distribution",
	},
	COMPONENT: {
		SELECTION_CRITERIA: "selectionCriteria",
		DISTRIBUTED_COMMODITY: "distributedCommodity",
		COMMUNITIES: "communities",
		INSTITUTIONS: "institutions",
		ACTIVITY_DESCRIPTION: "activityDescription",
		HOUSEHOLD_TARGETED: "householdsTargeted",
		INDIVIDUALS_TARGETED: "individualsTargeted",
	},
	DEFAULT_FORM_MODEL: {
		modality: null,
		modalityType: null,
		division: null,
		unit: null,
		quantity: null,
		value: null,
		currency: null,
		secondUnit: null,
		secondQuantity: null,
		description: null,
		divisionNwsFields: [
			{
				rangeFrom: 1,
				rangeTo: 3,
				value: null,
			},
			{
				rangeFrom: 4,
				rangeTo: 5,
				value: null,
			},
			{
				rangeFrom: 6,
				rangeTo: 8,
				value: null,
			},
			{
				rangeFrom: 9,
				rangeTo: null,
				value: null,
			},
		],
		divisionNesFields: [
			{
				rangeFrom: 1,
				rangeTo: 3,
				value: null,
			},
			{
				rangeFrom: 4,
				rangeTo: 8,
				value: null,
			},
			{
				rangeFrom: 9,
				rangeTo: null,
				value: null,
			},
		],
		remoteDistributionAllowed: false,
		allowedProductCategoryTypes: ["Food"],
		cashbackLimit: null,
	},
	DEFAULT_DISPLAYED_FIELDS: {
		division: false,
		unit: false,
		quantity: false,
		value: false,
		currency: false,
		secondUnit: false,
		secondQuantity: false,
		description: false,
		customField: false,
		amountMultiplier: false,
		remoteDistributionAllowed: false,
		allowedProductCategoryTypes: false,
		householdMembersNwsFields: false,
		householdMembersNesFields: false,
		dateExpiration: false,
	},
	MODALITY: {
		CASH: "Cash",
		VOUCHER: "Voucher",
		IN_KIND: "In Kind",
		OTHER: "Other",
	},
	COMMODITY: {
		CASH: "Cash",
		MOBILE_MONEY: "Mobile Money",
		SMARTCARD: "Smartcard",
		FOOD_RATIONS: "Food Rations",
		READY_TO_EAT_RATIONS: "Ready to Eat Rations",
		BREAD: "Bread",
		AGRICULTURAL_KIT: "Agricultural Kit",
		WASH_KIT: "WASH Kit",
		SHELTER_TOOL_KIT: "Shelter tool kit",
		HYGIENE_KIT: "Hygiene kit",
		DIGNITY_KIT: "Dignity kit",
		NFI_KIT: "NFI Kit",
		WINTERIZATION_KIT: "Winterization Kit",
		ACTIVITY_ITEM: "Activity item",
		LOAN: "Loan",
		BUSINESS_GRANT: "Business Grant",
		QR_CODE_VOUCHER: "QR Code Voucher",
		PAPER_VOUCHER: "Paper Voucher",
		CASHBACK: "Cashback",
		DISTRIBUTION: {
			PER_HOUSEHOLD: "Per Household",
			PER_INDIVIDUAL: "Per Individual",
			PER_MEMBER_CODE: "Per Household Member",
			PER_MEMBER_LABEL: "Per Member (uniformly)",
			PER_MEMBERS_CODE: "Per Household Members",
			PER_MEMBERS_NWS_CODE: "Per Members NWS",
			PER_MEMBERS_NES_CODE: "Per Members NES",
			PER_MEMBERS_NWS_LABEL: "Per Members NWS (1-3, 4-5, 6-8, 9+)",
			PER_MEMBERS_NES_LABEL: "Per Members NES (1-3, 4-8, 9+)",
			PER_CUSTOM_AMOUNT_BY_CUSTOM_FIELD: "Per Custom Amount By Custom Field",
		},
	},
	FIELD_TYPE: {
		GENDER: "gender",
		DATE: "date",
		RESIDENCY_STATUS: "residencyStatus",
		BOOLEAN: "boolean",
		LIVELIHOOD: "livelihood",
		DOUBLE: "double",
		INTEGER: "integer",
		LOCATION: "location",
		LOCATION_TYPE: "locationType",
		STRING: "string",
	},
	ROUNDS_OPTIONS: [{ code: null, value: "N/A" }]
		.concat(
			Array.from(Array(100).keys()).slice(1, 100).map((num) => ({ code: num, value: num })),
		),
	INPUT_DISTRIBUTED: {
		IDS_LIST_MAX_LENGTH: 5000,
		DEFAULT_FORM_MODEL: {
			idType: null,
			idsList: "",
			justification: "",
		},
	},
	INTEGRITY_ISSUES: {
		HOUSEHOLD_WITHOUT_HEAD: "Household without head",
	},
	SEARCH_FIELDS: [
		{ code: "beneficiaryId", value: "BNF ID" },
		{ code: "familyName", value: "Local family name" },
		{ code: "nationalId", value: "ID Number" },
	],
	RELIEF_PACKAGES: {
		STATE: {
			DISTRIBUTED: "Distributed",
			TO_DISTRIBUTED: "To distributed",
		},
	},
};
