// States
const INTEGRITY_CHECKING = "Integrity Checking";
const IDENTITY_CHECKING = "Identity Checking";
const SIMILARITY_CHECKING = "Similarity Checking";
const FINISHED = "Finished";
const CANCELED = "Canceled";

// Statuses
const NEW = "New";
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

export default {
	STATE: {
		INTEGRITY_CHECKING,
		IDENTITY_CHECKING,
		SIMILARITY_CHECKING,
		FINISHED,
		CANCELED,
	},
	STATUS: {
		NEW,
		INTEGRITY_CHECK,
		INTEGRITY_CHECK_CORRECT,
		INTEGRITY_CHECK_FAILED,
		IDENTITY_CHECK,
		IDENTITY_CHECK_CORRECT,
		IDENTITY_CHECK_FAILED,
		SIMILARITY_CHECK,
		SIMILARITY_CHECK_CORRECT,
		SIMILARITY_CHECK_FAILED,
		FINISH,
		CANCEL,
	},
};
