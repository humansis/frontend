// Targets
const INDIVIDUAL = "0";
const HOUSEHOLD = "1";
const COMMUNITY = "2";
const INSTITUTION = "3";

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
const SMARDCARD = "Smartcard";

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
	COMMODITY: {
		CASH,
		MOBILE_MONEY,
		SMARDCARD,
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
	},
};
