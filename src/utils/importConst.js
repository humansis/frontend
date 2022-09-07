// Import States
const INTEGRITY_CHECKING = "Integrity Checking";
const IDENTITY_CHECKING = "Identity Checking";
const SIMILARITY_CHECKING = "Similarity Checking";
const FINISHED = "Finished";
const CANCELED = "Canceled";
const IMPORTING = "Importing";

// Import Statuses
const NEW = "New";
const UPDATING = "UPDATING";
const INTEGRITY_CHECK = "Integrity Checking";
const INTEGRITY_CHECK_CORRECT = "Integrity Check Correct";
const INTEGRITY_CHECK_FAILED = "Integrity Check Failed";
const IDENTITY_CHECK = "Identity Checking";
const IDENTITY_CHECK_CORRECT = "Identity Check Correct";
const IDENTITY_CHECK_FAILED = "Identity Check Failed";
const SIMILARITY_CHECK = "Similarity Checking";
const SIMILARITY_CHECK_CORRECT = "Similarity Check Correct";
const SIMILARITY_CHECK_FAILED = "Similarity Check Failed";
const FINISH = "Finished";
const CANCEL = "Canceled";

// Import Item Statuses
const TO_CREATE = "To Create";
const TO_UPDATE = "To Update";
const TO_LINK = "To Link";
const TO_IGNORE = "To Ignore";

// Import Item State
const DUPLICITY_KEEP_THEIRS = "Duplicity Keep Theirs";
const DUPLICITY_KEEP_OURS = "Duplicity Keep Ours";

export default {
	STATE: {
		NEW,
		INTEGRITY_CHECKING,
		IDENTITY_CHECKING,
		SIMILARITY_CHECKING,
		IMPORTING,
		FINISHED,
		CANCELED,
	},
	STATUS: {
		NEW,
		UPDATING,
		INTEGRITY_CHECK,
		INTEGRITY_CHECK_CORRECT,
		INTEGRITY_CHECK_FAILED,
		IDENTITY_CHECK,
		IDENTITY_CHECK_CORRECT,
		IDENTITY_CHECK_FAILED,
		SIMILARITY_CHECK,
		SIMILARITY_CHECK_CORRECT,
		SIMILARITY_CHECK_FAILED,
		IMPORTING,
		FINISH,
		CANCEL,
	},
	ITEM_STATUS: {
		TO_CREATE,
		TO_UPDATE,
		TO_LINK,
		TO_IGNORE,
	},
	ITEM_STATE: {
		DUPLICITY_KEEP_THEIRS,
		DUPLICITY_KEEP_OURS,
	},
};
