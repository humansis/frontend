const INDIVIDUAL = "0";
const HOUSEHOLD = "1";
const COMMUNITY = "2";
const INSTITUTION = "3";

const ACTIVITY = "activity";
const DISTRIBUTION = "distribution";

const SELECTION_CRITERIA = "selectionCriteria";
const DISTRIBUTED_COMMODITY = "distributedCommodity";
const COMMUNITIES = "communities";
const INSTITUTIONS = "institutions";
const ACTIVITY_DESCRIPTION = "activityDescription";
const HOUSEHOLD_TARGETED = "householdsTargeted";
const INDIVIDUALS_TARGETED = "individualsTargeted";

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
};
