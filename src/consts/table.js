export default {
	PER_PAGE_OPTIONS: [10, 20, 50, 100],
	DEFAULT_SORT_OPTIONS: {
		ASSISTANCES: { key: "dateDistribution", order: "desc" },
		PROJECTS: { key: "endDate", order: "desc" },
		ASSISTANCE_EDIT: {
			HOUSEHOLD: { key: "id", order: "desc" },
			INSTITUTION: { key: "id", order: "desc" },
		},
		INSTITUTIONS: { key: "id", order: "desc" },
	},
};
