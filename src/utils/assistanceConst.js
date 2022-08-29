// Targets
const INDIVIDUAL = "individual";
const HOUSEHOLD = "household";
const COMMUNITY = "community";
const INSTITUTION = "institution";

// Target types
const ACTIVITY = "activity";
const DISTRIBUTION = "distribution";

// AddAssistance components
const SELECTION_CRITERIA = "selectionCriteria";
const DISTRIBUTED_COMMODITY = "distributedCommodity";
const COMMUNITIES = "communities";
const INSTITUTIONS = "institutions";
const ACTIVITY_DESCRIPTION = "activityDescription";
const HOUSEHOLD_TARGETED = "householdsTargeted";
const INDIVIDUALS_TARGETED = "individualsTargeted";

// Commodities
const CASH = "Cash";
const MOBILE_MONEY = "Mobile Money";
const SMARTCARD = "Smartcard";

const FOOD_RATIONS = "Food Rations";
const READY_TO_EAT_RATIONS = "Ready to Eat Rations";
const BREAD = "Bread";
const AGRICULTURAL_KIT = "Agricultural Kit";
const WASH_KIT = "WASH Kit";
const SHELTER_TOOL_KIT = "Shelter tool kit";
const HYGIENE_KIT = "Hygiene kit";
const DIGNITY_KIT = "Dignity kit";
const NFI_KIT = "NFI Kit";
const WINTERIZATION_KIT = "Winterization Kit";
const ACTIVITY_ITEM = "Activity item";

const LOAN = "Loan";
const BUSINESS_GRANT = "Business Grant";

const QR_CODE_VOUCHER = "QR Code Voucher";
const PAPER_VOUCHER = "Paper Voucher";

// Distribution types
const PER_HOUSEHOLD = "Per Household";
const PER_MEMBER_CODE = "Per Household Member";
const PER_MEMBER_LABEL = "Per Member";
const PER_MEMBERS_CODE = "Per Household Members";
const PER_MEMBERS_NWS_CODE = "Per Members NWS";
const PER_MEMBERS_NES_CODE = "Per Members NES";
const PER_MEMBERS_NWS_LABEL = "Per Members NWS (1-3, 4-5, 6-8, 9+)";
const PER_MEMBERS_NES_LABEL = "Per Members NES (1-3, 4-8, 9+)";

// Division quantities
const DIVISION_NWS_QUANTITIES = [
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
];

const DIVISION_NES_QUANTITIES = [
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
];

// Create a new criteria - fields types
const GENDER = "gender";
const DATE = "date";
const RESIDENCY_STATUS = "residencyStatus";
const BOOLEAN = "boolean";
const LIVELIHOOD = "livelihood";
const DOUBLE = "double";
const INTEGER = "integer";
const LOCATION = "location";
const LOCATION_TYPE = "locationType";
const STRING = "string";

// Rounds options
// ROUNDS_OPTIONS = [{ code: n, value: n },...]
const ROUNDS_OPTIONS = Array.from(Array(100).keys()).slice(1, 100)
	.map((num) => ({ code: num, value: num }));

export default {
	TARGET: {
		INSTITUTION,
		HOUSEHOLD,
		COMMUNITY,
		INDIVIDUAL,
	},
	TYPE: {
		ACTIVITY,
		DISTRIBUTION,
	},
	COMPONENT: {
		SELECTION_CRITERIA,
		DISTRIBUTED_COMMODITY,
		COMMUNITIES,
		INSTITUTIONS,
		ACTIVITY_DESCRIPTION,
		HOUSEHOLD_TARGETED,
		INDIVIDUALS_TARGETED,
	},
	DIVISION_NWS_QUANTITIES,
	DIVISION_NES_QUANTITIES,
	COMMODITY: {
		CASH,
		MOBILE_MONEY,
		SMARTCARD,
		FOOD_RATIONS,
		READY_TO_EAT_RATIONS,
		BREAD,
		AGRICULTURAL_KIT,
		WASH_KIT,
		SHELTER_TOOL_KIT,
		HYGIENE_KIT,
		DIGNITY_KIT,
		NFI_KIT,
		WINTERIZATION_KIT,
		ACTIVITY_ITEM,
		LOAN,
		BUSINESS_GRANT,
		QR_CODE_VOUCHER,
		PAPER_VOUCHER,
		DISTRIBUTION: {
			PER_HOUSEHOLD,
			PER_MEMBER_CODE,
			PER_MEMBER_LABEL,
			PER_MEMBERS_CODE,
			PER_MEMBERS_NWS_CODE,
			PER_MEMBERS_NWS_LABEL,
			PER_MEMBERS_NES_CODE,
			PER_MEMBERS_NES_LABEL,
		},
	},
	FIELD_TYPE: {
		GENDER,
		DATE,
		RESIDENCY_STATUS,
		BOOLEAN,
		LIVELIHOOD,
		DOUBLE,
		INTEGER,
		LOCATION,
		LOCATION_TYPE,
		STRING,
	},
	ROUNDS_OPTIONS,
};
