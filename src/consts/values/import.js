export default {
	STATUS: {
		NEW: "New",
		UPLOADING: "Uploading",
		INTEGRITY_CHECK: "Integrity Checking",
		INTEGRITY_CHECK_CORRECT: "Integrity Check Correct",
		INTEGRITY_CHECK_FAILED: "Integrity Check Failed",
		IDENTITY_CHECK: "Identity Checking",
		IDENTITY_CHECK_CORRECT: "Identity Check Correct",
		IDENTITY_CHECK_FAILED: "Identity Check Failed",
		SIMILARITY_CHECK: "Similarity Checking",
		SIMILARITY_CHECK_CORRECT: "Similarity Check Correct",
		SIMILARITY_CHECK_FAILED: "Similarity Check Failed",
		FINISH: "Finished",
		CANCEL: "Canceled",
		AUTOMATICALLY_CANCELED: "Automatically Canceled",
		IMPORTING: "Importing",
	},
	ITEM_STATUS: {
		TO_CREATE: "To Create",
		TO_UPDATE: "To Update",
		TO_LINK: "To Link",
		TO_IGNORE: "To Ignore",
	},
	ITEM_STATE: {
		DUPLICITY_KEEP_THEIRS: "Duplicity Keep Theirs",
		DUPLICITY_KEEP_OURS: "Duplicity Keep Ours",
		DUPLICITY_CANDIDATE: "Duplicity Candidate",
	},
	FILTERS: {
		NEW: "New",
		IN_PROGRESS: "In Progress",
		FINISHED: "Finished",
		CANCELED: "Canceled",
	},
	SUPPORT_CSV_XLSX_XLS_FILES: "text/csv,"
		+ " application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,"
		+ " application/vnd.ms-excel",
	FAIL_REASON: {
		BAD_VERSION: "Bad version",
	},
	STEPS_SLUG: {
		START: "start-import",
		INTEGRITY_CHECK: "integrity-check",
		IDENTITY_CHECK: "identity-check",
		FINALISATION: "finalisation",
	},
};